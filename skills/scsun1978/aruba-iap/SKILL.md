---
name: aruba-iap
description: Aruba Instant AP (IAP/UAP) configuration, management, and troubleshooting. Use when configuring Aruba access points, managing wireless networks, or diagnosing IAP issues.
allowed-tools: Bash(iapctl:*)
---

# Aruba IAP Manager - iapctl

Aruba Instant AP (IAP) configuration management using iapctl CLI tool.

## What is iapctl?

iapctl is a stable, secure CLI tool for managing Aruba Instant Access Points (IAP) with:
- **Stable Connection**: Handles prompts, pagination, timeouts, and retries automatically
- **Standardized Output**: JSON + raw text logs for OpenClaw auditing/dashboard
- **Secure**: SSH key authentication, secret redaction, approval workflow
- **Complete Operations**: discover, snapshot, diff, apply, verify, rollback

## Quick Start

### Installation

```bash
# From skill directory
cd /Users/scsun/.openclaw/workspace/skills/aruba-iap
./install.sh
```

### Basic Usage

```bash
# Discover IAP cluster (auto-detects device mode)
iapctl discover --cluster office-iap --vc 192.168.20.56 --out ./out

# Take full configuration snapshot (uses device-mode-aware commands)
iapctl snapshot --cluster office-iap --vc 192.168.20.56 --out ./out
```

## Device Modes

iapctl automatically detects and adapts to three device modes:

### Virtual Controller (VC) Mode
- **Description**: Multi-AP cluster managed by a virtual controller
- **Detection**: Checks for "Virtual Controller" or "Master" role in version output, or multiple APs in database
- **Commands**: Uses `show` commands (e.g., `show ap database`, `show wlan`)

### Single-Node Cluster Mode
- **Description**: Single AP with virtual controller configuration (virtual-controller-key), operating as a minimal cluster
- **Detection**: Has virtual-controller-key in running config, but only 1-2 BSS entries (same AP, different radios)
- **Commands**: Uses Instant AP specific commands (e.g., `show ap bss-table`, `show ap association`)

### Standalone AP Mode
- **Description**: Single access point operating independently without VC configuration
- **Detection**: No VC role detected, no virtual-controller-key, only one AP present
- **Commands**: Uses direct commands (e.g., `show ap info`, `wlan`) with fallback to bss-table

### Device Mode Detection

iapctl automatically detects device mode in all operations using a multi-stage algorithm:

1. **Version parsing**: Checks for VC role indicators in `show version` output
2. **VC configuration check**: Scans running config for `virtual-controller-key`
3. **BSS table analysis**: Counts APs in BSS table to distinguish single-node from multi-node clusters
4. **Command adaptation**: Automatically adjusts commands based on detected mode

**Detection Logic**:
- VC keywords in version OR VC role command → **Virtual Controller** mode
- virtual-controller-key present AND >2 APs in BSS table → **Virtual Controller** mode
- virtual-controller-key present AND 1-2 APs in BSS table → **Single-Node Cluster** mode
- No VC configuration → **Standalone AP** mode

The device mode is reported in `result.json`:

```json
{
  "is_vc": false,
  "os_major": "8",
  "device_mode": "single-node-cluster",
  "role": "single-node-cluster",
  "ap_count": 2
}
```

### Command Mapping by Device Mode

| Operation | VC Mode Command | Single-Node Cluster | Standalone AP Command |
|-----------|----------------|-------------------|---------------------|
| AP Info | `show ap database` | `show ap bss-table` | `show ap info` (fallback to bss-table) |
| WLAN Info | `show wlan` | `show ap bss-table` | `wlan` (fallback to bss-table) |
| AP Group | `show ap-group` | N/A | N/A (not applicable) |
| Radio Info | `show ap radio` | `show ap radio` (if available) | `show radio` / `show radio info` |
| User Table | `show user-table` | `show user-table` | `show user-table` |
| Interface | `show interface` | `show interface` | `show interface` |
| Client Info | `show ap association` | `show ap association` | `show ap association` |
| Port Info | `show interface` | `show ap port` | `show interface` |

**Fallback Behavior**: If a command fails, iapctl automatically tries alternative commands:
- Parse error on VC commands → fallback to bss-table
- Parse error on standalone commands → fallback to bss-table
- All commands fail → graceful error with warning message

This ensures compatibility even when device mode detection is uncertain or when devices use non-standard command sets.

## Commands

### discover

Gather basic IAP cluster information.

