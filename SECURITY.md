# Security policy

Values Atlas is a static, client-rendered site: **no backend, no database, no
accounts, no tracking, no cookies.** That is a deliberate design choice (see the
README), and it keeps the attack surface small. This page says what is in scope,
how the project defends itself, and how to report a problem.

## Reporting a vulnerability

Please report privately, not in a public issue:

- Use GitHub's **"Report a vulnerability"** button on the repository's
  **Security** tab (private vulnerability reporting), or
- if that is unavailable, open an issue titled "Security contact request" with
  **no exploit details**, and a maintainer will arrange a private channel.

Include what you found, how to reproduce it, and which URL or file it affects.
Good-faith reports are welcome and will be credited if you want.

## Supported versions

Only the current `main` branch (what is deployed at
<https://values-atlas.vercel.app>) is supported. Forks are on their own, but the
fixes land in the open and are easy to pull.

## What is in scope

- Cross-site scripting through the dataset (`public/data/atlas.json`) or the UI
- Missing or weak browser protections on the deployed site (headers, CSP)
- Vulnerable dependencies that reach the shipped bundle or the build
- Anything that lets a data contribution change behaviour instead of content

Out of scope: denial-of-service by traffic volume, findings that require a
modified client, social engineering, and third-party services we only link to
(Esri tiles, Fontshare, Google Fonts) except where our use of them is unsafe.

## How the project defends itself

| Layer | What it does |
|---|---|
| Output escaping | Every data-sourced string goes through `esc()` (`lib/escape.ts`) before it becomes HTML in the drawer or map popups. |
| Runtime data guard | `lib/validate.ts` checks the shape of every point after load. A malformed point is dropped with a console warning instead of breaking the page. |
| CI data gate | `pnpm validate:data` checks `atlas.json` against `atlas.schema.json`, rejects `<` and `>` anywhere in the data, rejects duplicate ids and non-https URLs. It runs on every pull request. |
| CSP and headers | `next.config.ts` sets a Content-Security-Policy that names every third-party host, plus `nosniff`, frame denial, a strict referrer policy and a locked-down Permissions-Policy. |
| Dependencies | `pnpm audit --prod` must pass in CI. Dependabot opens weekly update PRs. GitHub Actions are pinned to commit SHAs. |
| Smaller surface | The Next.js image optimizer is switched off (the site never uses it). |

## Third-party requests a visitor's browser makes

Map tiles from Esri (`server.arcgisonline.com`), and font stylesheets from
Fontshare and Google Fonts. These hosts see the visitor's IP address. Nothing
else leaves the page, and the CSP blocks everything not on that list.

## Housekeeping

`public/.well-known/security.txt` carries an `Expires` date (RFC 9116 asks for
one within a year). Renew it when it gets close.
