#!/usr/bin/env python3
"""Semver Helper - Quick semantic versioning guidance."""

import re
import sys
from dataclasses import dataclass
from typing import Optional

import click


@dataclass
class Change:
    type_: str
    description: str


CONVENTIONAL_TYPES = {
    "feat": "MINOR",
    "feature": "MINOR",
    "add": "MINOR",
    "fix": "PATCH",
    "bugfix": "PATCH",
    "patch": "PATCH",
    "docs": "PATCH",
    "style": "PATCH",
    "refactor": "PATCH",
    "perf": "PATCH",
    "test": "PATCH",
    "chore": "PATCH",
    "breaking": "MAJOR",
    "break": "MAJOR",
    "remove": "MAJOR",
    "deprecate": "MINOR",
}

KEYWORDS = {
    "breaking": "MAJOR",
    "break": "MAJOR",
    "backwards incompatible": "MAJOR",
    "remove": "MAJOR",
    "delete": "MAJOR",
    "deprecate": "MINOR",
    "new": "MINOR",
    "add": "MINOR",
    "feature": "MINOR",
    "feat": "MINOR",
    "fix": "PATCH",
    "bug": "PATCH",
    "patch": "PATCH",
    "repair": "PATCH",
}


def parse_change(text: str) -> Change:
    """Parse a change description to determine type."""
    text_lower = text.lower()

    # Check for conventional commit format: "type: description"
    match = re.match(r"^(\w+)[(:]", text_lower)
    if match:
        prefix = match.group(1)
        if prefix in CONVENTIONAL_TYPES:
            return Change(CONVENTIONAL_TYPES[prefix], text)

    # Check for keywords
    for keyword, bump in KEYWORDS.items():
        if keyword in text_lower:
            return Change(bump, text)

    return Change("UNKNOWN", text)


def suggest_version(current: str, changes: list[str]) -> tuple[str, str]:
    """Suggest new version based on changes."""
    # Parse current version
    match = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-(.+))?", current)
    if not match:
        raise ValueError(f"Invalid version: {current}")

    major, minor, patch = int(match.group(1)), int(match.group(2)), int(match.group(3))
    prerelease = match.group(4)

    # Analyze changes
    highest_bump = "PATCH"
    analyzed = []

    for change_text in changes:
        change = parse_change(change_text)
        analyzed.append(change)
        if change.type_ == "MAJOR":
            highest_bump = "MAJOR"
        elif change.type_ == "MINOR" and highest_bump != "MAJOR":
            highest_bump = "MINOR"

    # Calculate new version
    if highest_bump == "MAJOR":
        new_version = f"{major + 1}.0.0"
    elif highest_bump == "MINOR":
        new_version = f"{major}.{minor + 1}.0"
    else:
        new_version = f"{major}.{minor}.{patch + 1}"

    if prerelease:
        new_version += f"-{prerelease}"

    return new_version, highest_bump


@click.group()
def cli():
    """Semver Helper - Semantic versioning guidance."""
    pass


@cli.command()
@click.option("--from", "current", required=True, help="Current version (e.g., 1.2.3)")
@click.option("--changes", required=True, help="Comma-separated list of changes")
def suggest(current: str, changes: str):
    """Suggest version bump based on changes."""
    change_list = [c.strip() for c in changes.split(",") if c.strip()]

    try:
        new_version, bump = suggest_version(current, change_list)
    except ValueError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

    click.echo(f"Current:  {current}")
    click.echo(f"Changes:  {len(change_list)} change(s)")
    click.echo()

    for change_text in change_list:
        change = parse_change(change_text)
        icon = {"MAJOR": "🔴", "MINOR": "🟡", "PATCH": "🟢", "UNKNOWN": "⚪"}[change.type_]
        click.echo(f"  {icon} [{change.type_}] {change.description}")

    click.echo()
    click.echo(f"Suggest:  {current} → {new_version} ({bump})")


@cli.command()
@click.argument("change")
def check(change: str):
    """Check what a single change means for versioning."""
    parsed = parse_change(change)

    icon = {"MAJOR": "🔴", "MINOR": "🟡", "PATCH": "🟢", "UNKNOWN": "⚪"}[parsed.type_]

    click.echo(f"Change: {change}")
    click.echo(f"Impact: {icon} {parsed.type_}")

    if parsed.type_ == "MAJOR":
        click.echo("  → Breaking change. Bump MAJOR version.")
    elif parsed.type_ == "MINOR":
        click.echo("  → New feature. Bump MINOR version.")
    elif parsed.type_ == "PATCH":
        click.echo("  → Bug fix. Bump PATCH version.")
    else:
        click.echo("  → Could not determine impact. Use your judgment.")


@cli.command()
def guide():
    """Show SemVer quick reference guide."""
    click.echo("""
┌─────────────────────────────────────────────────────────────┐
│                    SEMANTIC VERSIONING                      │
├─────────────────────────────────────────────────────────────┤
│  Format: MAJOR.MINOR.PATCH (e.g., 1.2.3)                    │
├─────────────────────────────────────────────────────────────┤
│  🔴 MAJOR (X.0.0)  │ Breaking changes, incompatible API     │
│  🟡 MINOR (0.X.0)  │ New features, backwards compatible     │
│  🟢 PATCH (0.0.X)  │ Bug fixes, backwards compatible        │
├─────────────────────────────────────────────────────────────┤
│  EXAMPLES:                                                  │
│  • fix: null pointer → PATCH (1.2.3 → 1.2.4)                │
│  • feat: add auth    → MINOR (1.2.3 → 1.3.0)                │
│  • remove old API    → MAJOR (1.2.3 → 2.0.0)                │
├─────────────────────────────────────────────────────────────┤
│  PRE-RELEASE:                                               │
│  • 1.0.0-alpha.1                                            │
│  • 1.0.0-beta.2                                             │
│  • 1.0.0-rc.1                                               │
└─────────────────────────────────────────────────────────────┘
""")


def main():
    cli()


if __name__ == "__main__":
    main()
