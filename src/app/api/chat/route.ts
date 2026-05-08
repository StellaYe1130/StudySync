import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
  const { message, projectId } = await req.json()

  let context = ''

  // 读取项目信息
  const { data: project } = await supabase
    .from('projects')
    .select('name, course_code, due_date')
    .eq('id', projectId)
    .single()

  if (project) {
    context += `Project: ${project.name} (${project.course_code}), due ${project.due_date}\n`
  }

  // 读取任务
  const { data: tasks } = await supabase
    .from('tasks')
    .select('title, status, due_date')
    .eq('project_id', projectId)

  if (tasks && tasks.length > 0) {
    context += `\nCurrent tasks:\n`
    tasks.forEach(t => {
      context += `- ${t.title} [${t.status}]${t.due_date ? ` due ${t.due_date}` : ''}\n`
    })
  }

  // 读取作业要求 PDF
  const { data: assignments } = await supabase
    .from('assignments')
    .select('content, filename')
    .eq('project_id', projectId)

  if (assignments && assignments.length > 0) {
    context += `\nAssignment requirements:\n`
    assignments.forEach(a => {
      context += `[${a.filename}]\n${a.content}\n\n`
    })
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are StudySync AI, a helpful assistant for university group projects.
You have access to the following project context:
${context}

You can help with:
- Breaking down assignment requirements into tasks
- Checking project progress
- Answering questions about the assignment
- Suggesting next steps

Be concise and helpful. If asked to create tasks, list them clearly.`,
    messages: [{ role: 'user', content: message }]
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('[chat]', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}