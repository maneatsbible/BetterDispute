#!/usr/bin/env bash
# scripts/setup-labels.sh
# Creates all required bd:* GitHub labels in the specified repository.
# Usage: bash scripts/setup-labels.sh owner/repo
# Requires: GitHub CLI (gh) authenticated with repo scope.

set -e

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 owner/repo" >&2
  exit 1
fi

if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) not found. Install from https://cli.github.com" >&2
  exit 1
fi

create_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
    echo "  ✓ Created: $name"
  else
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null \
      && echo "  ~ Updated: $name" \
      || echo "  ! Skipped: $name (may already exist)"
  fi
}

echo "Setting up Better Dispute labels in $REPO ..."

create_label "bd:assertion"           "e3b341" "Assertion post"
create_label "bd:challenge"           "bc8cff" "Challenge post"
create_label "bd:answer"              "3fb950" "Answer post"
create_label "bd:dispute"             "f85149" "Dispute instance"
create_label "bd:agreement"           "58a6ff" "Agreement record"
create_label "bd:offer"               "d29922" "Resolution offer"
create_label "bd:crickets-conditions" "8b949e" "Crickets negotiation"
create_label "bd:crickets-event"      "ff7b72" "Crickets expiry event"
create_label "bd:active"              "238636" "Active dispute/process"
create_label "bd:resolved"            "484f58" "Resolved dispute"

echo "Done."
