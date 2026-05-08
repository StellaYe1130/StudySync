import Link from 'next/link'

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Assistant',
    desc: 'Upload your assignment PDF and ask anything. The AI answers based on your actual task, not generic advice.',
  },
  {
    icon: '📋',
    title: 'Task Board',
    desc: 'Kanban board with assignees, due dates, and filters. Overdue alerts keep the team on track.',
  },
  {
    icon: '💬',
    title: 'Team Chat',
    desc: 'Real-time messaging via WebSockets. No more switching between WeChat and your project tools.',
  },
  {
    icon: '📊',
    title: 'Contribution Stats',
    desc: 'See who did what. Per-member contribution scores built from real activity, not self-reporting.',
  },
  {
    icon: '🎯',
    title: 'Bingo Gamification',
    desc: 'A 5×5 bingo card tied to real collaboration habits. Ice breakers, badges, and team milestones.',
  },
  {
    icon: '⏰',
    title: 'Deadline Awareness',
    desc: 'Days-until-deadline countdown on every dashboard. Hard to miss, easy to act on.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-slate-900 tracking-tight">StudySync</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Built from real student pain points
        </div>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
          Group projects,<br />
          <span className="text-blue-600">finally under control</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          AI-powered collaboration for university teams. Chat, tasks, contribution tracking, and gamification — all in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register" className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition text-sm">
            Try it free →
          </Link>
          <a
            href="https://github.com/StellaYe1130/StudySync"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 transition text-sm flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            View source
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to fix group work?</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Create a project, invite your team, and upload your assignment PDF. The AI takes it from there.
        </p>
        <Link href="/register" className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-500 transition text-sm">
          Get started — it's free
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200">
        Built for INFO2222 / SOFT2412 · University of Sydney ·{' '}
        <a href="https://github.com/StellaYe1130/StudySync" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition">
          GitHub
        </a>
      </footer>

    </div>
  )
}
