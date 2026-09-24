---
name: "publish-to-wechat"
description: "为本 fork 准备公众号文章，优先搜索风景油画配图，并通过 Wenyan CLI 排版、上传至微信草稿箱。"
---

# 微信公众号文章发布工具 (WeChat Publisher)

这是一个专门为 AI Agent 设计的技能，用于将标准的 Markdown 文档转换为符合微信公众号排版要求的富文本并直接发布。它集成了自动化样式注入、代码高亮处理以及素材库图片自动上传功能。

## 前置要求

- **环境配置**：必须设置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET` 环境变量。
- 依赖工具：使用本 fork 构建的 CLI；在仓库运行 `pnpm install && pnpm build`，然后使用 `node dist/cli.js`。下文的 `wenyan` 指向该构建；npm 上的上游包不保证包含本 fork 的自动补封面逻辑。

## 核心能力

- **自动化排版**：支持多种内置主题（如 `orangeheart`）和代码高亮方案。
- **智能素材处理**：自动解析 Markdown 中的本地或网络图片，并同步上传至微信素材库。
- **元数据驱动**：通过 YAML Frontmatter 自动配置文章标题、封面、作者和原文链接。
- **高度可定制**：支持自定义 CSS 主题注入，满足个性化品牌视觉。

## AI Agent 指令指南：发布流程规范

### 配图选择（调用 CLI 前执行）

每次需要为公众号文章选择封面或正文装饰性配图时，优先搜索优美的风景油画。已有明确指定的图片按用户选择保留；用于说明事实的截图、图表和产品图片也保留。

1. 结合文章情绪和意象搜索，例如 `landscape oil painting river dusk public domain`。优先查看博物馆开放馆藏或 Wikimedia Commons 的作品页面，核对作者、画名、年代、油画媒介和图片使用许可。
2. 打开候选图片比较构图、色彩和清晰度，选择与文章气质相合的作品；封面还要适合横向裁切。不能只凭标题、搜索摘要或文件名判断。不要直接按文章标题从固定列表抽一张，也不要跳过搜索直接生成图片。
3. 将选中的图片下载到文章旁的素材目录，确认文件可读取。把封面路径写入 `cover:`；正文需要配图时，在合适位置插入 Markdown 图片。图下注明作者、作品名、年代、来源页面和许可；未查到的资料不要编造。同一幅画的署名不重复添加。
4. 搜索不可用或未找到合适且许可明确的作品时，说明原因。缺少封面可省略 `cover` 整行，让 CLI 从内置的 10 幅风景油画中选择备用封面。CLI 不会自动补正文配图，也不会替换已有封面。备用图片获取失败时说明失败，不声称已配图完成。

CLI 本身不搜索、不判断画面美感。内置集合仅在缺少封面时生效，按标题稳定选择，同一标题通常得到同一幅画。`--no-auto-cover` 或 `WENYAN_NO_AUTO_COVER=1` 可关闭这一备用选择；这些开关不撤销已选图片。发布前检查封面、正文图片和署名是否对应。

### Frontmatter 约束 (必须包含)

文章开头 **必须** 包含以下 YAML 块，否则发布接口将返回错误：

```yaml
---
title: 文章标题
cover: ./assets/landscape.jpg # 填入搜索选定的图片；省略此行时自动补入内置风景油画
author: 作者名称 # 可选
source_url: https://example.com/original-article # 可选，原文链接
---
```

### 核心参数说明

- `-f, --file`：**(必填)** Markdown 文件路径。
- `-t, --theme`：排版主题（本 fork 默认 `luca-readable`，正文 18px；上游内置 `default` 为 16px）。
- `-h, --highlight`：代码高亮主题（默认 `solarized-light`）。
- `--no-mac-style`：禁用代码块 Mac 风格。
- `--no-auto-cover`：关闭自动补入内置风景油画封面。

## 常用操作示例

### 1. 标准发布 (使用默认配置)
```bash
wenyan publish -f my-article.md
# 默认 luca-readable；改字号只改 themes/luca-readable.css 并 push，勿重发已发表文章
```

### 2. 指定内置主题与高亮发布
```bash
wenyan publish -f article.md -t orangeheart -h solarized-light
```

### 3. 列出所有可用主题
```bash
wenyan theme -l
```

## 故障排除 (Agent 专用)

- **IP 限制错误 (invalid ip)**：提醒用户将当前环境的出口 IP 加入微信后台的“IP 白名单”。
- **AppID/Secret 错误**：检查环境变量是否正确注入。
- **图片上传失败**：确认 Markdown 中的本地图片路径在当前目录中真实存在。
- **发布排版不符预期**：检查 YAML Frontmatter 是否符合规范。
