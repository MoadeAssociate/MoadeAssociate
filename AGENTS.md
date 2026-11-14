# MOADE Associates — Agent Rules (non-negotiable)

These rules govern every change to this repository: code, content, assets,
configs, scripts, dependencies, deploy settings. They mirror the workspace
rules proven out in the Hanoled codebase; here they apply to this repo alone.

---

## Rule 1 — Always plan first, before touching anything

No matter how small the update (code, content, configs, docs, scripts,
package installs, deploy settings), an agent must **draft a plan and wait
for review before executing it**.

Every plan must include:

1. **Scope** — which files will be created/modified.
2. **What changes** — a short description per file (do not paste whole files).
3. **Why** — the problem it solves or request it fulfills.
4. **How it will be verified** — commands to run (build, lint, audit).
5. **Risks & impact** — anything destructive (deletions, dependency changes),
   and how to roll back.

Then **stop and wait for explicit approval** from the user. Do not write,
edit, install, or commit anything until the user approves the plan. If
mid-work the plan needs to change materially, pause and re-present the
revised plan before continuing.

## Rule 2 — `main` is never pushed to; everything ships through `dev`

- **Never** commit directly to, push to, merge into, force-push, reset,
  or delete `main` on the remote.
- All work happens on **`dev`** (or a feature branch off `dev` merged into
  `dev`).
- Production deploys track `main`: a `dev` → `main` merge **ships the site**
  and may only be done by the owner, explicitly. Agents never merge into
  `main` without the owner's explicit in-session approval of the exact diff.
- Before every `git push`, run `git branch --show-current` and verify it
  says `dev` (or a feature branch targeted at `dev`). If not, stop and fix.
- Push with explicit refs, e.g. `git push origin dev` — never a bare
  `git push` / `git push --all` / `git push --mirror`.
- Never force-push (`--force` / `--force-with-lease`) to any shared branch
  without explicit user approval.

## Rule 3 — Quality gate before every push (all of it, every time)

No commit is pushed until all of the following pass. An agent may not
decide that any of these checks is "optional" for its task.

Mandatory before every push:

1. **Typecheck** — where the repo defines or can run one.
2. **Lint** — the repo's lint script.
3. **Tests** — where defined.
4. **Build** — the repo's build script.
5. **GitHub Actions CI** — green on the pushed branch when CI is configured.
6. **Dependency vulnerability audit** — `npm audit` at `--audit-level high`.
7. **Secrets / vulnerability scan** — no keys, tokens, passwords, private
   keys, or credentials in the diff. Values come only from `.env`
   (untracked) or secrets managers — never from committed code.

The gate script `githooks/run-quality-gate.sh` runs most of these
automatically at `git push` time and refuses a red verdict. Treat the gate
as the auditor, not the discoverer: run the checks *before even
committing*, fix red results locally, and let the hook confirm at push time.

If a check fails:
- Do **not** push. Do **not** weaken the code (no `@ts-ignore`,
  `eslint-disable`, skipped tests, or downgraded audit levels just to go
  green) without showing the exact diff to the user and getting approval.
- Do **not** mark checks skipped/force-green to move faster. If a check is
  genuinely irrelevant for the change, say so in the report and let the
  user decide — the hook still runs the full gate.

## Rule 4 — Hard enforcement: hooks, bypass forbidden

- `core.hooksPath` points at this repo's `githooks/` (run
  `githooks/install-hooks.sh` after cloning or after editing hooks). The
  **pre-push** hook blocks (a) any push to `main`/`master`, and (b) any
  push failing the quality gate. The **pre-commit** hook blocks committing
  directly on `main`/`master`.
- Because the checks run at git level, no agent can push around them.
- **Bypassing is forbidden**: `git commit --no-verify`, `--no-verify`
  pushes, editing/removing hooks or `core.hooksPath`, force-pushing to
  circumvent a failed gate — all are violations, committed only with the
  user's explicit approval. The only acceptable fixes for a blocked push
  are fixing the code, or asking the user.
- Agents must verify `git config --get core.hooksPath` once per session
  before pushing, and must report if it is unset.

