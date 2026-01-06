interface MessageContext {
  organizationName: string
  organizationType: string
  dealTitle: string
  dealValue: number | null
  eventName: string
  tierName: string | null
  recentActivities: string[]
}

export async function generateMessage(
  template: string,
  context: MessageContext,
  customPrompt?: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('AI API key not configured')
  }

  const basePrompt = buildPrompt(template, context)
  const prompt =
    customPrompt && customPrompt.trim()
      ? `${basePrompt}\n\nInstruções adicionais do usuário:\n${customPrompt.trim()}`
      : basePrompt

  // Usar OpenAI por padrão
  if (process.env.OPENAI_API_KEY) {
    return generateWithOpenAI(prompt)
  }

  // Ou Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return generateWithAnthropic(prompt)
  }

  throw new Error('No AI provider configured')
}

function buildPrompt(template: string, context: MessageContext): string {
  const lower = template.toLowerCase()
  const isEmailTemplate = lower.includes('email') || lower.includes('proposta')
  return `Você é um assistente de vendas profissional. Gere uma mensagem ${template} para o seguinte contexto:

Empresa: ${context.organizationName} (${context.organizationType})
Deal: ${context.dealTitle}
Evento: ${context.eventName}
${context.dealValue ? `Valor: R$ ${context.dealValue.toLocaleString('pt-BR')}` : ''}
${context.tierName ? `Cota: ${context.tierName}` : ''}
${context.recentActivities.length > 0 ? `Atividades recentes: ${context.recentActivities.join(', ')}` : ''}

Gere uma mensagem profissional, cordial e persuasiva em português brasileiro.
${isEmailTemplate ? `
Responda exatamente no formato abaixo (sem markdown):
ASSUNTO: <assunto curto e claro>

CORPO:
<corpo do email pronto para copiar e colar no Outlook>
` : ''}`.trim()
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de vendas profissional especializado em patrocínios esportivos.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate message')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateWithAnthropic(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate message')
  }

  const data = await response.json()
  return data.content[0].text
}


