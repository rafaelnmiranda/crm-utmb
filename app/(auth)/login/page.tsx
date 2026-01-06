'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResetSent(false)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro de login:', error)
        setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
        setLoading(false)
        return
      }

      if (data.user) {
        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/kanban')
        router.refresh()
      } else {
        setError('Erro ao fazer login. Tente novamente.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err)
      setError(err.message || 'Erro inesperado ao fazer login.')
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Por favor, informe seu email para recuperar a senha.')
      return
    }

    setResetLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        setError(error.message || 'Erro ao solicitar reset de senha.')
        setResetLoading(false)
        return
      }

      setResetSent(true)
      setResetLoading(false)
    } catch (err: any) {
      console.error('Erro inesperado:', err)
      setError(err.message || 'Erro inesperado ao solicitar reset de senha.')
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">UTMB CRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça login para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || resetLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            
            {resetSent ? (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading || loading}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}


