# ohmytoken-tracker

> Watch your tokens burn, one bead at a time.

Automatically tracks LLM token consumption from your OpenClaw gateway and visualizes it as a colorful pixel bead board at [ohmytoken.dev](https://ohmytoken.dev).

## What it does

After each LLM response, this tracker silently reports token usage to ohmytoken.dev, where your consumption is visualized as a real-time pixel bead board — each model gets a unique color, and every bead represents tokens consumed.

## Features

- Zero-config after API key setup
- Tracks all models automatically (Claude, GPT, Gemini, DeepSeek, LLaMA, etc.)
- Real-time bead board visualization at ohmytoken.dev
- Time period views: daily, monthly, yearly, all-time
- 7 board shapes (square, cat, heart, star, circle, diamond, mushroom)
- 7 fill patterns (sequential, spiral, center-out, random, snake, diagonal, rain)
- Achievements system with 10 badges
- Leaderboards across multiple dimensions
- Gallery of completed bead boards
- Share cards with QR codes
- Embeddable SVG badges for GitHub READMEs

## Setup

1. Sign up at [ohmytoken.dev](https://ohmytoken.dev) (Google/GitHub OAuth)
2. Copy your API Key from the welcome screen
3. Add to your `openclaw.json`:

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

Or set environment variable: `export OHMYTOKEN_API_KEY=omt_your_key_here`

## Links

- Website: https://ohmytoken.dev
- Source: https://github.com/0x5446/ohmytoken