**Device Mode Detection**: Automatically detects VC vs standalone mode and adapts commands accordingly.

```bash
iapctl discover --cluster <name> --vc <ip> --out <dir> [options]
```

**Options:**
- `--cluster`: Cluster name
- `--vc`: Virtual controller IP address
- `--out`: Output directory (default: ./out)
- `--ssh-host`: SSH host (default: vc)
- `--ssh-user`: SSH username (default: admin)
- `--ssh-password`: SSH password
- `--ssh-port`: SSH port (default: 22)
- `--ssh-config`: Path to SSH config file
- `--quiet`, `-q`: Quiet output

**Example:**
```bash
iapctl discover --cluster office-iap --vc 192.168.20.56 --out ./baseline
```

**Device Mode Output**:
- VC mode: Uses `show ap database` and `show ap-group` commands
- Standalone AP: Uses `show ap info` command with fallback to error message
- Result includes `is_vc` and `device_mode` fields in `result.json`

### snapshot

Take full configuration snapshot of IAP cluster.

**Device Mode Detection**: Automatically detects device mode and uses appropriate commands for each artifact.

```bash
iapctl snapshot --cluster <name> --vc <ip> --out <dir> [options]
```

**Options:** Same as discover

**Example:**
```bash
iapctl snapshot --cluster office-iap --vc 192.168.20.56 --out ./baseline
```

**Artifacts generated:**

| Artifact | VC Mode Command | Standalone AP Command |
|----------|----------------|---------------------|
| `raw/show_version.txt` | `show version` | `show version` |
| `raw/show_running-config.txt` | `show running-config` | `show running-config` |
| `raw/show_wlan.txt` | `show wlan` | `wlan` (with fallback) |
| `raw/show_ap_database.txt` | `show ap database` | `show ap info` (with fallback) |
| `raw/show_user-table.txt` | `show user-table` | `show user-table` |
| `raw/show_interface.txt` | `show interface` | `show interface` |
| `raw/show_radio.txt` | `show radio` | `show radio` |
| `result.json` | Structured result with device mode info | Structured result with device mode info |

**Device Mode in Result**:
```json
{
  "is_vc": true,
  "os_major": "8",
  "device_mode": "virtual-controller",
  "role": "virtual-controller"
}
```

### diff

Generate diff between current config and desired changes.

```bash
iapctl diff --cluster <name> --vc <ip> --in changes.json --out <dir>
```

### apply

Apply configuration changes.

```bash
iapctl apply --cluster <name> --vc <ip> --change-id <id> --in commands.json --out <dir>
```

**Note**: Requires OpenClaw approval.

### verify

Verify configuration state.

```bash
iapctl verify --cluster <name> --vc <ip> --level basic|full --expect expect.json --out <dir>
```

### rollback

Rollback to previous configuration.

```bash
iapctl rollback --cluster <name> --vc <ip> --from-change-id <id> --out <dir>
```

**Note**: Requires OpenClaw approval.

## Authentication

### SSH Key (Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/aruba_iap_key

# Add public key to IAP
ssh-copy-id -i ~/.ssh/aruba_iap_key.pub admin@<iap-ip>

# Configure in ~/.ssh/config
Host office-iap-vc
  HostName 192.168.20.56
  User admin
  IdentityFile ~/.ssh/aruba_iap_key
```

### Password

```bash
iapctl discover --cluster office-iap --vc 192.168.20.56 --ssh-password yourpassword
```

**Security Note**: Password is less secure than SSH key authentication. Use SSH keys when possible.

## Output Format

Every iapctl command generates:

1. **result.json** - Structured output (machine-readable)
2. **raw/*.txt** - Raw CLI outputs (human-auditable)

### result.json Structure

```json
{
  "ok": true,
  "action": "snapshot",
  "cluster": "office-iap",
  "vc": "192.168.20.56",
  "os_major": "8",
  "is_vc": true,
  "device_mode": "virtual-controller",
  "role": "virtual-controller",
  "artifacts": [
    {
      "name": "result.json",
      "path": "./out/snapshot/result.json",
      "size_bytes": 1024,
      "content_type": "application/json"
    }
  ],
  "checks": [],
  "warnings": [],
  "errors": [],
  "timing": {
    "total_seconds": 2.5,
    "steps": {
      "version": 0.3,
      "running_config": 0.8,
      "wlan": 0.4
    }
  },
  "timestamp": "2026-02-22T10:30:00.000Z"
}
```

**Device Mode Fields:**
- `is_vc`: Boolean indicating if device is a virtual controller
- `device_mode`: "virtual-controller" or "standalone"
- `role`: Device role (e.g., "virtual-controller", "standalone")

## OpenClaw Integration

### Allowlist

iapctl uses a very restrictive allowlist - only iapctl commands are allowed:

```json
{
  "allowedTools": [
    "Bash(iapctl:*)"
  ]
}
```

### Approvals

- **Require approval**: `apply`, `rollback` commands
- **Auto-approve**: `discover`, `snapshot`, `diff`, `verify` commands

### Workflow Example

```bash
# 1. Take baseline snapshot (auto-detects device mode)
iapctl snapshot --cluster office-iap --vc 192.168.20.56 --out ./baseline

