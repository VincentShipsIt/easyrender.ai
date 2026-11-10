#!/usr/bin/env python3
"""PreToolUse guard for Bash calls in easyrender.ai.

Turns working agreements that used to be prose into checks:
  1. `main` is PR-only: no pushes to main, no force pushes.
  2. Bun only: npm, npx, yarn and pnpm are blocked.
  3. .env files are never staged or committed (only .env.example).
  4. No `prisma db push --accept-data-loss` from a shell: production syncs through the Vercel
     build (DB_ACCEPT_DATA_LOSS=1 for one build).

Contract: stdin carries {"tool_name","tool_input":{"command"}}. Exit 2 blocks the call and sends
stderr back to the agent. Fails open on parse errors: a broken hook must never brick the shell.
"""

import json
import re
import sys

# Only matches at command position (start, or after && || ; | or an opening parenthesis), so
# quoted mentions in commit messages and PR bodies do not trigger it.
CMD = r"(?:^|&&|\|\||[;|(])\s*"


def block(message: str) -> None:
    print(f"Blocked: {message}", file=sys.stderr)
    sys.exit(2)


def main() -> None:
    try:
        command = (json.load(sys.stdin).get("tool_input") or {}).get("command", "")
    except Exception:
        return
    if not isinstance(command, str) or not command:
        return

    if re.search(CMD + r"git\s+push\b[^;&|]*\b(?:origin\s+)?(?:HEAD:)?(?:main|master)\b", command):
        block("never push to main. Push a branch and open a PR.")
    if re.search(CMD + r"git\s+push\b[^;&|]*(?:--force\b|\s-f\b)(?!-with-lease)", command):
        block("no plain force pushes. Use --force-with-lease on your own branch.")

    if re.search(CMD + r"(?:npm|npx|yarn|pnpm)\b", command):
        block("this repo uses Bun. Use bun, bunx or bun run.")

    if re.search(CMD + r"git\s+add\b[^;&|]*\.env(?!\.example)\b", command) or re.search(
        CMD + r"git\s+add\s+(?:-A|--all|\.)\s*$", command
    ) and ".env" in command:
        block(".env files are never committed. Only .env.example is tracked.")

    if re.search(r"prisma\s+db\s+push[^;&|]*--accept-data-loss", command):
        block(
            "do not accept data loss from a shell. Set DB_ACCEPT_DATA_LOSS=1 on one Vercel "
            "production build instead (see packages/db/scripts/deploy.mjs)."
        )


if __name__ == "__main__":
    main()