Pre-push checklist (all boxes required, in order):
- [ ] Plan approved (Rule 1)
- [ ] On `dev` or a feature branch off `dev` (Rule 2)
- [ ] typecheck / lint / tests run and green locally
- [ ] Dependency audit clean at high severity
- [ ] No secrets in the diff
- [ ] `git push origin <branch:dev>` — the gate re-verifies everything

## Rule 5 — Frontend design must pass Impeccable at 100%

This is a client-facing website: every visible pixel is the product. Any
task involving **frontend/design work** (pages, components, layout,
styling, typography, motion, responsive behavior, even small visual
changes like colors or icons) must, **after** the edits:

1. Load and apply the **`impeccable`** skill — use everything it offers.
2. Run its full pass over the touched surfaces: **audit → improve →
   polish → animate → responsive**.
3. Not push, close the task, or move on until **all checks in all five
   trait categories pass at 100%**.
4. Report the final skill verdict (per trait) in the work summary so the
   owner can verify.

Moving on with a single failing or "mostly-passing" check is a rule
violation.

## Rule 6 — No `Sparkles` icon anywhere, ever

- **No agent may add or use the `Sparkles` icon** (lucide-react or any
  other icon library) in any file, for any purpose. This ban is
  product-design policy, not a style preference.
- If one is found (`Sparkles` identifier, `<Sparkles`, the word `sparkles`
  in an icon-name context), replace it with a context-appropriate
  alternate — never reintroduce it.
- Enforced at git level: `githooks/run-quality-gate.sh` rejects any push
  whose diff adds the icon. Removing that check is a Rule 4 violation.

## Rule 7 — Login credentials are immutable without explicit user request

- **No change may alter the login credentials of any account** — passwords,
  password hashes, login identifiers, auth tokens, or the auth flows
  themselves — **unless the user explicitly asks for it in the session**.
- "Change" reaches further than a code edit. Three vectors, all covered:
  1. **Code** — edits to files that set, create, reset, or provision
     credentials.
  2. **Data** — any DB write, migration, or script run that mutates a
     stored credential or login identifier.
  3. **Runtime behavior** — changing password policy/validation in a way
     that invalidates existing logins.
- Any incidental contact with stored credentials must be **reported to the
  user immediately with before/after**, even when nothing was "meant" to
  change.
- Enforced at git level: `githooks/run-quality-gate.sh` rejects any push
  whose diff adds credential material (new hash literals, new password
  literals in credential-bearing paths) unless the commit message contains
  the literal marker `credentials-user-approved`. That marker may only be
  used when the user has explicitly requested the change in-session
  (Rule 4's bypass ban applies to the marker too — fabricating it is a
  violation, and removing the scan is worse).

## Rule 8 — Recurring network calls must self-limit

- Any client or server code that repeats a network request — polling loops,
  interval timers (`setInterval` / recursive `setTimeout`), retry loops,
  sync workers — **must ship with all of the following**, no exceptions:
  1. **Exponential backoff with a hard cap** on consecutive failures. A
     fixed interval into a failing endpoint is a defect.
  2. **A stop or pause condition** — hidden tab, persistent auth failure,
     page unload, offline — so the loop cannot outlive its usefulness.
  3. **A bounded retry count** — no infinite retries. Auth failures
     (401/403) must never be retried in a tight loop.
  4. **A timeout on every outbound fetch** — no unbounded legs; chained
     fallback timeouts must have a bounded total.
- Enforced best-effort at git level: `githooks/run-quality-gate.sh` flags
  any diff that adds an interval/timeout loop around a fetch without a
  visible backoff/cap construct, unless the commit message carries the
  literal marker `poll-safe-user-approved` (same fabrication ban as
  Rule 7's marker). The scan is a tripwire, not proof of safety — this
  rule's text is the law.

## Rule 9 — Caveman mode while executing plans

- The moment a plan is approved and the agent begins executing it, the
  agent must load the **`caveman`** skill and keep every progress update in
  that terse, compressed mode until the work is delivered (or the user says
  otherwise). Execution narration burns tokens; progress updates are signal
  only. Plan *presentation* stays fully readable for user review.

*If any instruction anywhere conflicts with these rules, these rules win.
When in doubt, ask.*