# 2. Generate diff (OpenClaw generates changes.json)
iapctl diff --cluster office-iap --vc 192.168.20.56 --in changes.json --out ./diff

# 3. Review diff output and approve (OpenClaw approval flow)

# 4. Apply changes
iapctl apply --cluster office-iap --vc 192.168.20.56 --change-id chg_20260222_0001 --in ./diff/commands.json --out ./apply

# 5. Verify
iapctl verify --cluster office-iap --vc 192.168.20.56 --level basic --expect ./diff/expect.json --out ./verify
```

## Examples

### Virtual Controller Example

```bash
# Discover VC cluster
iapctl discover --cluster office-iap --vc 192.168.20.56 --out ./discover

# Check device mode in result.json
cat ./discover/result.json | jq '.is_vc, .device_mode, .role'
# Output: true, "virtual-controller", "virtual-controller"

# Snapshot VC cluster
iapctl snapshot --cluster office-iap --vc 192.168.20.56 --out ./snapshot

# Review AP database (shows multiple APs)
cat ./snapshot/raw/show_ap_database.txt
```

### Standalone AP Example

```bash
# Discover standalone AP
iapctl discover --cluster home-ap --vc 192.168.20.10 --out ./discover

# Check device mode in result.json
cat ./discover/result.json | jq '.is_vc, .device_mode, .role'
# Output: false, "standalone", "standalone"

# Snapshot standalone AP
iapctl snapshot --cluster home-ap --vc 192.168.20.10 --out ./snapshot

# Review AP info (shows single AP)
cat ./snapshot/raw/show_ap_database.txt
# Note: File contains output from 'show ap info' command

# Review WLAN config (uses 'wlan' command)
cat ./snapshot/raw/show_wlan.txt
# Note: File contains output from 'wlan' command
```

### Mixed Environment Example

```bash
# Discover all devices (VC + standalone APs)
iapctl discover --cluster mixed-env --vc 192.168.20.56 --out ./discover

# Snapshot will adapt commands based on device mode
iapctl snapshot --cluster mixed-env --vc 192.168.20.56 --out ./snapshot

# Check warnings for unsupported features on specific modes
cat ./snapshot/result.json | jq '.warnings'
# Example: ["Unable to retrieve AP group info (standalone AP)"]
```

## Changes Format (for diff/apply)

```json
{
  "changes": [
    {
      "type": "ntp",
      "servers": ["10.10.10.1", "10.10.10.2"]
    },
    {
      "type": "dns",
      "servers": ["10.10.10.1", "10.10.10.2"]
    },
    {
      "type": "ssid_vlan",
      "profile": "Corporate",
      "essid": "CorporateWiFi",
      "vlan_id": 100
    },
    {
      "type": "radius_server",
      "name": "radius-primary",
      "ip": "10.10.10.5",
      "auth_port": 1812,
      "acct_port": 1813,
      "secret_ref": "secret:radius-primary"
    },
    {
      "type": "ssid_bind_radius",
      "profile": "Corporate",
      "radius_primary": "radius-primary",
      "radius_secondary": "radius-secondary"
    },
    {
      "type": "rf_template",
      "template": "office-default"
    }
  ]
}
```

## Secret Management

Secrets use `secret_ref` pattern, not plain text:

```json
{
  "type": "radius_server",
  "secret_ref": "secret:radius-primary"
}
```

iapctl resolves secret_ref from:
- **In-memory store**: Load secrets from JSON file via `load_secrets_file()`
- **Environment variables**: Use format `env:VAR_NAME`
- **File**: Read from file using `file:/path/to/file`
- macOS Keychain (TODO)
- Configured vault (TODO)

### Loading Secrets

Load secrets from a JSON file:

```python
from iapctl.secrets import load_secrets_file

