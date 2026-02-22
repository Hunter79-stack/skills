"""Configuration diff and command generation."""
import json
from pathlib import Path
from typing import Dict, List, Optional

from .models import Changes, CommandSet
from .secrets import get_secret, redact_secret


def generate_commands(changes: Changes, resolve_secrets: bool = True) -> CommandSet:
    """Generate CLI commands from changes.

    Args:
        changes: Changes model with intent
        resolve_secrets: If True, resolve secret_ref to actual values

    Returns:
        CommandSet with commands to apply
    """
    commands = []
    rollback_commands = []
    secrets_to_redact = []

    for change in changes.changes:
        change_type = change.type

        if change_type == "ntp":
            # NTP configuration
            servers = change.servers
            for i, server in enumerate(servers, 1):
                commands.append(f"ntp server {i} {server}")
                rollback_commands.append(f"no ntp server {i}")

        elif change_type == "dns":
            # DNS configuration
            servers = change.servers
            for i, server in enumerate(servers, 1):
                commands.append(f"ip name-server {i} {server}")
                rollback_commands.append(f"no ip name-server {i}")

        elif change_type == "ssid_vlan":
            # SSID and VLAN configuration
            profile = change.profile
            essid = change.essid
            vlan_id = change.vlan_id

            commands.extend([
                f"wlan {profile}",
                f"  ssid {essid}",
                f"  vlan-id {vlan_id}",
                "  exit",
            ])

            rollback_commands.extend([
                f"no wlan {profile}",
            ])

        elif change_type == "radius_server":
            # RADIUS server configuration
            name = change.name
            ip = change.ip
            auth_port = change.auth_port
            acct_port = change.acct_port
            secret_ref = change.secret_ref

            # Resolve secret if requested
            secret_value = None
            if resolve_secrets:
                secret_value = get_secret(secret_ref)
                if secret_value:
                    secrets_to_redact.append(secret_value)

            # Use resolved secret or keep secret_ref placeholder
            key_value = secret_value if secret_value else f"secret_ref:{secret_ref}"

            commands.extend([
                f"radius-server {name}",
                f"  host {ip}",
                f"  auth-port {auth_port}",
                f"  acct-port {acct_port}",
                f"  key {key_value}",
                "  exit",
            ])

            rollback_commands.extend([
                f"no radius-server {name}",
            ])

        elif change_type == "ssid_bind_radius":
            # SSID to RADIUS binding
            profile = change.profile
            radius_primary = change.radius_primary
            radius_secondary = change.radius_secondary

            commands.extend([
                f"wlan {profile}",
                f"  auth-server {radius_primary}",
            ])

            if radius_secondary:
                commands.append(f"  auth-server {radius_secondary}")

            commands.append("  exit")

            rollback_commands.extend([
                f"wlan {profile}",
                "  no auth-server",
                "  exit",
            ])

        elif change_type == "rf_template":
            # RF template configuration
            template = change.template

            # Templates are pre-defined, just apply
            commands.append(f"rf-profile {template}")
            rollback_commands.append("no rf-profile")

    command_set = CommandSet(
        commands=commands,
        change_id="",  # Will be set by caller
        rollback_commands=rollback_commands,
    )

    # Attach secrets to redact as metadata
    if secrets_to_redact:
        command_set.metadata = {"secrets_to_redact": secrets_to_redact}

    return command_set


def diff_config(
    current_config: str,
    changes: Changes,
    change_id: str,
) -> CommandSet:
    """Generate diff between current config and desired changes.

    Args:
        current_config: Current running configuration
        changes: Desired changes
        change_id: Change ID for audit trail

    Returns:
        CommandSet with commands to apply
    """
    command_set = generate_commands(changes)
    command_set.change_id = change_id
    
    return command_set


def save_command_set(
    command_set: CommandSet,
    out_dir: Path,
) -> None:
    """Save command set to files.

    Args:
        command_set: Command set to save
        out_dir: Output directory
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Save commands
    commands_file = out_dir / "commands.json"
    commands_file.write_text(command_set.model_dump_json(indent=2))
    
    # Save as plain text for human review
    commands_txt = out_dir / "commands.txt"
    lines = [f"# Change ID: {command_set.change_id}"]
    lines.append("# Commands to apply:")
    lines.extend(command_set.commands)
    lines.append("")
    lines.append("# Rollback commands:")
    lines.extend(command_set.rollback_commands)
    commands_txt.write_text("\n".join(lines))


def assess_risks(command_set: CommandSet) -> Dict:
    """Assess risks of applying commands.

    Args:
        command_set: Command set to assess

    Returns:
        Risk assessment dict
    """
    risks = {
        "level": "low",
        "warnings": [],
        "concerns": [],
    }
    
    commands_text = " ".join(command_set.commands).lower()
    
    # Check for high-risk operations
    if "no wlan" in commands_text or "no radius" in commands_text:
        risks["level"] = "medium"
        risks["warnings"].append("Removing WLAN or RADIUS configuration may disconnect users")
    
    if "vlan-id" in commands_text:
        risks["concerns"].append("VLAN changes may affect network connectivity")
    
    # Check for many changes
    if len(command_set.commands) > 20:
        risks["level"] = "medium" if risks["level"] == "low" else "high"
        risks["warnings"].append("Large number of changes - consider applying in stages")
    
    return risks
