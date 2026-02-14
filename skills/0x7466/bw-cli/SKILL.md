---
name: bw-cli
description: Interact with Bitwarden password manager using the bw CLI. Covers authentication (login/unlock/logout/status), vault operations (list/get/create/edit/delete/restore items, folders, attachments, collections), password/passphrase generation, organization management, and Send/receive. Use for "bitwarden", "bw", "password safe", "vaultwarden", "vault", "password manager", "generate password", "get password", "unlock vault", "share send".
metadata:
  author: tfm
  version: "1.4.0"
  docs: https://bitwarden.com/help/cli/
  docs-md: https://bitwarden.com/help/cli.md
---

# Bitwarden CLI

Complete reference for interacting with Bitwarden via the command-line interface.

**Official documentation:** https://bitwarden.com/help/cli/  
**Markdown version (for agents):** https://bitwarden.com/help/cli.md

## Quick Reference

### Installation

```bash
# Native executable (recommended)
# https://bitwarden.com/download/?app=cli

# npm
npm install -g @bitwarden/cli

# Linux package managers
choco install bitwarden-cli  # Windows via Chocolatey
snap install bw              # Linux via Snap
```

### Authentication Flow

```bash
# 1. Login (creates local vault copy)
bw login                     # Interactive login
bw login --apikey           # API key login
bw login --sso              # SSO login

# 2. Unlock (generates session key)
bw unlock                    # Interactive unlock
bw unlock --passwordenv BW_PASSWORD     # From env
bw unlock --passwordfile ~/.secrets     # From file

# 3. Export session key (copy output to shell)
export BW_SESSION="..."

# 4. Sync before any vault operation
bw sync

# 5. End session
bw lock                      # Lock (keep login)
bw logout                    # Complete logout
```

## Session & Configuration Commands

### status

Check authentication and vault status:

```bash
bw status
```

Returns: `unauthenticated`, `locked`, or `unlocked`.

### config

Configure CLI settings:

```bash
# Set server (self-hosted or regional)
bw config server https://vault.example.com
bw config server https://vault.bitwarden.eu   # EU cloud
bw config server                              # Check current

# Individual service URLs
bw config server --web-vault <url> --api <url> --identity <url>
```

### sync

Sync local vault with server (always run before vault operations):

```bash
bw sync                     # Full sync
bw sync --last             # Show last sync timestamp
```

### update

Check for updates (does not auto-install):

```bash
bw update
```

### serve

Start REST API server:

```bash
bw serve --port 8087 --hostname localhost
```

## Vault Item Commands

### list

List vault objects:

```bash
# Items
bw list items
bw list items --search github
bw list items --folderid <id> --collectionid <id>
bw list items --url https://example.com
bw list items --trash                        # Items in trash

# Folders
bw list folders

# Collections
bw list collections                          # All collections
bw list org-collections --organizationid <id>  # Org collections

# Organizations
bw list organizations
bw list org-members --organizationid <id>
```

### get

Retrieve single values or items:

```bash
# Get specific fields (by name or ID)
bw get password "GitHub"
bw get username "GitHub"
bw get totp "GitHub"                         # 2FA code
bw get notes "GitHub"
bw get uri "GitHub"

# Get full item JSON
bw get item "GitHub"
bw get item <uuid> --pretty

# Other objects
bw get folder <id>
bw get collection <id>
bw get organization <id>
bw get org-collection <id> --organizationid <id>

# Templates for create operations
bw get template item
bw get template item.login
bw get template item.card
bw get template item.identity
bw get template item.securenote
bw get template folder
bw get template collection
bw get template item-collections

# Security
bw get fingerprint <user-id>
bw get fingerprint me
bw get exposed <password>                    # Check if password is breached

# Attachments
bw get attachment <filename> --itemid <id> --output /path/
```

### create

Create new objects:

```bash
# Create folder
bw get template folder | jq '.name="Work"' | bw encode | bw create folder

# Create login item
bw get template item | jq \
  '.name="Service" | .login=$(bw get template item.login | jq '.username="user@example.com" | .password="secret"')' \
  | bw encode | bw create item

# Create secure note (type=2)
bw get template item | jq \
  '.type=2 | .secureNote.type=0 | .name="Note" | .notes="Content"' \
  | bw encode | bw create item

# Create card (type=3)
bw get template item | jq \
  '.type=3 | .name="My Card" | .card=$(bw get template item.card | jq '.number="4111..."')' \
  | bw encode | bw create item

# Create identity (type=4)
bw get template item | jq \
  '.type=4 | .name="My Identity" | .identity=$(bw get template item.identity)' \
  | bw encode | bw create item

# Create SSH key (type=5)
bw get template item | jq \
  '.type=5 | .name="My SSH Key"' \
  | bw encode | bw create item

# Attach file to existing item
bw create attachment --file ./doc.pdf --itemid <uuid>
```

Item types: `1=Login`, `2=Secure Note`, `3=Card`, `4=Identity`, `5=SSH Key`.

### edit

Modify existing objects:

```bash
# Edit item
bw get item <id> | jq '.login.password="newpass"' | bw encode | bw edit item <id>

# Edit folder
bw get folder <id> | jq '.name="New Name"' | bw encode | bw edit folder <id>

# Edit item collections
 echo '["collection-uuid"]' | bw encode | bw edit item-collections <item-id> --organizationid <id>

# Edit org collection
bw get org-collection <id> --organizationid <id> | jq '.name="New Name"' | bw encode | bw edit org-collection <id> --organizationid <id>
```

