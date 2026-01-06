import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GlobalSearch from '@/components/GlobalSearch'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar flex flex-col items-center py-4 space-y-6 z-50">
        <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center">
          <span className="text-white font-bold text-lg">U</span>
        </div>
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-12h8V3h-8v6z" />
          </svg>
        </Link>
        <Link href="/kanban" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </Link>
        <Link href="/tasks" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </Link>
        <Link href="/organizations" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </Link>
        <Link href="/deals" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
        <Link href="/expo" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </Link>
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group">
          <svg className="w-6 h-6 text-sidebar-foreground group-hover:text-sidebar-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </aside>

      {/* Main content */}
      <div className="ml-16 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border flex-shrink-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 md:space-x-6 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-foreground whitespace-nowrap">UTMB CRM</h1>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link href="/dashboard" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Dashboard
                </Link>
                <Link href="/kanban" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Pipeline
                </Link>
                <Link href="/tasks" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Tarefas
                </Link>
                <Link href="/organizations" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Empresas
                </Link>
                <Link href="/expo" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  EXPO
                </Link>
                <Link href="/settings" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Configurações
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <GlobalSearch />
              <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[120px] md:max-w-none">{user.email}</span>
              <form action={async () => {
                'use server'
                const supabase = createServerClient()
                await supabase.auth.signOut()
                redirect('/login')
              }}>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

