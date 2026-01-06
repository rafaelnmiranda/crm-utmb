import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID!
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/settings?error=no_code')
  }

  try {
    // Trocar código por token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          code,
          redirect_uri: MICROSOFT_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      }
    )

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error('Failed to get tokens')
    }

    // Salvar tokens no banco (precisa do user_id da sessão)
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

      await supabase.from('microsoft_tokens').upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
      })
    }

    return NextResponse.redirect('/settings?success=microsoft_connected')
  } catch (error) {
    console.error('Microsoft auth error:', error)
    return NextResponse.redirect('/settings?error=microsoft_auth_failed')
  }
}




