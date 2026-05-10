# StudySync

[English](README.md) | [中文](README.zh.md)

![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)
![Claude](https://img.shields.io/badge/Claude-Sonnet-D97706?style=flat&logo=anthropic&logoColor=white)

**AI-powered collaboration tool for university group projects.**

> Built from real pain: lack of transparency, scheduling chaos, and free-rider problems identified through semi-structured interviews with university students.

Live demo: [https://study-sync-tau-one.vercel.app](https://study-sync-tau-one.vercel.app)

GitHub: [https://github.com/StellaYe1130/StudySync](https://github.com/StellaYe1130/StudySync)

### Demo

Screenshots below. Clone and run locally to try the full experience.

![Landing Page](docs/screenshot-landing%20page.png)

![Dashboard](docs/screenshot-dashboard.png)

![AI Chat](docs/screenshot-ai%20chat.png)

### Architecture

```text
Browser (Next.js App Router)
    |
    |-- Supabase Auth          - login / session
    |-- Supabase PostgreSQL    - projects, tasks, messages, members
    |-- Supabase Realtime      - live chat via WebSockets
    `-- /api routes (Server)
            |-- /api/chat              -> Anthropic Claude API
            `-- /api/upload-assignment -> pdf-parse -> Supabase
```

All database access is protected by **Row Level Security (RLS)** policies, so users can only read and write data belonging to their own projects.

### Features

#### Team Chat + AI Assistant
- Real-time messaging via Supabase Realtime WebSockets
- Upload assignment PDFs so AI can answer questions about the specific task
- Ask AI to break down requirements, summarise progress, or suggest next steps

#### Task Board
- Kanban columns: To Do / In Progress / Done / Blocked
- Assign tasks to specific team members
- Filter by Mine / Overdue / Blocked / This week
- Overdue alerts on Dashboard and Tasks

#### Team Stats
- Per-member contribution score based on completed tasks and messages
- Visual contribution bars across the whole team

#### Bingo Gamification
- 5x5 bingo card tied to real collaboration behaviours
- Ice breaker questions to reduce social friction in new teams
- Achievement badges unlocked by real activity
- Team milestone tracker

#### Dashboard Overview
- Days-until-deadline countdown
- Tasks done, overdue count, and bingo progress at a glance
- My tasks preview, team contribution bars, and recent chat snapshot

### Key Technical Decisions

**1. Supabase Realtime filtered subscriptions**

Supabase's server-side `postgres_changes` filter, such as `project_id=eq.xxx`, requires `REPLICA IDENTITY FULL` on the table, which is not set by default. Instead of changing table settings, I removed the server-side filter and filter incoming events on the client, which is simpler and more portable.

**2. Optimistic UI for chat**

Relying only on Realtime for the sender's own messages created a noticeable delay. I implemented optimistic updates: on send, the message is immediately appended to local state using the row returned from `.insert().select().single()`, then deduplicated by `id` when the Realtime event arrives.

**3. pdf-parse in Next.js App Router**

`pdf-parse` uses `pdfjs-dist` internally, which attempts to load a Web Worker at runtime and can crash under the Next.js bundler. The fix is in `next.config.ts`:

```ts
serverExternalPackages: ['pdf-parse']
```

This tells Next.js to skip bundling the package and require it natively at runtime instead.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth + Database | Supabase (PostgreSQL + RLS) |
| Real-time | Supabase Realtime (WebSockets) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| PDF Parsing | pdf-parse |

### Getting Started

#### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

#### Installation

```bash
git clone https://github.com/StellaYe1130/StudySync.git
cd StudySync
npm install
```

#### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

#### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### User-Centred Design Process

Built for **INFO2222 / SOFT2412** at the University of Sydney through a full UCD cycle, from research to prototype to evaluated product.

#### Research

Conducted **semi-structured interviews with 4 university students** who had recent group assignment experience. Interviews focused on pain points, workarounds, and unmet needs in existing tools such as WeChat, Google Docs, and Notion.

Key themes identified via thematic analysis:

| Theme | Pain Point | Feature Built |
|---|---|---|
| Transparency | Cannot see who is doing what | Task board + contribution stats |
| Coordination | Missed deadlines and scheduling chaos | Deadline countdown + overdue alerts |
| Cohesion | New teams feel awkward; free-rider problems | Bingo gamification + ice breakers |

#### Design Process

- **Phase 1**: GenAI platform research and rapid prototype generation
- **Phase 2**: Interviews, thematic analysis, lo-fi sketches, and hi-fi Figma prototype
- **Phase 3**: Security review, usability testing, and LLM evaluation

#### Why AI?

Interviewees described spending significant time re-reading assignment PDFs to answer teammates' questions. The AI assistant was designed specifically for this: upload once, ask anything, and receive answers grounded in the team's real assignment content.