# Load secrets from file
load_secrets_file("/path/to/secrets.json")
```

Example secrets.json:

```json
{
  "radius-primary-key": "my-secret-password",
  "radius-secondary-key": "my-secondary-password"
}
```

### Environment Variables

Set secret in environment and reference with `env:` prefix:

```bash
export RADIUS_SHARED_SECRET="my-secret-value"
```

```json
{
  "type": "radius_server",
  "secret_ref": "env:RADIUS_SHARED_SECRET"
}
```

All outputs show `***REDACTED***` for secrets.

## Troubleshooting

### Connection Issues

```bash
# Test SSH connection directly
ssh -v admin@192.168.20.56

# Check if iapctl can connect
iapctl discover --cluster test --vc 192.168.20.56 --ssh-password xxx --out ./test --verbose
```

### Common Errors

**"Module not found: scrapli"**
```bash
cd /Users/scsun/.openclaw/workspace/skills/aruba-iap
./install.sh
```

**"Connection timeout"**
- Check network connectivity
- Verify SSH port (default: 22)
- Check firewall rules

**"Authentication failed"**
- Verify username/password
- Check SSH key configuration
- Test with `ssh` command directly

### Device Mode Issues

**Incorrect device mode detected**
```bash
# Check detected mode
cat ./out/discover/result.json | jq '.is_vc, .device_mode'

# Review version output for clues
cat ./out/discover/raw/show_version.txt

# Check AP database output
cat ./out/discover/raw/show_ap_database.txt
```

**Command fails on standalone AP**
```bash
# Check raw output for error messages
cat ./out/snapshot/raw/show_wlan.txt
# Expected: "Unable to retrieve WLAN info (command not supported)"

# Verify device mode
cat ./out/snapshot/result.json | jq '.device_mode'
# Expected: "standalone"
```

**Artifact contains error message instead of data**
- This is normal for unsupported features on specific device modes
- Check `result.json` warnings section for details
- Refer to "Command Compatibility Matrix" for feature support

**Fallback behavior not working**
- Check raw output files for command attempts
- Verify SSH user has necessary permissions
- Test commands manually via SSH to confirm availability
- Report issue with device model and OS version

### Verification Issues

**"Parse error" in artifact output**
- Usually indicates command not supported on current device mode
- iapctl automatically tries alternative commands
- Check `result.json` warnings for details
- May be expected behavior for certain features

**AP database shows only one AP on VC**
- Verify the device is actually in VC mode
- Check if other APs are online
- Review AP group configuration
- May be a partially deployed cluster

## Version Compatibility

- **Aruba Instant 6.x** - Basic IAP features
- **Aruba Instant 8.x** - WiFi 6 (802.11ax) support
- **Aruba AOS 10.x** - Latest features and cloud management

### Device Mode Compatibility

| Device Mode | Aruba Instant 6.x | Aruba Instant 8.x | Aruba AOS 10.x |
|-------------|------------------|-------------------|----------------|
| **Virtual Controller** | ✅ Full support | ✅ Full support | ✅ Full support |
| **Standalone AP** | ✅ Basic support | ✅ Full support | ✅ Full support |
| **Mixed Cluster** | ✅ Full support | ✅ Full support | ✅ Full support |

**Note**: Device mode detection and command adaptation works across all versions. Some advanced features may vary by OS version.

Check `iapctl discover` output for `os_major` field.

## Reference Resources

- **Official Docs**: https://arubanetworks.hpe.com/techdocs
- **Community**: https://community.arubanetworks.com
- **Aruba Central**: https://arubanetworks.hpe.com/central

## Development

iapctl is built with:
- **scrapli** - Network device automation
- **typer** - CLI framework
- **pydantic** - Data validation
- **rich** - Beautiful terminal output

Source code: `skills/aruba-iap/iapctl/`

## Device Mode Detection & Compatibility

### Automatic Device Mode Detection

iapctl uses a multi-stage detection algorithm to identify device mode:

1. **Version String Analysis**: Checks `show version` output for:
   - "Virtual Controller" or "Master" keywords
   - Model-specific indicators

2. **AP Database Check**: Attempts to retrieve AP list:
   - Multiple APs detected → VC mode
   - Single AP detected → Standalone mode
   - Command fails → Tries alternative commands

3. **Role Command Verification**: Queries device role (if supported):
   - Virtual Controller role → VC mode
   - No VC role → Standalone mode

4. **Fallback Behavior**: If detection is uncertain, defaults to standalone mode with graceful command fallback

### Command Compatibility Matrix

| Feature | VC Mode | Standalone AP | Fallback Behavior |
|---------|---------|--------------|-------------------|
| **AP Information** | `show ap database` | `show ap info` | Try both commands, use first successful output |
| **WLAN Configuration** | `show wlan` | `wlan` | Try both commands, use first successful output |
| **AP Groups** | `show ap-group` | N/A | Skip for standalone APs |
| **Radio Info** | `show ap radio` | `show radio` / `show radio info` | Try multiple variants |
| **User Table** | `show user-table` | `show user-table` | Same command for both modes |
| **Interface** | `show interface` | `show interface` | Same command for both modes |

### Standalone AP Enhancements

iapctl includes specific improvements for standalone AP devices:

1. **Command Translation**: Automatically translates VC-style commands to standalone equivalents
   - `show ap database` → `show ap info`
   - `show wlan` → `wlan`

2. **Graceful Degradation**: If a command is not supported, iapctl:
   - Logs the attempt in raw output files
   - Continues with other commands
   - Includes warnings in result.json

3. **Artifact Compatibility**: All artifacts use consistent naming regardless of device mode
   - `show_ap_database.txt` - Contains AP info (format varies by mode)
   - `show_wlan.txt` - Contains WLAN config (format varies by mode)

4. **Error Messages**: Clear indication when a command is not supported:
   ```
   Unable to retrieve AP group info (standalone AP)
   Unable to retrieve WLAN info (command not supported)
   ```

### Best Practices

**For Virtual Controller Clusters:**
- Use VC IP address for `--vc` parameter
- Ensure SSH access to the VC
- Commands will automatically use cluster-wide operations

**For Standalone APs:**
- Use AP IP address for `--vc` parameter (misnomer, but required)
- iapctl will auto-detect and adapt commands
- Some artifacts may contain "not applicable" messages

**Mixed Environments:**
- iapctl can handle both modes seamlessly
- Run `discover` first to confirm device mode
- Check `result.json` for `is_vc` and `device_mode` fields

### Troubleshooting Device Mode Issues

**Incorrect Mode Detection:**
```bash
# Check detected mode
cat ./out/snapshot/result.json | grep -E '"is_vc"|"device_mode"|"role"'

