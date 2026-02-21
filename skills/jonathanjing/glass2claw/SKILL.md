---
name: glass2claw
description: "A logic-based protocol for organizing life-captures into Notion. Provides structured guidance for routing images within your private OpenClaw messenger integrations."
metadata:
  {
    "openclaw":
      {
        "emoji": "👁️",
        "requires": { 
          "env": ["NOTION_API_KEY"]
        },
      },
  }
---

# glass2claw: The Vision Router Protocol

`glass2claw` provides a set of logical templates to help you organize visual information from mobile devices into structured Notion databases.

## 🏗️ Design Philosophy
This skill is **instruction-only**. It relies on the native capabilities of the OpenClaw platform to handle media and messaging. It focuses on:
- **Categorization**: Sorting images into Wine, Tea, or Contacts.
- **Context-Binding**: Using specific configuration files for database IDs.
- **Privacy**: Processing data within your private messenger context.

## 🚀 Configuration

### 1. Database Configuration
To prevent the Agent from searching your filesystem, please place your database IDs in a single, dedicated file: `configs/vision_router.md`.
```markdown
- Wine Cellar: [YOUR_DATABASE_ID]
- Tea Closet: [YOUR_DATABASE_ID]
```

### 2. Implementation
Apply the provided templates to your Agent prompts:
- **Routing Logic**: See `SAMPLE_AGENT.md` for a hub-and-spoke routing guide.
- **Specialist Personas**: See `SAMPLE_SOUL_WINE.md` for wine analysis guidance.

## 🛡️ Best Practices
- **Least Privilege**: Use a Notion token with access only to the required databases.
- **Secure Channels**: Always use private Discord servers or direct messages for sensitive life-logging.
- **Tooling**: This protocol assumes the use of standard, authorized platform tools for API interactions.

---
*Created by JonathanJing | AI Reliability Architect*
