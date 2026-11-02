<div align="center">

# 𝐕𝐌𝐀𝐈𝐋.𝐃𝐄𝐕

**Temporary email service built on Cloudflare Email Worker**

Disposable inboxes · Send & receive · Open API · No server required

[![License](https://img.shields.io/github/license/PIKACHUIM/vmail?label=License&color=blue)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.2.1-brightgreen)](CHANGELOG.md)
[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2022-339933?logo=node.js&logoColor=white)](package.json)
[![Workers](https://img.shields.io/badge/Powered%20by-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Stars](https://img.shields.io/github/stars/PIKACHUIM/vmail?style=flat&color=yellow)](https://github.com/PIKACHUIM/vmail/stargazers)

[One-click Deploy](#-one-click-deploy) · [Deployment Guide](docs/github-action-tutorial.md) · [AI-assisted Deploy](docs/ai-deploy.md) · [API Docs](https://vmail.dev/api-docs) · [Discord](https://discord.gg/d68kWCBDEs) · [简体中文](README.md)

</div>

> [!IMPORTANT]
> **Upgrading to v3.2.1?** Read the [upgrade guide](docs/UPGRADE.en.md). Anonymous API keys, old mailbox passwords and pagination changed. Run `pnpm setup:check` and configure mailbox signing, OAuth and the first administrator before deployment.
>
> See [CHANGELOG](CHANGELOG.md) for release notes.

---

## 🚀 One-click Deploy

<div align="center">

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/PIKACHUIM/vmail"><img src="https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy to Cloudflare Workers" height="38"></a>&nbsp;
<a href="https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FPIKACHUIM%2Fvmail&project-name=vmail&install-command=pnpm%20install&build-command=pnpm%20run%20build&output-directory=frontend%2Fbuild%2Fclient"><img src="https://img.shields.io/badge/Deploy-EdgeOne%20Pages-006EFF?style=for-the-badge" alt="Deploy to EdgeOne Pages" height="38"></a>&nbsp;
<a href="https://esa.console.aliyun.com/"><img src="https://img.shields.io/badge/Deploy-ESA%20Pages-FF6A00?style=for-the-badge&logo=alibabacloud&logoColor=white" alt="Deploy to ESA Pages" height="38"></a>

</div>

| Platform                    | What it can host                                           | What the button does                                                          |
| --------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Cloudflare Workers**      | Everything: inbound mail, D1 storage, sending, rate limits | Forks the repo, provisions D1 / Durable Objects, wires up Workers Builds      |
| **Tencent EdgeOne Pages**   | Frontend static site only                                  | Imports the repo and builds `frontend/build/client` with the parameters below |
| **Alibaba Cloud ESA Pages** | Frontend static site only                                  | Opens the ESA console to import the GitHub repo and build                     |

> [!WARNING]
> Inbound mail needs Cloudflare **Email Routing**, storage needs **D1**, and quotas/rate limits need **Durable Objects**.
> EdgeOne Pages and ESA Pages only host static assets, so the UI loads but **mail receiving, sign-in and persistence will not work**. Use Cloudflare Workers for the full product; the other two are suitable for frontend previews or extra CDN coverage.

### ① Cloudflare Workers (recommended, full feature set)

1. Click **Deploy to Cloudflare Workers** above and sign in to GitHub and Cloudflare.
   Cloudflare copies the repository into your own GitHub account and provisions D1, Durable Objects and the rest.
2. Fill in the build/deploy commands on the setup page and provide the environment variables (at minimum `EMAIL_DOMAIN` and the three signing secrets; see [Environment variables](#-environment-variables)).
   The one-click flow provisions resources only — it does **not** generate secrets or OAuth credentials for you.
3. After deployment, validate your configuration locally:

   ```bash
   cp .env.example .env    # D1 / domains / secrets
   pnpm install --frozen-lockfile
   pnpm setup:check
   ```

4. In the Cloudflare dashboard, enable **Email Routing → Catch-all → Send to a Worker** for the mailbox domain and point it at this Worker.
   If automatic binding did not apply (for example `wrangler.jsonc` still holds placeholders), follow [Manual deployment](#-self-hosted-tutorial), fill in the D1 ID and run `pnpm deploy`.

### ② Tencent EdgeOne Pages (static frontend)

Click **Deploy to EdgeOne Pages** — the repository and build parameters are prefilled:

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Install command  | `pnpm install`          |
| Build command    | `pnpm run build`        |
| Output directory | `frontend/build/client` |

The output is a static React SPA; `/api/*` calls must point at an already deployed Cloudflare Worker (reverse proxy or a custom API origin). Platform docs: [Deploy Button](https://pages.edgeone.ai/document/deploy-button).

### ③ Alibaba Cloud ESA Pages (static frontend)

Click **Deploy to ESA Pages**, then in the ESA console choose **Edge Computing → Functions & Pages → Create → Import GitHub repository** and fill in:

| Setting            | Value                     |
| ------------------ | ------------------------- |
| Install command    | `pnpm install`            |
| Build command      | `pnpm run build`          |
| Assets directory   | `./frontend/build/client` |
| Not-found strategy | `singlePageApplication`   |

You can also commit an `esa.jsonc` at the repository root to pin these settings. Platform docs: [Quick start](https://help.aliyun.com/document_detail/2982903.html).

---

## ✨ Features

- 🎯 Anonymous mailbox creation and receiving; sign-in required for sending and API keys
- ✈️ Support email sending and receiving
- ✨ Save server-issued credentials to restore unexpired mailboxes
- 😄 Support multiple domain name suffixes
- 🔌 **Open RESTful API**, support programmatic access
- 🛡️ Built-in quotas, rate limits, bans and sending audit
- 🚀 100% open source, quick deployment, pure Cloudflare solution, no server required

### How it works

```mermaid
flowchart TD
    M["Remote mail servers"] -->|"MX records"| R["Cloudflare Email Routing"]
    R -->|"Catch-all → Worker"| W["Email Worker<br/>parse · validate · store"]
    U["Browser<br/>Vite + React"] --> A["Worker API<br/>Hono"]
    A --> W
    W --> D[("Cloudflare D1<br/>mailboxes · messages · API keys")]
    A --> L["Durable Objects<br/>quotas · rate limits · audit"]
    A -->|"send"| S["Resend / MailChannels /<br/>Cloudflare send_email"]
```

- Receiving: Cloudflare Email Worker handles inbound mail
- Displaying: Vite + React frontend, assets served by the Worker
- Storage: Cloudflare D1
- Sending: Resend API, MailChannels API or native Cloudflare sending

---

## 🖼️ Dashboard preview

Manage API keys, mailboxes, messages and account information on separate pages. Administrators have dedicated user management, request log, sending and deployment settings pages. The dashboard defaults to dark mode with a persistent light-mode switch. [API documentation](https://vmail.dev/api-docs) is public.

Actual screenshots from a local demo account, with no real user details or access secrets.

| Home                          | Dark dashboard                                    |
| ----------------------------- | ------------------------------------------------- |
| ![Home](docs/images/home.png) | ![Dark dashboard](docs/images/dashboard-dark.png) |

| Compose email                            | Outgoing mail administration                                    |
| ---------------------------------------- | --------------------------------------------------------------- |
| ![Compose email](docs/images/sender.png) | ![Outgoing mail administration](docs/images/outbound-admin.png) |

<details>
<summary>Light theme and mobile view</summary>

![Light dashboard](docs/images/dashboard-light.png)

<img src="docs/images/dashboard-mobile.png" alt="Mobile API key management" width="390" />

![Administrator deployment settings](docs/images/deployment-settings.png)

</details>

---

## 👋 Self-hosted tutorial

This project is based on Cloudflare Workers and Cloudflare D1. All you need is a domain name hosted on Cloudflare.

### Requirements

- [Cloudflare](https://dash.cloudflare.com/) account and a domain name hosted on Cloudflare
- Local installation of [Node.js](https://nodejs.org) (version >= 22.x) and [pnpm](https://pnpm.io/installation)
- At least one OAuth provider (GitHub / Google) for sign-in, API keys and web sending

### Automatic deployment (recommended)

This project includes a pre-configured GitHub Action workflow to help you automatically deploy the Vmail application to Cloudflare.

For detailed steps, please refer to the [GitHub Action Auto-Deployment Tutorial](docs/github-action-tutorial.md).

### Manual deployment

1. Clone and install:

   ```bash
   git clone https://github.com/PIKACHUIM/vmail
   cd vmail
   pnpm install --frozen-lockfile
   cp .env.example .env
   ```

2. Create a Cloudflare D1 database and fill `.env` with its name/ID, mailbox domains and secrets. Use `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` (or `CF_API_TOKEN` / `CF_ACCOUNT_ID`), or authenticate with `pnpm exec wrangler login`. The token needs Worker deployment and D1 migration permissions.

3. Configure OAuth callbacks, bootstrap admins and optional features, then run:

   ```bash
   pnpm setup:check
   pnpm deploy
   ```

   The script validates, tests, typechecks, builds, applies D1 migrations and deploys Worker assets and Durable Objects. Keep the source `wrangler.jsonc` placeholders; the script generates the ignored, secret-free `wrangler.deploy.jsonc` and uploads secrets separately. Cloudflare Pages variables do not configure this Workers project.

4. Match the site custom domain to `BETTER_AUTH_URL`. Enable Email Routing on mailbox domains and set Catch-all → Send to a Worker to this Worker; complete DNS setup.

---

## ⚙️ Environment variables

Configuration comes from [.env.example](.env.example) and [scripts/configure.mjs](scripts/configure.mjs). Manual deployments use an untracked `.env`; Actions uses repository Secrets/Variables. See the [deployment guide](docs/github-action-tutorial.md) for exact mappings. Dashboard edits may be overwritten by the next deployment.

### Core configuration

| Variable                            | Description                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `D1_DATABASE_NAME`/`D1_DATABASE_ID` | Required D1 name and ID; preserve on upgrade                                                                              |
| `EMAIL_DOMAIN`                      | Required allowed mailbox domains, comma-separated                                                                         |
| `MAILBOX_TOKEN_SECRET`              | Required for every deployment; independent random secret of at least 32 characters; preserve to keep mailbox tokens valid |
| `TURNSTILE_KEY`/`TURNSTILE_SECRET`  | Optional; configure both or leave both empty                                                                              |
| `PASSWORD`                          | Optional site password; does not replace OAuth or mailbox tokens                                                          |
| `SHOW_AFF`                          | Default false; true enables promotional UI                                                                                |
| `ENABLE_OPENAPI`                    | Default false; true enables /api/v1/\* and API key creation; does not hide public docs or control web sending             |
| `SUSPEND_DATABASE_ACCESS`           | Default false; true pauses HTTP database paths, inbound mail and cleanup; queued statistics may still write               |

### OAuth and administrators

| Variable                                  | Description                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_URL`                         | HTTPS site origin, e.g. https://mail.example.com, without a path; local .dev.vars may use http://localhost:8787 |
| `BETTER_AUTH_SECRET`                      | Independent random session signing secret, at least 32 characters                                               |
| `API_KEY_SECRET`                          | Independent random API key signing secret, at least 32 characters; rotation invalidates existing keys           |
| `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` | GitHub OAuth App credentials; use GH_OAUTH_CLIENT_ID / GH_OAUTH_CLIENT_SECRET in Actions                        |
| `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` | Google OAuth Web application credentials                                                                        |
| `ADMIN_EMAILS`                            | Optional comma-separated verified OAuth emails for bootstrap admins; other new users have role user             |

Sign-in, API keys and web sending require complete OAuth configuration for both providers, even when public API access stays disabled. Deployment validation requires it when `ENABLE_OPENAPI=true`. Anonymous mailbox creation and receiving do not require OAuth.

| Provider | Callback URL                                        |
| -------- | --------------------------------------------------- |
| GitHub   | `https://mail.example.com/api/auth/callback/github` |
| Google   | `https://mail.example.com/api/auth/callback/google` |

Replace the example origin with `BETTER_AUTH_URL`. Set Google Authorized JavaScript origins to the site origin and add test users while in Testing mode. Set your verified email in `ADMIN_EMAILS` before signing in to `/dashboard/admin/users`; the first registered user is not automatically an admin.

### Quotas and cost controls

| Variable                        | Default | Scope                                                                    |
| ------------------------------- | ------- | ------------------------------------------------------------------------ |
| `API_RATE_LIMIT_PER_MINUTE`     | 30      | API requests per user per minute, shared across keys                     |
| `API_DAILY_LIMIT`               | 1000    | API requests per user per day                                            |
| `MAILBOX_DAILY_LIMIT`           | 20      | API mailbox creations per user per day                                   |
| `MAX_ACTIVE_MAILBOXES`          | 20      | Active mailboxes per user                                                |
| `GLOBAL_API_DAILY_LIMIT`        | 100000  | Daily HTTP database-path budget, including web and auth; 16 fixed shards |
| `GLOBAL_INBOUND_DAILY_LIMIT`    | 100000  | Daily inbound email budget across 16 fixed shards                        |
| `MAILBOX_INBOUND_DAILY_LIMIT`   | 100     | Inbound messages per mailbox per day                                     |
| `MAX_EMAIL_BYTES`               | 262144  | Maximum inbound message size in bytes (256 KiB)                          |
| `SEND_USER_DAILY_LIMIT`         | 10      | Daily sending attempts per user, shared across mailboxes                 |
| `SEND_GLOBAL_DAILY_LIMIT`       | 100     | Daily sending attempts across the site, separate from inbound budget     |
| `SEND_RATE_LIMIT_PER_MINUTE`    | 3       | Sending attempts per user and per mailbox per minute (runtime cap 1,000) |
| `SEND_IP_RATE_LIMIT_PER_MINUTE` | 10      | Sending attempts per IP per minute (runtime cap 1,000)                   |

Numeric settings must be positive integers. Daily quotas reset at 00:00 UTC. Each user can hold **3 active API keys**, valid for 90 days; the key count is not an environment variable. Anonymous web use also has 20 creations and 3,000 requests per IP daily, plus 30 requests/minute and 3,000/day per mailbox. Busy global shards may exhaust early. These limits are not a hard cap on the Cloudflare bill.

### Sending configuration

| Variable               | Description                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `SEND_CHANNEL`         | Empty disables sending; resend / mailchannels / cloudflare; send_email is a legacy alias |
| `SENDER_EMAIL`         | Required for sending; fixed provider-approved sender; temporary mailbox is Reply-To      |
| `RESEND_API_KEY`       | Required only for resend                                                                 |
| `MAILCHANNELS_API_KEY` | Required only for mailchannels                                                           |

Sending requires a signed-in, non-banned user and a valid mailbox token. Provider failures consume quota; Durable Objects enforce limits before D1 send-log writes. Users view `/dashboard/outbound`; admins review the site at `/dashboard/admin/outbound`. Native Cloudflare sending uses `SEND_EMAIL` and requires Email Routing and Cloudflare recipient/sender permissions; arbitrary recipients are not guaranteed.

`COOKIES_SECRET` belongs to the legacy frontend mailbox-password scheme and is unused by the deployment script; new deployments do not need it. The three signing secrets serve different purposes.

---

## 🔨 Local development

Use independent test secrets. Wrangler reads local bindings from `.dev.vars`; the deployment script reads `.env`. Keep these separate.

```bash
cp .dev.vars.example .dev.vars
# Fill local signing secrets before starting.
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

Open `http://localhost:8787`. `pnpm dev` builds and serves the frontend through Wrangler; it does not start Vite HMR. Run `pnpm frontend:dev` separately for HMR. Use the same-origin 8787 entry and matching callbacks for OAuth/sending. Local D1/DO are simulated; a remote database is not required. `pnpm setup:check` validates deployment `.env`; use `pnpm test` and `pnpm typecheck` for code checks.

---

## 📖 API Documentation

Vmail provides a complete RESTful API for programmatic access to create temporary mailboxes and query inboxes.

### Get API Key

Sign in to the [API key dashboard](https://vmail.dev/dashboard/keys) to create a free API key. The [API documentation](https://vmail.dev/api-docs) remains public. Self-hosted instances must set `ENABLE_OPENAPI=true` first.

### API Endpoints

| Method   | Endpoint                                    | Description                 |
| -------- | ------------------------------------------- | --------------------------- |
| `POST`   | `/api/v1/mailboxes`                         | Create temporary mailbox    |
| `GET`    | `/api/v1/mailboxes/:id`                     | Get mailbox information     |
| `GET`    | `/api/v1/mailboxes/:id/messages`            | Get inbox (with pagination) |
| `GET`    | `/api/v1/mailboxes/:id/messages/:messageId` | Get message details         |
| `DELETE` | `/api/v1/mailboxes/:id/messages/:messageId` | Delete message              |

### Quick Start

```bash
# 1. Create temporary mailbox
curl -X POST https://vmail.dev/api/v1/mailboxes \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json"

# Response: { "data": { "id": "abc123", "address": "random@domain.com", ... } }

# 2. Query inbox
curl https://vmail.dev/api/v1/mailboxes/abc123/messages \
  -H "X-API-Key: your-api-key"

# 3. Get message details
curl https://vmail.dev/api/v1/mailboxes/abc123/messages/msg_001 \
  -H "X-API-Key: your-api-key"
```

Full documentation: [https://vmail.dev/api-docs](https://vmail.dev/api-docs)

---

## 🛡️ Sending authorization, quotas and audit

After upgrading, `/api/send` requires a signed-in session, valid mailbox token and same-site Origin. Anonymous mailbox holders must sign in first. Banned accounts and mailboxes owned by another account are rejected.

New settings: `SEND_USER_DAILY_LIMIT=10` and `SEND_GLOBAL_DAILY_LIMIT=100`. Attempts, including provider failures, consume quota. User quotas span mailboxes and reset at 00:00 UTC. Existing mailbox/IP minute limits remain; the mailbox minute limit also applies per user. Durable Objects atomically reserve quota before provider dispatch.

Apply `0006_outbound_logs.sql` before deployment (the deployment script does this). Users view their own mail at `/dashboard/outbound`; admins review all content and filter by user at `/dashboard/admin/outbound`. Subject, body, addresses and result are retained for 30 days, with hourly cleanup. HTML is sandboxed and remote resources are blocked. Success means provider acceptance, not delivery; pending may mean an unconfirmed result, so do not automatically retry.

---

## 🧩 Related projects

- [Nbility Gen](https://gen.nbility.ai) - AI image and video generation
- [AttachReady](https://attachready.com) - Image/PDF conversion toolkit with API and MCP support
- [KeepVideo](https://keep.video) - Desktop video downloader for YouTube, Instagram and more

## 💬 Community

- Discord: https://discord.gg/d68kWCBDEs

---

## 📝 License

GNU General Public License v3.0 · Built on top of [oiov/vmail](https://github.com/oiov/vmail) under the upstream license.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=PIKACHUIM/vmail&type=Date)](https://star-history.com/#PIKACHUIM/vmail&Date)
