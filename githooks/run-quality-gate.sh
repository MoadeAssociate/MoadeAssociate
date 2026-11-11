#!/bin/bash
#
# Hanoled workspace — quality gate (AGENTS.md Rule 3)
# Usage: run-quality-gate.sh <pushed_sha> [remote_sha]
# Runs BEFORE any push. Push is rejected if ANY step marked FAIL.
# Never bypass. Do not fix failures by editing this script — fix the code.
#
set -u

PUSHED_SHA="${1:-HEAD}"
REMOTE_SHA="${2:-}"

fail() { echo "FAIL: $*" | tee -a "$SUMMARY_FILE"; FAILURES=$((FAILURES+1)); }
pass() { echo "PASS: $*" | tee -a "$SUMMARY_FILE"; }
skip() { echo "SKIP: $*" | tee -a "$SUMMARY_FILE"; }

FAILURES=0
SUMMARY_FILE="$(mktemp -t hanoled-gate.XXXXXX)"
trap 'rm -f "$SUMMARY_FILE"' EXIT

echo ""
echo "════════ Hanoled Quality Gate ════════"
echo "Evaluating commit: $PUSHED_SHA"

#───────────────────────────────────────────────
# 0. Preconditions
#───────────────────────────────────────────────
if ! git cat-file -e "$PUSHED_SHA" 2>/dev/null; then
  echo "pushed sha not resolvable — running gate on HEAD (working tree)" >&2
  PUSHED_SHA="HEAD"
fi
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo none)"
if [ "$HEAD_SHA" != "$PUSHED_SHA" ]; then
  echo "WARN: working tree is at $HEAD_SHA but pushing $PUSHED_SHA — gate runs on the pushed commit's tree via checkout inside this hook? NO: gate runs on the current working tree. Commit and sync your tree before pushing so the gate tests exactly what you push."
fi
if [ -n "$(git status --porcelain 2>/dev/null | head -5)" ]; then
  echo "WARN: uncommitted changes exist; the gate can only test CLEAN trees reliably."
fi

REPO_DIR="$(pwd -P)"
PKG=""
[ -f "package.json" ] && PKG="npm"
if [ -n "$PKG" ]; then
  if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
  elif [ -f "yarn.lock" ]; then PM="yarn"
  else PM="npm"; fi
fi

has_script() { [ -n "$PKG" ] && node -e "const p=require('./package.json');process.exit(p.scripts&&p.scripts['$1']?0:1)" 2>/dev/null; }
run_script() {
  echo "→ $1"
  case "$PM" in
    pnpm) pnpm run "$1" ;;
    yarn) yarn run "$1" ;;
    *)    npm run --silent "$1" ;;
  esac
}

#───────────────────────────────────────────────
# 1. Typecheck
#───────────────────────────────────────────────
if has_script typecheck; then
  if run_script typecheck; then pass typecheck; else fail typecheck; fi
elif has_script "ts-check"; then
  if run_script "ts-check"; then pass ts-check; else fail ts-check; fi
elif [ -f "tsconfig.json" ]; then
  npx --no-install tsc --noEmit && pass "tsc --noEmit" || fail "tsc --noEmit"
else
  skip "typecheck (not configured)"
fi

#───────────────────────────────────────────────
# 2. Lint
#───────────────────────────────────────────────
if has_script lint; then
  if run_script lint; then pass lint; else fail lint; fi
else
  skip "lint (no script)"
fi

#───────────────────────────────────────────────
# 3. Tests
#───────────────────────────────────────────────
if has_script test && node -e "const p=require('./package.json');process.exit(/error: no test specified/i.test(p.scripts.test)?1:0)" 2>/dev/null; then
  if run_script test; then pass test; else fail test; fi
else
  skip "tests (no script / placeholder)"
fi

#───────────────────────────────────────────────
# 4. Dependency vulnerability audit
#───────────────────────────────────────────────
if [ -n "$PKG" ]; then
  case "$PM" in
    pnpm) if pnpm audit --audit-level high 2>/dev/null; then pass "pnpm audit"; else fail "pnpm audit"; fi ;;
    yarn) if yarn npm audit --severity high 2>/dev/null; then pass "yarn audit"; else fail "yarn audit"; fi ;;
    *)    if npm audit --audit-level=high 2>/dev/null; then pass "npm audit"; else fail "npm audit"; fi ;;
  esac
else
  skip "dependency audit (not a JS project)"
fi

