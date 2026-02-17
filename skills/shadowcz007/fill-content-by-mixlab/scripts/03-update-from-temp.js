#!/usr/bin/env node

/**
 * 从 temp 文件读取内容并更新到 mixdao
 * 读取 temp/{cachedStoryId}.txt，批量 PATCH（body: { items: [{ cachedStoryId, content }, ...] }）
 *
 * 用法: node scripts/03-update-from-temp.js list <temp/fill-content-{date}.json>   # 列出待更新（必须传 JSON）
 *       node scripts/03-update-from-temp.js <id1> [<id2> ...]                      # 批量更新指定的一条或多条（必须传至少一个 id）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://www.mixdao.world/api/latest/recommendation';
const tempDir = path.join(__dirname, '..', 'temp');
const BATCH_SIZE = 50; // 单次 PATCH 最多条数，与 recommendation 接口一致

/** 批量 PATCH：body 为 { items: [{ cachedStoryId, content }, ...] }，返回 { ok, results: [{ cachedStoryId, ok }, ...] } */
function batchUpdateContent(items) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.MIXDAO_API_KEY;
    if (!apiKey) {
      reject(new Error('MIXDAO_API_KEY is not set.'));
      return;
    }
    if (!items.length) {
      resolve({ ok: true, results: [] });
      return;
    }

    const url = new URL(API_URL);
    const body = JSON.stringify({ items });

    const opts = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body, 'utf8'),
      },
    };

    const req = https.request(opts, (res) => {
      res.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('API 请求超时'));
      });
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(responseBody || '{}');
            resolve(data);
          } catch (e) {
            resolve({ ok: true, results: [] });
          }
        } else {
          reject(new Error(`API returned ${res.statusCode}: ${responseBody.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body, 'utf8');
    req.end();
  });
}

/** 从 temp 目录读取并校验，返回可提交的 items: [{ cachedStoryId, content }, ...]，无效的会打 log 并跳过 */
function collectItems(ids) {
  const items = [];
  const minContentLen = 50;
  for (const id of ids) {
    const cachedStoryId = id.trim();
    const tempFile = path.join(tempDir, `${cachedStoryId}.txt`);
    if (!fs.existsSync(tempFile)) {
      console.error(`[SKIP] temp/${cachedStoryId}.txt 不存在`);
      continue;
    }
    const content = fs.readFileSync(tempFile, 'utf8');
    if (!content || content.trim().length < minContentLen) {
      console.error(`[SKIP] 内容太短: ${cachedStoryId} (${(content || '').length} 字符)`);
      continue;
    }
    items.push({ cachedStoryId, content });
  }
  return items;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('用法:');
    console.error('  node scripts/03-update-from-temp.js list <temp/fill-content-{date}.json>   # 列出待更新（必须传 JSON）');
    console.error('  node scripts/03-update-from-temp.js <id1> [<id2> ...]                    # 更新指定的一条或多条（必须传至少一个 id）');
    process.exit(1);
  }

  const command = args[0];

  // list：必须传 JSON 路径，输出 title/translatedTitle/text 与正文摘要供 Agent 做语义判断
  if (command === 'list') {
    const jsonPath = args[1];
    if (!jsonPath) {
      console.error('[ERROR] list 模式必须传入 JSON 文件路径（步骤 1 输出的 fill-content-{date}.json）');
      console.error('示例: node scripts/03-update-from-temp.js list temp/fill-content-2026-02-17.json');
      process.exit(1);
    }
    if (!fs.existsSync(jsonPath)) {
      console.error(`[ERROR] 文件不存在: ${jsonPath}`);
      process.exit(1);
    }
    let metaById;
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const items = data.items || [];
      metaById = Object.fromEntries(items.map(it => [it.cachedStoryId, it]));
    } catch (e) {
      console.error(`[ERROR] 无法解析 JSON: ${e.message}`);
      process.exit(1);
    }
    if (!fs.existsSync(tempDir)) {
      console.log('暂无待更新的内容（temp 目录不存在或为空）');
      return;
    }

    const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.txt'));
    console.log(`共 ${files.length} 条待更新:\n`);
    const TEXT_MAX = 200;
    const PREVIEW_MAX = 300;

    files.forEach(f => {
      const cachedStoryId = f.replace('.txt', '');
      const content = fs.readFileSync(path.join(tempDir, f), 'utf8');
      const meta = metaById[cachedStoryId];
      if (meta) {
        const title = (meta.title || '').slice(0, TEXT_MAX);
        const translatedTitle = (meta.translatedTitle || '').slice(0, TEXT_MAX);
        const text = (meta.text || '').slice(0, TEXT_MAX);
        const preview = content.trim().slice(0, PREVIEW_MAX);
        console.log('---');
        console.log(`cachedStoryId: ${cachedStoryId}`);
        console.log(`title: ${title}`);
        console.log(`translatedTitle: ${translatedTitle}`);
        console.log(`text: ${text}`);
        console.log(`contentLength: ${content.length}`);
        console.log(`contentPreview: ${preview}${content.length > PREVIEW_MAX ? '...' : ''}`);
      } else {
        console.log(`- ${cachedStoryId} (${content.length} 字符) [无元数据，不在本次 JSON 中]`);
      }
    });
    console.log('---');
    console.log('（以上含 title/translatedTitle/text 与正文摘要，供 Agent 判断是否与文章主题一致）');
    return;
  }

  // 更新：必须传至少一个 id（Agent 判断后传入要更新的 id 列表），批量 PATCH
  const ids = args.filter(a => a.trim().length > 0);
  if (ids.length === 0) {
    console.error('[ERROR] 更新模式必须传入至少一个 cachedStoryId');
    console.error('示例: node scripts/03-update-from-temp.js cmlpr8xsb005al70adaskpzl4 cmlpr8xd7002jl70ax1ytgrrt');
    process.exit(1);
  }
  const items = collectItems(ids);
  if (items.length === 0) {
    console.error('[ERROR] 没有可更新的条目（文件缺失或内容过短）');
    process.exit(1);
  }
  console.log(`共 ${ids.length} 个 id，有效 ${items.length} 条，批量提交\n`);
  let success = 0;
  let failed = 0;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    try {
      const data = await batchUpdateContent(chunk);
      const results = data.results || [];
      for (const r of results) {
        if (r.ok) {
          success++;
          console.log(`[OK] ${r.cachedStoryId}`);
        } else {
          failed++;
          console.error(`[FAIL] ${r.cachedStoryId}`);
        }
      }
    } catch (err) {
      console.error(`[ERROR] 批量请求失败: ${err.message}`);
      failed += chunk.length;
    }
  }
  console.log(`\n===== 完成 =====`);
  console.log(`成功: ${success}`);
  console.log(`失败: ${failed}`);
}

main().catch(console.error);
