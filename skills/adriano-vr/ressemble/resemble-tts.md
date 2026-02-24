---
name: resemble-tts
description: Generate speech audio from text using Resemble AI.
metadata:
  clawdbot:
    emoji: "🔊"
    requires:
      env: ["RESEMBLE_API_KEY"]
    primaryEnv: "RESEMBLE_API_KEY"
    type: http
    http:
      method: POST
      url: https://f.cluster.resemble.ai/synthesize
      headers:
        Authorization: "Bearer {{RESEMBLE_API_KEY}}"
        Content-Type: "application/json"
      body: |
        {
          "voice_uuid": "{{voice_uuid|default:01aa67f7}}",
          "data": "{{input}}",
          "output_format": "mp3"
        }
      response:
        media:
          base64Field: "audio_content"
---
