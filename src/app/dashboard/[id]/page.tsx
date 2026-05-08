'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Project = { id: string; name: string; course_code: string; due_date: string }

const NAV = [
  { section: 'Main', items: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'chat', label: 'Chat' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'calendar', label: 'Calendar' },
  ]},
  { section: 'Team', items: [
    { key: 'stats', label: 'Stats' },
    { key: 'bingo', label: 'Bingo' },
  ]},
  { section: 'Account', items: [
    { key: 'settings', label: 'Settings' },
  ]},
]

const BINGO_CELLS = [
  'First message', 'On-time submit', 'Help a peer', 'Give feedback', 'Start early',
  'Join meeting', 'Review a doc', 'Share a file', '3-day streak', 'React to msg',
  'Fix blocked', 'Vote in poll', 'FREE', 'Set a DDL', 'DM teammate',
  'Update task', 'Post update', 'Ask question', 'Celebrate win', 'Complete task',
  'On time x3', 'No blockers', 'Team check-in', 'Submit draft', 'Full Bingo!',
]

const ICE_BREAKERS = [
  'If your coding style were a food, what would it be?',
  "What's your go-to procrastination activity?",
  'What song describes your approach to deadlines?',
  "What's your most unpopular opinion about group projects?",
  'If you could automate one thing in uni life, what would it be?',
  "What's your biggest green flag in a group member?",
  'What meme best represents your study habits?',
  'If this assignment were a movie genre, what would it be?',
]

