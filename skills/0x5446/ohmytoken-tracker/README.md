# ohmytoken-tracker

> Watch your tokens burn, one bead at a time.

OpenClaw skill that automatically tracks your LLM token consumption and visualizes it as a colorful pixel bead board at [ohmytoken.dev](https://ohmytoken.dev).

## Install

```bash
openclaw skill install @ohmytoken/tracker
```

## Configure

Add your API key to `openclaw.json`:

```json
{
  "skills": {
    "ohmytoken-tracker": {
      "enabled": true,
      "config": {
        "api_key": "omt_your_key_here"
      }
    }
  }
}
```

Or set the environment variable:

```bash
export OHMYTOKEN_API_KEY=omt_your_key_here
```

## Get your API Key

1. Go to [ohmytoken.dev](https://ohmytoken.dev)
2. Sign in with Google or GitHub
3. Copy the API key from the welcome screen

## Features

- Zero-config after API key setup
- Tracks all models automatically
- Real-time bead board visualization
- Achievements, leaderboards, and gallery
- Share your unique token art

## Links

- [ohmytoken.dev](https://ohmytoken.dev) — Dashboard
- [API Docs](https://ohmytoken.dev/settings) — API reference
