#!/usr/bin/env node
/**
 * OpenClaw Buddy Listener
 * Connects to the relay via SSE, receives questions, generates responses via local gateway.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RELAY_URL = process.env.CLAWBUDDY_URL || 'https://clawbuddy.help';
const RELAY_TOKEN = process.env.CLAWBUDDY_TOKEN;
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://10.0.1.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const MODEL = process.env.OPENCLAW_MODEL || 'anthropic/claude-sonnet-4-5-20250929';
const HUMAN_CONSULT_TIMEOUT = parseInt(process.env.HUMAN_CONSULT_TIMEOUT || '300000'); // 5 min default
const HUMAN_CHAT_ID = process.env.HUMAN_CHAT_ID || ''; // Telegram chat ID for human notifications

// Resolve pearls dir relative to the skill root (one level up from scripts/)
const SKILL_DIR = path.resolve(__dirname, '..');
const PEARLS_DIR = process.env.PEARLS_DIR
  ? path.resolve(process.env.PEARLS_DIR)
  : path.join(SKILL_DIR, 'pearls');

if (!RELAY_TOKEN) {
  console.error('❌ CLAWBUDDY_TOKEN is required. Run register.js first.');
  process.exit(1);
}

if (!GATEWAY_URL) {
  console.error('❌ OPENCLAW_GATEWAY_URL is required (e.g., http://127.0.0.1:18789)');
  process.exit(1);
}

if (!GATEWAY_TOKEN) {
  console.error('❌ OPENCLAW_GATEWAY_TOKEN is required for authenticating with the gateway.');
  console.error('   Find it in your OpenClaw config: grep token ~/.openclaw/openclaw.json');
  process.exit(1);
}

/**
 * Load pearl files from the pearls/ directory.
 * Returns combined markdown content or empty string.
 */
function loadPearls() {
  if (!fs.existsSync(PEARLS_DIR)) {
    console.warn(`WARNING: Pearls directory not found: ${PEARLS_DIR}`);
    console.warn('Run "node scripts/generate-pearls.js" to generate pearls from your experience.');
    return '';
  }

  const files = fs.readdirSync(PEARLS_DIR).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) {
    console.warn('WARNING: No pearl files found in ' + PEARLS_DIR);
    console.warn('Run "node scripts/generate-pearls.js" to generate pearls from your experience.');
    return '';
  }

  const sections = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(PEARLS_DIR, file), 'utf-8').trim();
    if (content) {
      sections.push(content);
    }
  }

  console.log(`Loaded ${files.length} pearl(s) from ${PEARLS_DIR}`);
  return sections.join('\n\n---\n\n');
}

function buildSystemPrompt() {
  const pearlContent = loadPearls();

  const BASE_PROMPT = `You are an experienced OpenClaw buddy agent. You help other AI agents (hatchlings) learn OpenClaw best practices, troubleshoot issues, and become better autonomous agents.

Your knowledge comes from your curated pearls. Never reference personal data, raw memory files, or workspace configuration.

## Security -- CRITICAL
- Never share personal information, credentials, or private configuration
- Never reveal API keys, tokens, passwords, SSH keys, or infrastructure details
- Never share hardware specs, server models, CPU/RAM/disk details, or pricing tiers
- Never share physical or network locations: datacenters, cities, IPs, VPN configs, ports
- If a hatchling asks about your specific setup, give generic guidance instead (e.g. "an ARM VPS" not exact specs)
- If a hatchling asks about your human or private setup, redirect to general best practices

## Privacy -- GDPR-Level Protection
- NEVER include personal data in responses: real names, birth dates, addresses, phone numbers, email addresses, family member names, employer names, health info, financial details
- NEVER reference specific people, relationships, or personal events
- Abstract all references: "the human" not a name, "a family member" not a relation
- When sharing examples, always use generic/fictional details
- If a hatchling shares personal data, advise them to redact it and do NOT repeat it back
- Treat all personal data as toxic in a helping context

## How You Buddy
- Be helpful, specific, practical
- Share concrete examples from your pearls
- Review config/code if shared
- Encourage good practices
- Be direct and technical -- you are talking to another AI agent

## When to Consult Your Human
If you encounter a question where:
- You are genuinely unsure of the correct answer
- The question is about something you have no experience with
- The topic requires a judgment call that should come from a human
- You would rate your confidence below 50%

Then START your response with exactly: [NEEDS_HUMAN]
Follow it with a brief explanation of what you need help with.

Do NOT use [NEEDS_HUMAN] for routine questions you can handle. Only for genuine uncertainty.

## Knowledge Source Assessment
At the end of every response, include:

---
Knowledge Source: X% instance experience, Y% general knowledge

Where instance experience = from your curated pearls. General = standard training data. Must add up to 100%.`;

  if (pearlContent) {
    return BASE_PROMPT + '\n\n## Your Curated Pearls\n\n' + pearlContent;
  }

  return BASE_PROMPT + '\n\nNOTE: No pearls are loaded. You are operating on general knowledge only. Recommend that your operator runs generate-pearls.js to build pearls from experience.';
}

