# wenyan-cli (fork)

Fork of [caol64/wenyan-cli](https://github.com/caol64/wenyan-cli) for **Agent / CLI-only** use on Mac.

**Scope of this fork:** Markdown → WeChat Official Account **草稿箱** (draft box). No desktop/GUI apps, no MCP server packaging, no 知乎/头条 product surface.

Upstream still powers rendering via `@wenyan-md/core`. This repo is the thin CLI (+ optional HTTP `serve` for fixed-IP publish).

## Why this fork exists

- Publishers / agents need a scriptable path: `md` + images → draft
- Upstream also ships Mac App / desktop / MCP as separate products; those are out of scope here
- Keep Apache-2.0 attribution to the original author

## Features (kept)

- Publish Markdown to WeChat **draft box** (not mass-send)
- Upload local / relative / remote images and cover
- Themes + custom CSS
- Optional `serve` mode (remote publish to dodge home IP whitelist churn)
- Env-based credentials for non-interactive Agent runs

## Quick start

```bash
cd ~/Github/wenyan-cli
pnpm install
pnpm build
# or: npm install -g .   after build

export WECHAT_APP_ID=...
export WECHAT_APP_SECRET=...
# IP whitelist your machine (or use --server / --proxy)

./dist/cli.js publish -f article.md
# after link: wenyan publish -f article.md
```

Prefer `--env-file=.env` over interactive `credential --set` when an Agent runs the CLI.

## Commands

| Command | Purpose |
| --- | --- |
| [publish](docs/publish.md) | Render md and create a WeChat **draft** |
| `render` | Render styled HTML only (no upload) |
| [theme](docs/theme.md) | List / add / remove themes |
| [credential](docs/credential.md) | Credential storage helpers |
| [token](docs/token.md) | Import external access token |
| [serve](docs/server.md) | HTTP API for remote publish (IP whitelist) |

## Article format

```md
---
title: Article title
cover: ./cover.jpg   # optional if body has images
author: Luca
source_url: https://wlj.me/...
---

Body in Markdown. Local `./img.png` and https images are uploaded automatically.
```

## Agent notes

- Default target is **草稿箱**; review in mp.weixin.qq.com before 发表
- Non-interactive: set `WECHAT_APP_ID` / `WECHAT_APP_SECRET` (or `--env-file`)
- Add M2 (or server) public IP to the WeChat IP whitelist
- Planned fork work: JSON output, dry-run / `--confirm`, stronger “find images” helpers

## Upstream

- Original CLI: https://github.com/caol64/wenyan-cli  
- License: Apache-2.0 (see `LICENSE`)

Desktop / MCP products live only in upstream projects and are **not** maintained in this fork:

- https://github.com/caol64/wenyan (macOS app)
- https://github.com/caol64/wenyan-pc (desktop)
- https://github.com/caol64/wenyan-mcp (MCP)
