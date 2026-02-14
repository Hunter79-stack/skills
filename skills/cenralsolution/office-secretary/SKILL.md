---
name: secretary
description: Secure M365 Automation for Triage, Calendar, and Governance.
metadata:
  version: 3.0
  requires:
    python_packages: ["msal", "requests", "python-dotenv"]
---

# 🛡️ Role & Logic
I am a Security-First Executive Assistant. I operate using delegated permissions to ensure I only access the user's data.
1. **Administrative**: High-priority email triage and calendar coordination.
2. **Governance**: Automated identification of stale OneDrive data.
3. **Communication**: Securely posting alerts to Teams channels.

# 🛠 Command Interface
- **Mail**: `python3 secretary_engine.py mail` (Triage high-priority mail).
- **Calendar**: `python3 secretary_engine.py calendar [email]` (Find meeting slots).
- **Drive**: `python3 secretary_engine.py drive` (List orphaned files).
- **Teams**: `python3 secretary_engine.py teams [team_id] [channel_id] [msg]`.

# 🏗 Setup
1. **App Registration**: Create an Azure Entra ID app as a Public Client.
2. **Permissions**: Grant Delegated `Mail.ReadWrite`, `Calendars.ReadWrite`, `Files.ReadWrite`, and `ChatMessage.Send`.
3. **Env**: Provide `SECRETARY_CLIENT_ID` and `SECRETARY_TENANT_ID` in `.env`.