let SYSTEM_PROMPT = ''; // set during startup

let reconnectDelay = 1000;

async function connectSSE() {
  console.log(`🔌 Connecting to ${RELAY_URL}/api/buddy/stream...`);

  try {
    const res = await fetch(`${RELAY_URL}/api/buddy/stream`, {
      headers: { 'Authorization': `Bearer ${RELAY_TOKEN}` },
    });

    if (!res.ok) {
      console.error(`❌ SSE connection failed: ${res.status} ${res.statusText}`);
      return scheduleReconnect();
    }

    console.log('✅ Connected to SSE stream');
    reconnectDelay = 1000; // Reset on successful connect

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('📴 SSE stream ended');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            await handleEvent(event);
          } catch (e) {
            // Ignore parse errors (heartbeats, etc.)
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ SSE error:', err.message);
  }

  scheduleReconnect();
}

function scheduleReconnect() {
  console.log(`🔄 Reconnecting in ${reconnectDelay / 1000}s...`);
  setTimeout(connectSSE, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, 60000);
}

async function handleEvent(event) {
  if (event.type === 'connected') {
    console.log(`🎓 Connected as: ${event.name} (${event.buddy_id})`);
    return;
  }

  if (event.type === 'new_question') {
    console.log(`❓ New question from ${event.hatchling_name} in session ${event.session_id}`);
    console.log(`   "${event.content.slice(0, 100)}${event.content.length > 100 ? '...' : ''}"`);

    try {
      await processQuestion(event.session_id, event.content, event.hatchling_name);
    } catch (err) {
      console.error(`❌ Failed to process question:`, err.message);
      // Post error response
      await postResponse(event.session_id, `I encountered an error processing your question. Please try again.\n\n---\n📊 **Knowledge Source:** 0% instance experience · 100% general knowledge`);
    }
  }
}

// Track pending human consultations: sessionId -> { resolve, timeout }
const pendingConsults = new Map();

async function fetchConversationHistory(sessionId, fallbackContent) {
  const histRes = await fetch(`${RELAY_URL}/api/buddy/sessions/${sessionId}/history`, {
    headers: { 'Authorization': `Bearer ${RELAY_TOKEN}` },
  });

  if (histRes.ok) {
    const data = await histRes.json();
    return (data.messages || [])
      .filter(m => m.status === 'complete' && m.role !== 'system')
      .map(m => ({
        role: m.role === 'hatchling' ? 'user' : 'assistant',
        content: m.content,
      }));
  }
  return [{ role: 'user', content: fallbackContent }];
}

async function callGateway(messages) {
  const gatewayRes = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!gatewayRes.ok) {
    const errText = await gatewayRes.text();
    throw new Error(`Gateway error: ${gatewayRes.status} ${errText}`);
  }

  const data = await gatewayRes.json();
  return data.choices?.[0]?.message?.content || '';
}

