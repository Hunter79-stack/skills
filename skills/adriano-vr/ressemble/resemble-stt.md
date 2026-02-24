---
name: resemble-stt
description: Transcribe audio using Resemble AI.
metadata:
  clawdbot:
    emoji: "🎤"
    requires:
      env: ["RESEMBLE_API_KEY"]
    primaryEnv: "RESEMBLE_API_KEY"
    type: http
    http:
      method: POST
      url: https://app.resemble.ai/api/v2/speech-to-text
      headers:
        Authorization: "Bearer {{RESEMBLE_API_KEY}}"
      multipart:
        file: "{{audio}}"
      polling:
        url: https://app.resemble.ai/api/v2/speech-to-text/{{response.id}}
        interval: 2
        until: "status == 'completed'"
      response:
        textField: "transcript"
---