### delete

Remove objects:

```bash
# Send to trash (recoverable 30 days)
bw delete item <id>
bw delete folder <id>
bw delete attachment <id> --itemid <id>
bw delete org-collection <id> --organizationid <id>

# Permanent delete (irreversible!)
bw delete item <id> --permanent
```

### restore

Recover from trash:

```bash
bw restore item <id>
```

## Password Generation

### generate

Generate passwords or passphrases:

```bash
# Password (default: 14 chars)
bw generate
bw generate --uppercase --lowercase --number --special --length 20
bw generate -ulns --length 32

# Passphrase
bw generate --passphrase --words 4 --separator "-" --capitalize --includeNumber
```

## Send Commands (Secure Sharing)

### send

Create ephemeral shares:

```bash
# Text Send
bw send -n "Secret" -d 7 --hidden "This text vanishes in 7 days"

# File Send
bw send -n "Doc" -d 14 -f /path/to/file.pdf

# Advanced options
bw send --password accesspass -f file.txt
```

### receive

Access received Sends:

```bash
bw receive <url> --password <pass>
```

## Organization Commands

### move

Share items to organization:

```bash
echo '["collection-uuid"]' | bw encode | bw move <item-id> <organization-id>
```

### confirm

Confirm invited members:

```bash
bw get fingerprint <user-id>
bw confirm org-member <user-id> --organizationid <id>
```

### device-approval

Manage device approvals:

```bash
bw device-approval list --organizationid <id>
bw device-approval approve <request-id> --organizationid <id>
bw device-approval approve-all --organizationid <id>
bw device-approval deny <request-id> --organizationid <id>
bw device-approval deny-all --organizationid <id>
```

## Import & Export

### import

Import from other password managers:

```bash
bw import --formats                          # List supported formats
bw import lastpasscsv ./export.csv
bw import bitwardencsv ./import.csv --organizationid <id>
```

### export

Export vault data:

```bash
bw export                                    # CSV format
bw export --format json
bw export --format encrypted_json
bw export --format encrypted_json --password <custom-pass>
bw export --format zip                       # Includes attachments
bw export --output /path/ --raw              # Output to file or stdout
bw export --organizationid <id> --format json
```

## Utilities

### encode

Base64 encode JSON for create/edit operations:

```bash
bw get template folder | jq '.name="Test"' | bw encode | bw create folder
```

### generate (password)

See [Password Generation](#password-generation).

### Global Options

Available on all commands:

```bash
--pretty                     # Format JSON output with tabs
--raw                        # Return raw output
--response                   # JSON formatted response
--quiet                      # No stdout (use for piping secrets)
--nointeraction             # Don't prompt for input
--session <key>             # Pass session key directly
--version                   # CLI version
--help                      # Command help
```

## Security Reference

### Secure Password Storage

If saving master password for automation:

```bash
# Create .secrets file
echo "BW_PASSWORD=your_password" > ~/.openclaw/workspace/.secrets
chmod 600 ~/.openclaw/workspace/.secrets

# Add to .gitignore
echo ".secrets" >> ~/.openclaw/workspace/.gitignore

# Usage
source ~/.openclaw/workspace/.secrets
bw unlock --passwordenv BW_PASSWORD
```

### Environment Variables

```bash
BW_CLIENTID                  # API key client_id
BW_CLIENTSECRET              # API key client_secret
BW_PASSWORD                  # Master password for unlock
BW_SESSION                   # Session key (auto-used by CLI)
BITWARDENCLI_DEBUG=true      # Enable debug output
NODE_EXTRA_CA_CERTS          # Self-signed certs path
BITWARDENCLI_APPDATA_DIR     # Custom config directory
```

### Two-Step Login Methods

Method values: `0=Authenticator`, `1=Email`, `3=YubiKey`.

```bash
bw login user@example.com password --method 0 --code 123456
```

### URI Match Types

Values: `0=Domain`, `1=Host`, `2=Starts With`, `3=Exact`, `4=Regex`, `5=Never`.

### Field Types

Values: `0=Text`, `1=Hidden`, `2=Boolean`.

### Organization User Types

`0=Owner`, `1=Admin`, `2=User`, `3=Manager`, `4=Custom`.

### Organization User Statuses

`0=Invited`, `1=Accepted`, `2=Confirmed`, `-1=Revoked`.

## Best Practices

1. **Always sync**: Run `bw sync` before any vault operation
2. **Secure session**: Use `bw lock` when done
3. **Protect secrets**: Never log BW_SESSION
4. **Password files**: Use mode 600 for password files
5. **Verify fingerprints**: Before confirming org members

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Bot detected" | Use `--apikey` or provide `client_secret` |
| "Vault is locked" | Run `bw unlock` and export BW_SESSION |
| Self-signed cert error | Set `NODE_EXTRA_CA_CERTS` |
| Need debug info | `export BITWARDENCLI_DEBUG=true` |

---

**References:**
- HTML documentation: https://bitwarden.com/help/cli/
- Markdown (fetchable): https://bitwarden.com/help/cli.md
