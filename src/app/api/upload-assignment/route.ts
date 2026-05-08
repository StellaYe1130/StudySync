import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pdfParse from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const projectId = formData.get('projectId') as string | null

  if (!file || !projectId) {
    return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await pdfParse(buffer)

  await supabase.from('assignments').insert({
    project_id: projectId,
    filename: file.name,
    content: result.text,
  })

  return NextResponse.json({ ok: true, filename: file.name })
}
