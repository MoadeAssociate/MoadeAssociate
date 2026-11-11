#!/bin/bash
#
# MOADE Associates — install-hooks.sh
# Points this repo's git hooks at its own githooks/ directory
# (enforces the rules in AGENTS.md at git level).
#
set -eu
HOOKS="$(cd "$(dirname "$0")" && pwd)"
chmod +x "$HOOKS/pre-push" "$HOOKS/pre-commit" "$HOOKS/run-quality-gate.sh" 2>/dev/null || true
git config core.hooksPath "$HOOKS"
echo "✔ hooks installed → $HOOKS"
