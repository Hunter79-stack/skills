---
name: message-parser
description: Parse raw WhatsApp exports (TXT or JSON) into normalized message objects with `timestamp`, `sender`, and `content`. Use when chat dumps must be converted into deterministic structured data before lead extraction. Do not use for lead interpretation, storage, summarization, or action suggestions.
---

# Message Parser

Convert raw chat exports into a strict array of parsed message objects.

## Execute Workflow

1. Accept raw WhatsApp export input as plain text, JSON, or file contents already loaded by Supervisor.
2. Detect and parse the source format.
3. Normalize each event into exactly three fields:
   - `timestamp` (RFC 3339 date-time string)
   - `sender` (non-empty string)
   - `content` (string; allow empty message bodies)
4. Preserve message ordering. If timestamps collide, preserve original source order.
5. Validate output against `references/parsed-message-array.schema.json`.
6. Return only the validated array.

## Enforce Boundaries

- Never infer or extract leads.
- Never write to databases or files.
- Never generate summaries or action plans.
- Never send or schedule outbound communication.
- Never bypass Supervisor routing.

## Handle Errors

1. Return explicit parse errors for malformed entries.
2. Include line offsets when source lines are available.
3. Fail closed if output cannot satisfy the schema.
