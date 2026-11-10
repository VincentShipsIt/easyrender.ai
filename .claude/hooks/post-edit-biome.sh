#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): format and lint the file just edited with Biome.
# Fixes what it can in place; exit 2 hands the rest back to the agent. Fails open on infra errors.
set -u

export PATH="$HOME/.bun/bin:$PATH"
command -v bunx >/dev/null 2>&1 || exit 0

input=$(cat)
file=$(printf '%s' "$input" | python3 -c 'import json,sys; print((json.load(sys.stdin).get("tool_input") or {}).get("file_path",""))' 2>/dev/null) || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.json | *.jsonc | *.css) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

root=$(cd "$(dirname "$file")" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)
[ -n "$root" ] || root="${CLAUDE_PROJECT_DIR:-.}"
cd "$root" || exit 0
rel="${file#"$root"/}"

if ! output=$(bunx biome check --write --no-errors-on-unmatched "$rel" 2>&1); then
  {
    echo "Biome found issues in $rel that it could not fix. Fix them now:"
    printf '%s\n' "$output" | tail -40
  } >&2
  exit 2
fi
exit 0
