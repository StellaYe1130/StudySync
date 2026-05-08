# StudySync

**AI-powered collaboration tool for university group projects.**
**专为大学小组作业设计的 AI 协作工具。**

> Built from real pain — lack of transparency, scheduling chaos, and free-rider problems — identified through semi-structured interviews with university students.
> 源自真实痛点：通过对大学生的半结构化访谈，识别出透明度不足、协调困难和搭便车问题。

![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Claude](https://img.shields.io/badge/Claude-Sonnet-D97706?style=flat&logo=anthropic&logoColor=white)

---

## Demo / 演示

> Screenshots below — clone and run locally to try the full experience.
> 下方为截图展示，clone 到本地即可体验完整功能。

<!-- Replace with actual screenshot -->
![Dashboard](docs/screenshot-dashboard.png)

---

## Architecture / 系统架构

```
Browser (Next.js App Router)
    │
    ├── Supabase Auth          — login / session
    ├── Supabase PostgreSQL    — projects, tasks, messages, members
    ├── Supabase Realtime      — live chat via WebSockets
    └── /api routes (Server)
            ├── /api/chat              → Anthropic Claude API
            └── /api/upload-assignment → pdf-parse → Supabase
```

All database access is protected by **Row Level Security (RLS)** policies — users can only read/write data belonging to their own projects.

所有数据库访问均由 **行级安全策略 (RLS)** 保护，用户只能读写自己项目内的数据。

---

## Features / 功能

### Team Chat + AI Assistant / 团队聊天 + AI 助手
- Real-time messaging via Supabase Realtime WebSockets / 基于 Supabase Realtime 的实时消息
- Upload assignment PDFs — AI reads the content and answers questions about your specific task / 上传作业 PDF，AI 读取内容并针对具体任务回答问题
- Ask AI to break down requirements, summarise progress, or suggest next steps / 让 AI 拆解需求、总结进度或建议下一步

### Task Board / 任务看板
- Kanban columns: To Do / In Progress / Done / Blocked / 看板列：待完成 / 进行中 / 已完成 / 阻塞
- Assign tasks to specific team members / 分配任务给指定成员
- Filter by Mine / Overdue / Blocked / This week / 按我的 / 逾期 / 阻塞 / 本周筛选
- Overdue alerts on Dashboard and Tasks / 仪表盘与任务页均显示逾期提醒

### Team Stats / 团队贡献统计
- Per-member contribution score (tasks completed × 2 + messages × 0.5) / 按成员计算贡献分（已完成任务 × 2 + 消息数 × 0.5）
- Visual contribution bars across the whole team / 全队贡献条形图

### Bingo Gamification / Bingo 游戏化
- 5×5 bingo card tied to real collaboration behaviours / 与真实协作行为绑定的 5×5 宾果卡
- Ice breaker questions to reduce social friction in new teams / 破冰问题，降低新团队社交摩擦
- Achievement badges unlocked by real activity / 真实行为解锁成就徽章
- Team milestone tracker / 团队里程碑追踪

### Dashboard Overview / 仪表盘总览
- Days-until-deadline countdown / 距截止日期倒计时
- Tasks done, overdue count, bingo progress at a glance / 一览已完成任务、逾期数量、Bingo 进度
- My tasks preview, team contribution bars, recent chat snapshot / 我的任务预览、团队贡献、最新聊天快照

---

## Key Technical Decisions / 关键技术决策

These are non-obvious problems I ran into and how I solved them.
以下是开发中遇到的非平凡问题及解决方案。

**1. Supabase Realtime filtered subscriptions**

Supabase's server-side `postgres_changes` filter (e.g. `project_id=eq.xxx`) requires `REPLICA IDENTITY FULL` on the table, which isn't set by default. Rather than altering table settings, I removed the server-side filter entirely and instead filter incoming events on the client — simpler and more portable.

Supabase 服务端 `postgres_changes` 过滤器需要表启用 `REPLICA IDENTITY FULL`，默认未开启。我选择移除服务端过滤，改为在客户端回调中过滤，更简洁也更通用。

**2. Optimistic UI for chat**

Relying solely on Realtime for the sender's own messages created a noticeable delay. I implemented optimistic updates: on send, immediately append the message to local state using the row returned from `.insert().select().single()`, then deduplicate by `id` when the Realtime event arrives for teammates.

仅依赖 Realtime 展示发送者自己的消息会有明显延迟。改用乐观更新：发送时立即用 `.insert().select().single()` 返回的行更新本地状态，Realtime 事件到达时按 `id` 去重。

**3. pdf-parse in Next.js App Router**

`pdf-parse` v2 uses `pdfjs-dist` internally, which attempts to load a Web Worker (`pdf.worker.mjs`) at runtime — this crashes under Next.js's webpack bundler. The fix is one line in `next.config.ts`:

```ts
serverExternalPackages: ['pdf-parse']
```

This tells Next.js to skip bundling the package and require it natively at runtime instead.

`pdf-parse` v2 内部依赖 `pdfjs-dist`，会在运行时加载 Web Worker，导致 Next.js webpack 打包崩溃。在 `next.config.ts` 加一行 `serverExternalPackages: ['pdf-parse']`，让 Next.js 跳过打包、直接在运行时 require，问题解决。

---

## Tech Stack / 技术栈

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth + Database | Supabase (PostgreSQL + RLS) |
| Real-time | Supabase Realtime (WebSockets) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| PDF Parsing | pdf-parse v2 |

---

## Getting Started / 本地运行

### Prerequisites / 前置条件
- Node.js 18+
- A [Supabase](https://supabase.com) project / 一个 Supabase 项目
- An [Anthropic](https://console.anthropic.com) API key / 一个 Anthropic API Key

### Installation / 安装

```bash
git clone https://github.com/StellaYe1130/StudySync.git
cd StudySync
npm install
```

### Environment Variables / 环境变量

Create a `.env.local` file / 创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Run / 启动

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User-Centred Design Process / 以用户为中心的设计过程

Built for **INFO2222 / SOFT2412** at the University of Sydney through a full UCD cycle — from research to prototype to evaluated product.
为悉尼大学 **INFO2222 / SOFT2412** 课程开发，经历完整 UCD 流程——从用研到原型再到评估。

### Research / 用户研究

Conducted **semi-structured interviews with 4 university students** who had recent group assignment experience. Interviews focused on pain points, workarounds, and unmet needs in existing tools (WeChat, Google Docs, Notion).

对 **4 名有近期小组作业经历的大学生** 进行半结构化访谈，聚焦于现有工具（微信、Google Docs、Notion）的痛点、临时解决方案和未满足需求。

Key themes identified via thematic analysis / 主题分析归纳出的核心主题：

| Theme / 主题 | Pain Point / 痛点 | Feature Built / 对应功能 |
|---|---|---|
| Transparency / 透明度 | Can't see who's doing what / 看不到谁在做什么 | Task board + contribution stats / 任务看板 + 贡献统计 |
| Coordination / 协调 | Miss deadlines, scheduling chaos / 错过截止日期、协调混乱 | Deadline countdown + overdue alerts / 倒计时 + 逾期提醒 |
| Cohesion / 凝聚力 | New teams feel awkward, free-riders / 新团队社交摩擦、搭便车 | Bingo gamification + ice breakers / Bingo 游戏化 + 破冰问题 |

### Design Process / 设计流程

- **Phase 1 / 阶段一** — GenAI platform research, rapid prototype generation / GenAI 平台调研，快速原型生成
- **Phase 2 / 阶段二** — Interviews → thematic analysis → lo-fi sketches → hi-fi Figma prototype / 访谈 → 主题分析 → 低保真草图 → 高保真 Figma 原型
- **Phase 3 / 阶段三** — Security review (RLS, input sanitisation), usability testing, LLM evaluation / 安全审查（RLS、输入净化）、可用性测试、LLM 评估

### Why AI? / 为什么加 AI？

Interviewees described spending significant time re-reading assignment PDFs to answer teammates' questions. The AI assistant was designed specifically for this: upload once, ask anything — grounded in your actual assignment content, not generic advice.

访谈中发现用户花费大量时间重读作业 PDF 来回答队友问题。AI 助手正是针对此设计：上传一次，随时提问——基于你的真实作业内容，而非泛泛建议。