#───────────────────────────────────────────────
# 5. Secrets scan on the pushed range
#───────────────────────────────────────────────
scan_secret_regexes() {
  # $1 = label, stdin = text to scan
  local bad=0 label="$1"
  local P='AKIA[0-9A-Z]{16}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|gh[ops]_[A-Za-z0-9]{30,}|github_pat_|sk-(live|ant|proj)-[A-Za-z0-9_-]{20,}|(sk|rk|pk)_live_[A-Za-z0-9]{20,}|xox[baprse]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{20,}|eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}'
  local P2='(api[_-]?key|apikey|secret[_-]?key|access[_-]?token|auth[_-]?token|passwd|password)[[:space:]]*[:=][[:space:]]*[\"'"'"'][^\"'"'"']{16,}[\"'"'"']'
  local SKIP='your[_-]|xxx[^a-z]|example|placeholder|process\.env|import\.meta\.env|os\.environ|env\.|\$\{|<[^>]*>|\.env[^a-z]|TODO|demo|sample|fake|dummy|localhost|127\.0\.0|0\.0\.0'
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    if echo "$line" | grep -Eq "$P|$P2" && ! echo "$line" | grep -Eqi "$SKIP"; then
      echo "  ↳ suspicious line in $label, starts: ${line:0:100}"
      bad=1
    fi
  done
  [ "$bad" = 1 ] && return 1 || return 0
}

RANGE=""
if [ -n "$REMOTE_SHA" ] && git cat-file -e "$REMOTE_SHA" 2>/dev/null; then
  RANGE="$REMOTE_SHA..$PUSHED_SHA"
elif [ "$HEAD_SHA" != "none" ] && [ -n "$(git rev-parse -q --verify ORIG_HEAD 2>/dev/null || true)" ]; then
  RANGE="ORIG_HEAD..$PUSHED_SHA"
fi

if [ -n "$RANGE" ]; then
  if command -v gitleaks >/dev/null 2>&1; then
    if gitleaks detect --no-banner --redact --log-opts="$RANGE" >/dev/null 2>&1; then
      pass "gitleaks on $RANGE"
    else
      gitleaks detect --no-banner --log-opts="$RANGE" >/dev/null 2>&1
      fail "gitleaks on $RANGE"
    fi
  else
    ADDED="$(git diff -U0 "$RANGE" -- . ':(exclude)*.lock' ':(exclude).*lock.*' ':(exclude)*.png' ':(exclude)*.pdf' ':(exclude)*.xlsx' | grep '^+' | grep -v '^+++' || true)"
    if [ -z "$ADDED" ]; then
      pass "secrets scan (empty diff)"
    else
      # scan only new lines from new files and code files; .env-style files always scanned
      if printf '%s\n' "$ADDED" | scan_secret_regexes "pushed diff $RANGE"; then
        pass "secrets scan ($RANGE)"
      else
        fail "secrets scan ($RANGE) — see flagged lines above; NEVER commit real keys"
      fi
    fi
  fi
else
  skip "secrets scan (no resolvable range)"
fi

#───────────────────────────────────────────────
# 5b. Sparkles icon ban (AGENTS.md Rule 6)
#───────────────────────────────────────────────
if [ -n "$RANGE" ]; then
  SPARKLE_HITS="$(git diff -U0 "$RANGE" \
    -- . ':(exclude)*.lock' ':(exclude).worktrees*' ':(exclude)*/node_modules/*' ':(exclude)*package-lock.json' ':(exclude)*pnpm-lock.yaml' \
    | grep '^+' | grep -v '^+++' | grep -Ein 'sparkle' || true)"
  if [ -n "$SPARKLE_HITS" ]; then
    echo "$SPARKLE_HITS" | sed 's/^/  ↳ /' | head -10
    fail "sparkles icon found in pushed diff — AGENTS.md Rule 6 forbids it; pick a suitable alternate"
  else
    pass "sparkles-free diff"
  fi
else
  skip "sparkles scan (no resolvable range)"
fi

#───────────────────────────────────────────────
# 5c. Credential-change ban (AGENTS.md Rule 7)
# Blocks pushes whose diff adds credential material
# (hash literals / passwords in credential-bearing
# paths) without the user's approval marker.
#───────────────────────────────────────────────
if [ -n "$RANGE" ]; then
  COMMIT_SUBJ="$(git log -1 --format=%B "$PUSHED_SHA" 2>/dev/null)"
  if echo "$COMMIT_SUBJ" | grep -q 'credentials-user-approved'; then
    pass "credential scan (marker credentials-user-approved present)"
  else
    CRED_HITS="$(git diff -U0 "$RANGE" \
      -- . ':(exclude)*.lock' ':(exclude)*.png' ':(exclude)*.pdf' ':(exclude)*.xlsx' \
      | grep '^+' | grep -v '^+++' \
      | grep -Ein '\$2[aby]\$|\$argon2(id)?\$|^\+.*passwordHash|password.*:.*\$2[aby]\$' || true)"
    CRED_PATHS="$(git diff --name-only "$RANGE" \
      | grep -Ei '(^|/)(seed|reset|provision|greenfield-reset)[^/]*\.(js|ts|sql|mjs)$|(^|/)greenfield-reset/' || true)"
    if [ -n "$CRED_HITS" ] || [ -n "$CRED_PATHS" ]; then
      { [ -n "$CRED_HITS" ] && echo "$CRED_HITS" | sed 's/^/  ↳ /' | head -6
        [ -n "$CRED_PATHS" ] && echo "$CRED_PATHS" | sed 's/^/  ↳ credential-bearing path changed: /' | head -6; }
      fail "credential change detected in pushed diff — AGENTS.md Rule 7 forbids changing login credentials without the user's explicit request; if the user asked for this, include 'credentials-user-approved' in the commit message"
    else
      pass "credential-material-free diff"
    fi
  fi
