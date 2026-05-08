import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { taskTitle, taskStatus, taskDueDate, assigneeId, assignerEmail, projectName } = await req.json()

    if (!assigneeId || !taskTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', assigneeId)
      .maybeSingle()

    if (!profile?.email) {
      return NextResponse.json({ ok: false, reason: 'no email found' })
    }

    const name = profile.display_name || profile.email.split('@')[0]
    const due = taskDueDate ? `Due: ${taskDueDate}` : 'No due date set'

    await resend.emails.send({
      from: 'StudySync <onboarding@resend.dev>',
      to: profile.email,
      subject: `New task assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
          <h2 style="margin: 0 0 4px; font-size: 20px; font-weight: 600;">You have a new task</h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">in <strong>${projectName}</strong></p>

          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${taskTitle}</p>
            <p style="margin: 0 0 4px; font-size: 13px; color: #64748b;">Status: ${taskStatus}</p>
            <p style="margin: 0; font-size: 13px; color: #64748b;">${due}</p>
          </div>

          <p style="font-size: 13px; color: #94a3b8; margin: 0;">Assigned by ${assignerEmail}</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[notify-task]', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