# Review version output
cat ./out/snapshot/raw/show_version.txt
```

**Command Failures on Standalone APs:**
```bash
# Check raw outputs for error messages
cat ./out/snapshot/raw/show_ap_database.txt
cat ./out/snapshot/raw/show_wlan.txt
```

**Forcing Specific Mode (Advanced):**
If automatic detection fails, you can modify connection behavior by:
1. Checking `result.json` for warnings about command failures
2. Reviewing raw output files to understand command availability
3. Reporting issues for improved detection logic

## Changelog

### v0.3.0 (2026-02-22)
- ✨ **Single-Node Cluster mode**: New device mode for APs with VC configuration but only one AP
- ✨ **Enhanced device mode detection**: Checks for virtual-controller-key in running config
- ✨ **BSS table analysis**: Counts APs in BSS table to distinguish single-node from multi-node clusters
- ✨ **Instant AP command support**: Uses `show ap bss-table` for single-node clusters
- ✨ **Smart command fallback**: Automatic fallback to bss-table when other commands fail
- 🐛 **Fixed discover command**: Now uses device-mode-aware command selection
- 📝 Documentation: Updated device mode sections with single-node cluster info

### v0.2.0 (2026-02-22)
- ✨ **Device mode detection**: Automatic VC vs standalone AP detection
- ✨ **Command adaptation**: Commands adjust based on device mode
- ✨ **Fallback behavior**: Graceful command fallback for unsupported features
- ✨ **Improved standalone AP support**: Better compatibility with single AP devices
- 📝 Documentation: Added device mode sections and command compatibility matrix

### v0.1.0 (2026-02-22)
- Initial release
- `discover` command - Gather basic IAP information
- `snapshot` command - Full configuration snapshot
- JSON + raw output format
- SSH key and password authentication
- Structured result format with timing and artifacts

### TODO
- Secret resolution from macOS Keychain
- Secret resolution from vault (HashiCorp Vault, AWS Secrets Manager, etc.)
- Approval workflow integration with OpenClaw
- Unit tests for all operations
- Integration tests with real IAP hardware
- Expected state comparison in verify command
- Command-specific timeout optimization per device mode
