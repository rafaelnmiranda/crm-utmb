import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateMessage } from '@/lib/ai/message-generator'

function parseAiEmail(text: string): { subject: string; body: string } {
  const t = (text || '').trim()
  if (!t) return { subject: '', body: '' }

  const lines = t.split(/\r?\n/)
  let subject = ''
  let body = t

  const subjectLine = lines.find((l) => /^\s*assunto\s*:/i.test(l))
  if (subjectLine) {
    subject = subjectLine.replace(/^\s*assunto\s*:\s*/i, '').trim()
  }

  const corpoIdx = lines.findIndex((l) => /^\s*corpo\s*:\s*$/i.test(l) || /^\s*corpo\s*:/i.test(l))
  if (corpoIdx >= 0) {
    const after = lines
      .slice(corpoIdx)
      .join('\n')
      .replace(/^\s*corpo\s*:\s*/i, '')
      .trim()
    body = after
  } else if (subjectLine) {
    const idx = lines.findIndex((l) => l === subjectLine)
    const after = lines.slice(idx + 1).join('\n').trim()
    body = after || t
  }

  if (!subject) {
    const first = lines.find((l) => l.trim())?.trim() || ''
    subject = first.length > 80 ? `${first.slice(0, 77)}…` : first
  }

  return { subject, body }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dealId, template, customPrompt } = body

    // Buscar contexto do deal
    const supabase = createServerClient()
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        organizations (*),
        events (*),
        sponsorship_tiers (*)
      `)
      .eq('id', dealId)
      .single()

    if (error || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Buscar atividades recentes
    const { data: activities } = await supabase
      .from('activities')
      .select('description')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(5)

    const organization = (deal as any).organizations
    const event = (deal as any).events
    const tier = (deal as any).sponsorship_tiers

    const context = {
      organizationName: organization?.name || '',
      organizationType: deal.type || '',
      dealTitle: deal.title,
      dealValue: deal.value_monetary,
      eventName: event?.name || '',
      tierName: tier?.name || null,
      recentActivities: activities?.map((a: any) => a.description).filter(Boolean) || [],
    }

    const generatedText = await generateMessage(template, context, customPrompt)
    const parsed = parseAiEmail(generatedText)

    // Salvar mensagem gerada
    const { data: savedMessage } = await supabase
      .from('ai_messages')
      .insert([{
        deal_id: dealId,
        template_type: template,
        prompt: customPrompt || `Template: ${template}`,
        generated_text: generatedText,
      }])
      .select()
      .single()

    return NextResponse.json({
      message: generatedText,
      subject: parsed.subject,
      body: parsed.body,
      id: savedMessage?.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


