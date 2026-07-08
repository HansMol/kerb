# Kerb — Deployment & Git Workflow

## The rule: CI deploys, branches merge

The correct deployment path is **always via GitHub Actions**, not manual `wrangler` commands.

```
feature branch → PR → merge to main → CI builds + deploys automatically
```

CI handles the critical step of injecting live environment keys at build time. Manual deploys bypass this and have caused production incidents.

---

## Git workflow — step by step

### 1. Never commit directly to main

```bash
git checkout -b feat/your-feature-name   # feature work
git checkout -b fix/your-bug-name        # bug fixes
git checkout -b chore/your-task-name     # cleanup, docs, config
```

### 2. Make changes, then commit

```bash
git add src/path/to/changed-file.tsx     # stage specific files only — never git add .
git commit -m "feat: add advertiser cards to homepage and detail page"
```

Commit message prefixes: `feat:` `fix:` `chore:` `docs:`

### 3. Push and open a PR

```bash
git push -u origin feat/your-feature-name
gh pr create --title "Add advertiser cards" --body "..."
```

### 4. Merge → CI deploys

Merging to `main` triggers `.github/workflows/deploy.yml` which:
- Builds with the **live Clerk publishable key** from GitHub Secrets
- Deploys to Cloudflare Workers
- Syncs all Worker secrets (Clerk, Stripe, Resend, Supabase)

---

## If you must deploy manually

Only do this for urgent fixes when CI is unavailable.

```bash
# ALWAYS use build:worker — never npm run build alone
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsua2VyYi5hdXRvcyQ npm run build:worker
npm run deploy
```

**Why:** `NEXT_PUBLIC_*` variables are inlined at build time by Next.js. `.env.local` contains test keys. If you run `npm run build` or `npm run build:worker` without the override, the test Clerk publishable key gets baked into the bundle. The server has the live `CLERK_SECRET_KEY`. The mismatch causes a 500 on every handshake request.

The `build:worker` script in `package.json` already has this override baked in — so `npm run build:worker` alone is safe. **Never use `next build` directly for production.**

After a manual deploy, remember that Worker secrets are **not** re-synced. They persist from the last CI run. If secrets have changed, sync them manually:

```bash
echo "sk_live_..." | wrangler secret put CLERK_SECRET_KEY
```

---

## What CI syncs automatically (never put in wrangler.toml)

| Secret | Purpose |
|---|---|
| `CLERK_SECRET_KEY` | Clerk server-side JWT verification |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature |
| `RESEND_API_KEY` | Transactional email |
| `RESEND_AUDIENCE_ID` | Resend mailing list |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server-side access |
| `COMPANIES_HOUSE_API_KEY` | Companies House API |
| `CRON_SECRET` | Cron job auth |

---

## Do not touch these files

| File | Why |
|---|---|
| `public/favicon.ico` | Steps mark favicon — correct, do not regenerate |
| `public/favicon.svg` | Steps mark favicon — correct, do not regenerate |
| `wrangler.toml` | Only contains public vars — secrets go via `wrangler secret put` |
| `.env.local` | Local dev only — never used in production builds via CI |

---

## Incidents log

| Date | What happened | Fix |
|---|---|---|
| 2026-07-06 | Manual deploy baked test Clerk key into bundle → 500 on all handshake requests | Reverted to passthrough middleware, then set live key via `wrangler secret put` |
| 2026-07-08 | Manual deploy again baked test Clerk key → same 500 | Added live key override to `build:worker` script in `package.json` |
| 2026-07-08 | Favicon files replaced with incorrectly generated versions → globe icon in browser | Restored from `git checkout HEAD -- public/favicon.*` |
| 2026-07-08 | `icons` metadata override in layout.tsx caused Safari to use SVG (dark-on-transparent, invisible in dark tab bar) → globe fallback | Removed `icons` key entirely — browser auto-discovers `/favicon.ico` which is correct |