const BADGES = [
  { key: 'first_message', label: 'First message', icon: '💬', desc: 'Sent your first message' },
  { key: 'team_player',   label: 'Team player',   icon: '🤝', desc: 'Completed 3+ tasks' },
  { key: 'on_time',       label: 'On time',        icon: '⏰', desc: 'Completed a task before due date' },
  { key: 'bingo',         label: 'Bingo!',          icon: '🎉', desc: 'Completed a full row / column' },
  { key: 'helper',        label: 'Helper',          icon: '🙌', desc: 'Sent 10+ messages' },
  { key: 'streak',        label: 'Streak 7d',       icon: '🔥', desc: 'Active 7 days in a row' },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase.from('projects').select('*').eq('id', id).single()
        .then(({ data: p }) => { setProject(p); setLoading(false) })
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ── Sidebar ── */}
      <aside className="w-52 bg-slate-700 flex flex-col fixed h-full z-10">
        <div className="px-4 py-5 border-b border-slate-600">
          <button onClick={() => router.push('/dashboard')} className="text-xs text-slate-400 hover:text-slate-200 mb-3 block transition">
            ← Back
          </button>
          <div className="text-sm font-semibold text-white">StudySync</div>
          {project?.course_code && (
            <span className="mt-1.5 inline-block text-xs bg-blue-500/25 text-blue-300 px-2 py-0.5 rounded-full font-medium">
              {project.course_code}
            </span>
          )}
          <p className="text-xs text-slate-400 mt-1 truncate leading-snug">{project?.name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV.map(s => (
            <div key={s.section} className="mb-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1">{s.section}</p>
              {s.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
                    activeTab === item.key
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs text-slate-300 truncate flex-1">{user?.email}</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 ml-52 min-h-screen">
        {activeTab === 'dashboard' && <DashboardTab project={project} projectId={id as string} userId={user?.id} userEmail={user?.email} setActiveTab={setActiveTab} />}
        {activeTab === 'tasks'     && <TasksTab     projectId={id as string} userId={user?.id} userEmail={user?.email} projectName={project?.name} />}
        {activeTab === 'chat'      && <ChatTab      projectId={id as string} userId={user?.id} userEmail={user?.email} />}
        {activeTab === 'calendar'  && <CalendarTab  project={project} />}
        {activeTab === 'stats'     && <StatsTab     projectId={id as string} userId={user?.id} />}
        {activeTab === 'bingo'     && <BingoTab     projectId={id as string} userId={user?.id} />}
        {activeTab === 'settings'  && <SettingsTab  project={project} projectId={id as string} userId={user?.id} />}
      </main>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardTab({ project, projectId, userId, userEmail, setActiveTab }: any) {
  const [tasks, setTasks]     = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [bingoCompleted, setBingoCompleted] = useState<string[]>([])

  useEffect(() => {
    supabase.from('tasks').select('*').eq('project_id', projectId)
      .then(({ data }) => setTasks(data || []))
    supabase.from('project_members').select('user_id, role, profiles(email, display_name)')
      .eq('project_id', projectId)
      .then(({ data }) => setMembers(data || []))
    supabase.from('bingo_cells').select('cell_key').eq('project_id', projectId).eq('user_id', userId)
      .then(({ data }) => setBingoCompleted(data?.map((d: any) => d.cell_key) || []))
    supabase.from('channels').select('id').eq('project_id', projectId).eq('name', 'general').maybeSingle()
      .then(({ data: ch }) => {
        if (!ch) return
        supabase.from('messages').select('*').eq('channel_id', ch.id)
          .order('created_at', { ascending: false }).limit(3)
          .then(({ data }) => setMessages((data || []).reverse()))
      })
  }, [projectId, userId])

  const done      = tasks.filter(t => t.status === 'done')
  const overdue   = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
  const myTasks   = tasks.filter(t => t.assignee_id === userId || t.created_by === userId)
  const daysLeft  = project?.due_date
    ? Math.ceil((new Date(project.due_date).getTime() - Date.now()) / 86400000)
    : null
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const contribution = members.map(m => {
    const mt   = tasks.filter(t => t.assignee_id === m.user_id)
    const pct  = mt.length ? Math.round(mt.filter((t: any) => t.status === 'done').length / mt.length * 100) : 0
    return { ...m, pct, done: mt.filter((t: any) => t.status === 'done').length, total: mt.length }
  }).sort((a, b) => b.pct - a.pct)

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-gray-900">{greeting} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          {project?.name}
          {daysLeft !== null && (
            <span className={`ml-2 font-medium ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
              · due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard label="Tasks done" value={`${done.length} / ${tasks.length}`} sub={`${tasks.length ? Math.round(done.length / tasks.length * 100) : 0}% complete`} color="bg-blue-500" />
        <StatCard label="Overdue" value={String(overdue.length)} sub={overdue.length > 0 ? 'needs attention' : 'all on track'} alert={overdue.length > 0} color="bg-amber-400" />
        <StatCard label="Bingo progress" value={`${bingoCompleted.length + 1} / 25`} sub="keep going!" color="bg-teal-500" />
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <span className="text-sm font-medium text-red-600">⚠️ {overdue.length} overdue</span>
          <span className="text-sm text-red-400 flex-1 truncate">
            {overdue.slice(0, 2).map((t: any) => t.title).join(', ')}{overdue.length > 2 ? ` +${overdue.length - 2} more` : ''}
          </span>
          <button onClick={() => setActiveTab('tasks')} className="text-xs text-red-500 font-medium hover:text-red-700 whitespace-nowrap">View →</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        {/* My tasks */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">My tasks</h3>
            <button onClick={() => setActiveTab('tasks')} className="text-xs text-blue-600 hover:text-blue-700">see all →</button>
          </div>
          {myTasks.length === 0
            ? <p className="text-sm text-gray-400">No tasks assigned</p>
            : <div className="flex flex-col gap-2">
                {myTasks.slice(0, 5).map((t: any) => {
                  const od = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-green-400' : t.status === 'in_progress' ? 'bg-amber-400' : t.status === 'blocked' ? 'bg-red-400' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${od ? 'bg-red-100 text-red-600' : t.status === 'done' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {od ? 'Overdue' : t.status.replace('_', ' ')}
                      </span>
                    </div>
                  )
                })}
              </div>
          }
        </div>

        {/* Team contribution */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Team contribution</h3>
            <button onClick={() => setActiveTab('stats')} className="text-xs text-blue-600 hover:text-blue-700">details →</button>
          </div>
          {contribution.length === 0
            ? <p className="text-sm text-gray-400">No members yet</p>
            : <div className="flex flex-col gap-3">
                {contribution.map((m: any, i: number) => {
                  const name = m.profiles?.display_name || m.profiles?.email?.split('@')[0] || '?'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 truncate">{name}{m.user_id === userId ? ' (you)' : ''}</span>
                          <span className="text-xs text-gray-400 ml-2">{m.pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </div>

        {/* Recent chat */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Recent chat</h3>
            <button onClick={() => setActiveTab('chat')} className="text-xs text-blue-600 hover:text-blue-700">open →</button>
          </div>
          {messages.length === 0
            ? <p className="text-sm text-gray-400">No messages yet</p>
            : <div className="flex flex-col gap-3">
                {messages.map((m: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                      {m.is_ai ? 'AI' : userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-2 leading-snug">{m.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(m.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Bingo mini */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Bingo card</h3>
            <button onClick={() => setActiveTab('bingo')} className="text-xs text-blue-600 hover:text-blue-700">view →</button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {BINGO_CELLS.map((cell, i) => {
              const done = bingoCompleted.includes(cell) || cell === 'FREE'
              return (
                <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs ${cell === 'FREE' ? 'bg-blue-100 text-blue-500' : done ? 'bg-teal-100 text-teal-600' : 'bg-gray-50 text-gray-200'}`}>
                  {done && cell !== 'FREE' ? '✓' : cell === 'FREE' ? '★' : ''}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, alert, color = 'bg-blue-500' }: { label: string; value: string; sub: string; alert?: boolean; color?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${alert ? 'border-l-red-400' : color.replace('bg-', 'border-l-')}`}>
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-red-500' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksTab({ projectId, userId, userEmail, projectName }: { projectId: string; userId: string; userEmail?: string; projectName?: string }) {
  const [tasks, setTasks]     = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]   = useState('all')
  const [title, setTitle]     = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus]   = useState('todo')
  const [assigneeId, setAssigneeId] = useState(userId)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { loadTasks(); loadMembers() }, [projectId])

  async function loadTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at')
    setTasks(data || [])
  }
  async function loadMembers() {
    const { data } = await supabase.from('project_members')
      .select('user_id, profiles(email, display_name)').eq('project_id', projectId)
    setMembers(data || [])
  }
  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('tasks').insert({ project_id: projectId, title, status, due_date: dueDate || null, created_by: userId, assignee_id: assigneeId })
    if (assigneeId && assigneeId !== userId) {
      fetch('/api/notify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, taskStatus: status, taskDueDate: dueDate || null, assigneeId, assignerEmail: userEmail, projectName }),
      })
    }
    setTitle(''); setDueDate(''); setStatus('todo'); setAssigneeId(userId); setShowForm(false); setSaving(false)
    loadTasks()
  }
  async function updateStatus(taskId: string, newStatus: string) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    loadTasks()
  }

  const isOverdue = (t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  const endOfWeek = new Date(Date.now() + 7 * 86400000)

  const FILTERS = [
    { key: 'all',     label: 'All',       count: tasks.length },
    { key: 'mine',    label: 'Mine',      count: tasks.filter(t => t.assignee_id === userId).length },
    { key: 'overdue', label: 'Overdue',   count: tasks.filter(isOverdue).length },
    { key: 'blocked', label: 'Blocked',   count: tasks.filter(t => t.status === 'blocked').length },
    { key: 'week',    label: 'This week', count: tasks.filter(t => t.due_date && new Date(t.due_date) <= endOfWeek && t.status !== 'done').length },
  ]

  const filtered = tasks.filter(t => {
    if (filter === 'mine')    return t.assignee_id === userId
    if (filter === 'overdue') return isOverdue(t)
    if (filter === 'blocked') return t.status === 'blocked'
    if (filter === 'week')    return t.due_date && new Date(t.due_date) <= endOfWeek && t.status !== 'done'
    return true
  })

  const COLS = [
    { key: 'todo',        label: 'To do',       color: 'text-gray-600 bg-gray-100' },
    { key: 'in_progress', label: 'In progress',  color: 'text-amber-700 bg-amber-100' },
    { key: 'done',        label: 'Done',         color: 'text-green-700 bg-green-100' },
    { key: 'blocked',     label: 'Blocked',      color: 'text-red-600 bg-red-100' },
  ]

  const initials = (uid: string) => {
    const m = members.find(m => m.user_id === uid)
    const n = m?.profiles?.display_name || m?.profiles?.email?.split('@')[0] || '?'
    return n.charAt(0).toUpperCase()
  }

  const overdueCount = tasks.filter(isOverdue).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          + New task
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm">
          <span className="text-red-500">⚠️</span>
          <span className="text-red-600 font-medium">{overdueCount} overdue</span>
          <span className="text-red-400 truncate">— {tasks.filter(isOverdue).slice(0, 2).map(t => t.title).join(', ')}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={createTask} className="bg-white border border-gray-100 rounded-2xl p-5 mb-5 flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Task title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign to</label>
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profiles?.display_name || m.profiles?.email?.split('@')[0]}{m.user_id === userId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {f.label}
            {f.count > 0 && <span className={`ml-1 px-1.5 rounded-full ${filter === f.key ? 'bg-blue-700' : 'bg-gray-100 text-gray-500'}`}>{f.count}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COLS.map(col => (
          <div key={col.key}>
            <div className={`text-xs font-medium px-3 py-1.5 rounded-lg mb-3 inline-flex items-center gap-1.5 ${col.color}`}>
              {col.label} <span className="opacity-60">{filtered.filter(t => t.status === col.key).length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {filtered.filter(t => t.status === col.key).map(t => {
                const od = isOverdue(t)
                return (
                  <div key={t.id} className={`bg-white border rounded-xl p-3 ${od ? 'border-red-200' : 'border-gray-100'}`}>
                    <p className="text-sm font-medium text-gray-800 mb-2 leading-snug">{t.title}</p>
                    <div className="flex items-center justify-between mb-2">
                      {t.due_date && (
                        <span className={`text-xs ${od ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {od ? '⚠ ' : ''}{new Date(t.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {t.assignee_id && (
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold ml-auto">
                          {initials(t.assignee_id)}
                        </div>
                      )}
                    </div>
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white">
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

function ChatTab({ projectId, userId, userEmail }: { projectId: string; userId: string; userEmail: string }) {
  const [messages, setMessages]     = useState<any[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [channelId, setChannelId]   = useState<string | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [uploading, setUploading]   = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('assignments').select('id, filename').eq('project_id', projectId)
      .then(({ data }) => setAssignments(data || []))
  }, [projectId])

  useEffect(() => {
    let rt: ReturnType<typeof supabase.channel> | null = null

    async function initChannel() {
      let ch: any = null
      const { data: ex } = await supabase.from('channels').select('id')
        .eq('project_id', projectId).eq('name', 'general').maybeSingle()
      ch = ex
      if (!ch) {
        const { data: newCh } = await supabase.from('channels')
          .insert({ project_id: projectId, name: 'general' }).select().single()
        ch = newCh
      }
      if (!ch) return
      setChannelId(ch.id)

      const { data: msgs } = await supabase.from('messages').select('*').eq('channel_id', ch.id).order('created_at')
      setMessages(msgs || [])

      rt = supabase.channel(`messages:${ch.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          if (payload.new.channel_id === ch.id) {
            setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new])
          }
        })
        .subscribe()
    }

    initChannel()
    return () => { if (rt) supabase.removeChannel(rt) }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiThinking])

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || !channelId) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const { data: inserted } = await supabase.from('messages')
      .insert({ channel_id: channelId, user_id: userId, content, is_ai: false })
      .select().single()
    if (inserted) setMessages(prev => [...prev, inserted])
    setSending(false)
  }

  async function askAI() {
    const text = input.trim()
    if (!text || !channelId) return
    setSending(true); setAiThinking(true); setInput('')
    const { data: userMsg } = await supabase.from('messages')
      .insert({ channel_id: channelId, user_id: userId, content: text, is_ai: false })
      .select().single()
    if (userMsg) setMessages(prev => [...prev, userMsg])
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, projectId }) })
      const json = await res.json()
      const reply = json.reply ?? json.error ?? 'Something went wrong.'
      const { data: aiMsg } = await supabase.from('messages')
        .insert({ channel_id: channelId, user_id: userId, content: reply, is_ai: true })
        .select().single()
      if (aiMsg) setMessages(prev => [...prev, aiMsg])
    } finally { setSending(false); setAiThinking(false) }
  }

  async function uploadPDF(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('projectId', projectId)
    const res = await fetch('/api/upload-assignment', { method: 'POST', body: form })
    const json = await res.json()
    if (json.ok) setAssignments(prev => [...prev, { id: crypto.randomUUID(), filename: json.filename }])
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="p-8 flex flex-col h-screen">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900"># general</h2>
          <p className="text-xs text-gray-400 mt-0.5">Team chat · AI assistant</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {assignments.map(a => (
            <span key={a.id} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full truncate max-w-[120px]" title={a.filename}>
              {a.filename}
            </span>
          ))}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50 whitespace-nowrap">
            {uploading ? 'Uploading...' : '+ Upload PDF'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={uploadPDF} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          {messages.length === 0 && <p className="text-sm text-gray-400 text-center mt-10">No messages yet. Say hi!</p>}
          {messages.map((m, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${m.is_ai ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                {m.is_ai ? 'AI' : userEmail.charAt(0).toUpperCase()}
              </div>
              <div className={`rounded-2xl px-4 py-2.5 max-w-lg text-sm whitespace-pre-wrap ${m.is_ai ? 'bg-blue-50 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {aiThinking && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-blue-100 text-blue-600">AI</div>
              <div className="rounded-2xl px-4 py-2.5 bg-blue-50 text-gray-400 text-sm italic">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message or ask AI..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={askAI} disabled={sending}
            className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-200 transition disabled:opacity-50">
            Ask AI
          </button>
          <button type="submit" disabled={sending}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function CalendarTab({ project }: { project: any }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Calendar</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="font-medium text-gray-900 mb-2">Shared calendar coming soon</h3>
        <p className="text-sm text-gray-400 max-w-xs">Availability comparison and meeting time polls will appear here.</p>
        {project?.due_date && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl px-5 py-3">
            <p className="text-sm text-red-600 font-medium">
              Project due: {new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsTab({ projectId, userId }: { projectId: string; userId: string }) {
  const [members, setMembers]   = useState<any[]>([])
  const [tasks, setTasks]       = useState<any[]>([])
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.from('project_members').select('user_id, role, profiles(email, display_name)').eq('project_id', projectId)
      .then(({ data }) => setMembers(data || []))
    supabase.from('tasks').select('*').eq('project_id', projectId)
      .then(({ data }) => setTasks(data || []))
    supabase.from('channels').select('id').eq('project_id', projectId).eq('name', 'general').maybeSingle()
      .then(({ data: ch }) => {
        if (!ch) return
        supabase.from('messages').select('user_id').eq('channel_id', ch.id)
          .then(({ data }) => {
            const counts: Record<string, number> = {}
            data?.forEach((m: any) => { counts[m.user_id] = (counts[m.user_id] || 0) + 1 })
            setMsgCounts(counts)
          })
      })
  }, [projectId])

  const totalMsg = Object.values(msgCounts).reduce((a, b) => a + b, 0)

  const stats = members.map(m => {
    const mt   = tasks.filter(t => t.assignee_id === m.user_id)
    const done = mt.filter((t: any) => t.status === 'done').length
    const msgs = msgCounts[m.user_id] || 0
    const score = (done * 2 + msgs * 0.5)
    const totalScore = tasks.filter(t => t.status === 'done').length * 2 + totalMsg * 0.5 || 1
    const pct = Math.min(Math.round(score / totalScore * 100), 100)
    return { ...m, done, total: mt.length, msgs, pct }
  }).sort((a, b) => b.pct - a.pct)

  const COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500']

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Stats</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h3 className="font-medium text-gray-900 mb-5">Contribution</h3>
        {stats.length === 0
          ? <p className="text-sm text-gray-400">No members yet</p>
          : <div className="flex flex-col gap-5">
              {stats.map((m, i) => {
                const name = m.profiles?.display_name || m.profiles?.email?.split('@')[0] || '?'
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{name}{m.user_id === userId ? ' (you)' : ''}</p>
                          <p className="text-xs text-gray-400">{m.done}/{m.total} tasks · {m.msgs} messages</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{m.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${COLORS[i % COLORS.length]} h-2 rounded-full transition-all`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-medium text-gray-900 mb-4">Activity summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === 'done').length}</p>
            <p className="text-xs text-gray-400 mt-1">Tasks done</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-semibold text-gray-900">{totalMsg}</p>
            <p className="text-xs text-gray-400 mt-1">Messages sent</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            <p className="text-xs text-gray-400 mt-1">Members</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bingo ────────────────────────────────────────────────────────────────────

function BingoTab({ projectId, userId }: { projectId: string; userId: string }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [members, setMembers]     = useState<any[]>([])
  const [tasks, setTasks]         = useState<any[]>([])
  const [msgCount, setMsgCount]   = useState(0)
  const [iceIdx, setIceIdx]       = useState(new Date().getDate() % ICE_BREAKERS.length)

  useEffect(() => {
    supabase.from('bingo_cells').select('cell_key').eq('project_id', projectId).eq('user_id', userId)
      .then(({ data }) => setCompleted(data?.map((d: any) => d.cell_key) || []))
    supabase.from('project_members').select('user_id, profiles(email, display_name)').eq('project_id', projectId)
      .then(({ data }) => setMembers(data || []))
    supabase.from('tasks').select('*').eq('project_id', projectId)
      .then(({ data }) => setTasks(data || []))
    supabase.from('channels').select('id').eq('project_id', projectId).eq('name', 'general').maybeSingle()
      .then(({ data: ch }) => {
        if (!ch) return
        supabase.from('messages').select('user_id').eq('channel_id', ch.id).eq('user_id', userId)
          .then(({ data }) => setMsgCount(data?.length || 0))
      })
  }, [projectId, userId])

  async function toggleCell(key: string) {
    if (key === 'FREE') return
    if (completed.includes(key)) {
      await supabase.from('bingo_cells').delete().eq('project_id', projectId).eq('user_id', userId).eq('cell_key', key)
      setCompleted(prev => prev.filter(k => k !== key))
    } else {
      await supabase.from('bingo_cells').insert({ project_id: projectId, user_id: userId, cell_key: key })
      setCompleted(prev => [...prev, key])
    }
  }

  const grid = BINGO_CELLS.map(c => completed.includes(c) || c === 'FREE')
  const LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20],
  ]
  const hasBingo = LINES.some(l => l.every(i => grid[i]))

  const myTasks   = tasks.filter(t => t.assignee_id === userId)
  const doneTasks = myTasks.filter(t => t.status === 'done')
  const earned = new Set([
    ...(msgCount >= 1      ? ['first_message'] : []),
    ...(doneTasks.length >= 3 ? ['team_player']   : []),
    ...(doneTasks.some(t => t.due_date && new Date(t.due_date) > new Date(t.created_at)) ? ['on_time'] : []),
    ...(hasBingo           ? ['bingo']           : []),
    ...(msgCount >= 10     ? ['helper']          : []),
  ])

  const MILESTONES = [
    { label: 'Team formed',        desc: 'All members joined',        done: members.length >= 2 },
    { label: 'First task created', desc: 'Project work started',      done: tasks.length > 0 },
    { label: 'First message sent', desc: 'Team communication started', done: msgCount > 0 },
    { label: 'Half tasks done',    desc: '50% completion reached',    done: tasks.length > 0 && tasks.filter(t => t.status === 'done').length >= tasks.length / 2 },
    { label: 'All tasks done',     desc: 'Project complete!',         done: tasks.length > 0 && tasks.every(t => t.status === 'done') },
  ]

  return (
    <div className="p-8">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Team Bingo</h2>
        <span className="text-sm text-gray-400">{completed.length + 1} / 25 completed</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {hasBingo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-center">
                <span className="text-blue-700 font-semibold text-sm">🎉 Bingo! You completed a line!</span>
              </div>
            )}
            <div className="grid grid-cols-5 gap-2">
              {BINGO_CELLS.map((cell, i) => {
                const done = completed.includes(cell) || cell === 'FREE'
                return (
                  <button key={i} onClick={() => toggleCell(cell)}
                    className={`aspect-square rounded-xl text-xs font-medium p-1.5 transition flex items-center justify-center text-center leading-tight ${
                      cell === 'FREE'  ? 'bg-blue-100 text-blue-600 cursor-default' :
                      done             ? 'bg-teal-100 text-teal-700 border-2 border-teal-300' :
                                         'bg-gray-50 border border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    {done && cell !== 'FREE' ? '✓' : cell}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-teal-100 border border-teal-300 inline-block" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-100 inline-block" /> Free</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200 inline-block" /> Locked</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Ice breaker */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-medium text-gray-900 mb-3">Ice breaker 🧊</h3>
            <p className="text-sm text-gray-700 font-medium leading-snug mb-3">"{ICE_BREAKERS[iceIdx]}"</p>
            <button onClick={() => setIceIdx(i => (i + 1) % ICE_BREAKERS.length)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Next question →
            </button>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-medium text-gray-900 mb-3">Badges earned</h3>
            <div className="grid grid-cols-3 gap-2">
              {BADGES.map(b => (
                <div key={b.key} title={b.desc}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center ${earned.has(b.key) ? 'bg-blue-50' : 'opacity-25 grayscale'}`}>
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-medium text-gray-900 mb-3">Milestones</h3>
            <div className="flex flex-col gap-3">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${m.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {m.done ? '✓' : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${m.done ? 'text-gray-900' : 'text-gray-400'}`}>{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  {m.done && <span className="text-xs text-green-600 font-medium">Done</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsTab({ project, projectId, userId }: { project: any; projectId: string; userId: string }) {
  const [members, setMembers]       = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting]     = useState(false)
  const [inviteMsg, setInviteMsg]   = useState('')

  useEffect(() => { loadMembers() }, [projectId])

  async function loadMembers() {
    const { data } = await supabase.from('project_members')
      .select('user_id, role, profiles(email, display_name)').eq('project_id', projectId)
    setMembers(data || [])
  }

  async function inviteMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviting(true); setInviteMsg('')
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', inviteEmail).maybeSingle()
    if (!profile) { setInviteMsg('No user found with that email.'); setInviting(false); return }
    if (members.some(m => m.user_id === profile.id)) { setInviteMsg('Already a member.'); setInviting(false); return }
    await supabase.from('project_members').insert({ project_id: projectId, user_id: profile.id, role: 'member' })
    setInviteEmail(''); setInviteMsg('Member added!'); setInviting(false)
    loadMembers()
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h3 className="font-medium text-gray-900 mb-4">Project info</h3>
        {[
          { label: 'Name',   val: project?.name },
          { label: 'Course', val: project?.course_code },
          { label: 'Due',    val: project?.due_date ? new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-400 w-16">{r.label}</span>
            <span className="text-sm text-gray-900">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-medium text-gray-900 mb-4">Team members</h3>
        {members.length > 0 && (
          <div className="flex flex-col gap-3 mb-5">
            {members.map((m, i) => {
              const name = m.profiles?.display_name || m.profiles?.email || '?'
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">{m.profiles?.email} · {m.role}</p>
                  </div>
                  {m.user_id === userId && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>}
                </div>
              )
            })}
          </div>
        )}
        <form onSubmit={inviteMember} className="flex gap-2">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            placeholder="Invite by email" type="email" required
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={inviting}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {inviting ? '...' : 'Invite'}
          </button>
        </form>
        {inviteMsg && (
          <p className={`text-xs mt-2 ${inviteMsg.includes('added') ? 'text-green-600' : 'text-red-500'}`}>{inviteMsg}</p>
        )}
      </div>
    </div>
  )
}