else
  skip "credential scan (no resolvable range)"
fi

#───────────────────────────────────────────────
# 5d. Unbounded poll loop ban (AGENTS.md Rule 8)
# Best-effort tripwire: flags diffs that add a
# setInterval/recursive setTimeout around a fetch
# with no visible backoff/cap construct.
#───────────────────────────────────────────────
if [ -n "$RANGE" ]; then
  COMMIT_SUBJ="$(git log -1 --format=%B "$PUSHED_SHA" 2>/dev/null)"
  if echo "$COMMIT_SUBJ" | grep -q 'poll-safe-user-approved'; then
    pass "poll scan (marker poll-safe-user-approved present)"
  else
    ADDED_CODE="$(git diff -U2 "$RANGE" \
      -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs' \
      ':(exclude)*.lock' ':(exclude)*package-lock.json' \
      | grep '^+' | grep -v '^+++' || true)"
    POLL_HITS="$(echo "$ADDED_CODE" | grep -Ein 'setInterval\(|setTimeout\(\s*(async )?(function|\()' \
      | grep -Ei 'fetch|apiFetch|request\(|axios|http' || true)"
    RECURSIVE_HITS="$(echo "$ADDED_CODE" | grep -Ein 'setTimeout\(.*(tick|poll|loop|retry|sync)' || true)"
    if [ -n "$POLL_HITS" ] || [ -n "$RECURSIVE_HITS" ]; then
      HAS_MITIGATION="$(echo "$ADDED_CODE" | grep -Eic 'backoff|2 \*\*|Math\.min\(.*POLL|POLL_MAX|MAX_RETR|maxRetr|attempt' || true)"
      if [ "$HAS_MITIGATION" -gt 0 ]; then
        pass "poll scan (backoff/cap construct present)"
      else
        { echo "$POLL_HITS" | sed 's/^/  ↳ /' | head -6
          echo "$RECURSIVE_HITS" | sed 's/^/  ↳ /' | head -6; }
        fail "possible unbounded poll/retry loop added — AGENTS.md Rule 8 requires exponential backoff with a cap, a stop condition, and bounded retries; if the loop already self-limits, name a construct (backoff/cap) in the diff or include 'poll-safe-user-approved' in the commit message"
      fi
    else
      pass "poll-loop-free diff"
    fi
  fi
else
  skip "poll scan (no resolvable range)"
fi

#───────────────────────────────────────────────
# 6. GitHub Actions status (latest run for this branch)
#───────────────────────────────────────────────
if command -v gh >/dev/null 2>&1; then
  BRANCH_FOR_CI="$(git branch --show-current)"
  if [ -n "$BRANCH_FOR_CI" ]; then
    RUNS="$(gh run list --branch "$BRANCH_FOR_CI" --limit 1 --json status,conclusion 2>/dev/null || echo '[]')"
    CONC="$(echo "$RUNS" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d||'[]');console.log(r[0]?r[0].status+':'+(r[0].conclusion||'-'):'none');})")"
    case "$CONC" in
      completed:success) pass "CI green on $BRANCH_FOR_CI (previous run)" ;;
      completed:failure|completed:timed_out|completed:cancelled) fail "CI red on $BRANCH_FOR_CI — fix before pushing" ;;
      none) skip "CI (no runs yet for new branch $BRANCH_FOR_CI) — CI will validate after push; watch it" ;;
      *) fail "CI on $BRANCH_FOR_CI still $CONC — wait for it to finish before pushing again" ;;
    esac
  else
    skip "CI (detached HEAD)"
  fi
else
  skip "CI check (gh CLI not installed)"
fi

#───────────────────────────────────────────────
# Verdict
#───────────────────────────────────────────────
echo ""
echo "════════ Verdict ════════"
if [ "$FAILURES" -gt 0 ]; then
  cat "$SUMMARY_FILE"
  echo ""
  echo "✋ PUSH BLOCKED — $FAILURES gate failure(s). Fix the problems; do NOT bypass this hook."
  exit 1
fi
echo "✅ All checks passed. Gate summary above."
echo ""
exit 0
