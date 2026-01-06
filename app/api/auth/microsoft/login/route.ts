import { NextResponse } from 'next/server'

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID!
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI!

export async function GET() {
  const authUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?` +
    `client_id=${MICROSOFT_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}&` +
    `response_mode=query&` +
    `scope=Calendars.ReadWrite Mail.ReadWrite Mail.Send User.Read&` +
    `state=12345`

  return NextResponse.redirect(authUrl)
}




