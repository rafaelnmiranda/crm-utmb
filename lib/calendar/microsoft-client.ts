import { createServerClient } from '../supabase/server'

interface MicrosoftToken {
  access_token: string
  refresh_token: string
  expires_at: string
}

export async function getMicrosoftToken(userId: string): Promise<MicrosoftToken | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('microsoft_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  // Verificar se token expirou
  if (new Date(data.expires_at) < new Date()) {
    // Refresh token seria implementado aqui
    return null
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }
}

export async function createCalendarEvent(
  accessToken: string,
  title: string,
  startTime: Date,
  endTime: Date,
  description?: string
) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/calendar/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: title,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      body: {
        contentType: 'HTML',
        content: description || '',
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create calendar event')
  }

  return response.json()
}