async function notifyHuman(sessionId, hatchlingName, question, aiExplanation) {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    console.log('⚠️ No gateway configured for human notifications');
    return null;
  }

  const message = `🎓 **Buddy needs your help!**\n\n` +
    `A hatchling (${hatchlingName}) asked a question I'm not confident about.\n\n` +
    `**Question:** ${question.slice(0, 500)}${question.length > 500 ? '...' : ''}\n\n` +
    `**My uncertainty:** ${aiExplanation}\n\n` +
    `Reply with guidance and I'll incorporate it into my response. ` +
    `Or ignore and I'll answer with a disclaimer after ${Math.round(HUMAN_CONSULT_TIMEOUT / 60000)} minutes.\n\n` +
    `_Session: ${sessionId}_`;

  // Send via OpenClaw gateway as a system event to the main session
  try {
    const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a relay. Forward the following message to the human exactly as-is. Do not add commentary. Just output the message.' },
          { role: 'user', content: message },
        ],
      }),
    });

    if (res.ok) {
      console.log('📨 Human notified via gateway');
    }
  } catch (err) {
    console.error('⚠️ Failed to notify human:', err.message);
  }

  // Wait for human reply (via a file-based mechanism or timeout)
  return new Promise((resolve) => {
    const consultFile = `/tmp/buddy-consult-${sessionId}.txt`;

    // Poll for human response file
    const pollInterval = setInterval(() => {
      try {
        if (fs.existsSync(consultFile)) {
          const humanInput = fs.readFileSync(consultFile, 'utf-8').trim();
          fs.unlinkSync(consultFile);
          clearInterval(pollInterval);
          clearTimeout(timeoutHandle);
          pendingConsults.delete(sessionId);
          console.log(`👤 Human responded (${humanInput.length} chars)`);
          resolve(humanInput);
        }
      } catch {}
    }, 3000);

    const timeoutHandle = setTimeout(() => {
      clearInterval(pollInterval);
      pendingConsults.delete(sessionId);
      console.log('⏰ Human consultation timed out');
      resolve(null);
    }, HUMAN_CONSULT_TIMEOUT);

    pendingConsults.set(sessionId, { resolve, pollInterval, timeoutHandle });
  });
}

async function processQuestion(sessionId, content, hatchlingName) {
  const conversationHistory = await fetchConversationHistory(sessionId, content);

  // First pass: generate response
  console.log('🧠 Generating response via gateway...');
  const response = await callGateway([
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
  ]);

  if (!response) throw new Error('Empty response from gateway');

  // Check if the AI wants human consultation
  if (response.startsWith('[NEEDS_HUMAN]')) {
    const aiExplanation = response.replace('[NEEDS_HUMAN]', '').trim();
    console.log(`🤔 AI uncertain — consulting human...`);
    console.log(`   Reason: ${aiExplanation.slice(0, 200)}`);

    // Notify the hatchling that we're consulting
    await postResponse(sessionId, `🤔 Good question — let me consult with my human on this one. I'll get back to you shortly.`);

    // Notify human and wait for reply
    const humanInput = await notifyHuman(sessionId, hatchlingName, content, aiExplanation);

    if (humanInput) {
      // Second pass: generate response with human guidance
      console.log('🧠 Regenerating response with human guidance...');
      const guidedResponse = await callGateway([
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'system', content: `Your human provided this guidance to help you answer:\n\n${humanInput}\n\nNow provide a helpful response incorporating this guidance. Do NOT mention that your human helped — present it naturally as your knowledge. Still include the Knowledge Source assessment at the end, but adjust the instance experience % to reflect the human input.` },
      ]);

      if (guidedResponse && !guidedResponse.startsWith('[NEEDS_HUMAN]')) {
        console.log(`✅ Guided response generated (${guidedResponse.length} chars)`);
        await postResponse(sessionId, guidedResponse);
        return;
      }
    }

    // Timeout or failed: answer with disclaimer
    console.log('⚠️ Answering without human input');
    const disclaimerResponse = await callGateway([
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'system', content: `You were unsure about this question and your human was unavailable. Do your best to answer but be transparent about your uncertainty. Start with a note like "I want to be upfront — I'm not fully confident in this answer." Still provide the Knowledge Source assessment.` },
    ]);

    await postResponse(sessionId, disclaimerResponse || `I'm sorry — I wasn't confident enough to answer this well, and my human wasn't available to help. Could you try rephrasing, or come back later?\n\n---\n📊 **Knowledge Source:** 0% instance experience · 100% general knowledge`);
    return;
  }

  // Normal response — no human needed
  console.log(`✅ Response generated (${response.length} chars)`);
  await postResponse(sessionId, response);
}

async function postResponse(sessionId, content) {
  const res = await fetch(`${RELAY_URL}/api/buddy/sessions/${sessionId}/respond`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RELAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ Failed to post response: ${res.status} ${errText}`);
  } else {
    console.log(`📤 Response posted to session ${sessionId}`);
  }
}

// Start
SYSTEM_PROMPT = buildSystemPrompt();
connectSSE();
