'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { register, loginWithGoogle } from '@/actions/auth'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleGoogle() {
    startTransition(async () => {
      const result = await loginWithGoogle()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main id="main-content" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f5f5f7' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <Link href="/" aria-label="Volver al inicio" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1d1d1f', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', marginBottom: 32 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="22" height="22" rx="6" fill="#1d1d1f"/>
            <path d="M6 11h10M11 6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Clavey
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.6px', color: '#1d1d1f', marginBottom: 4 }}>Crear cuenta</h1>
        <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 28 }}>Empieza gratis, sin tarjeta de crédito</p>

        {error && (
          <div role="alert" aria-live="assertive" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#b91c1c', marginBottom: 20 }}>
            <AlertCircle size={15} aria-hidden="true" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="full_name" style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Nombre completo</label>
            <input id="full_name" name="full_name" type="text" autoComplete="name" required placeholder="Joel Cano" disabled={isPending} aria-required="true"
              style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 12, fontSize: 15, color: '#1d1d1f', background: '#fafafa', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@email.com" disabled={isPending} aria-required="true"
              style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 12, fontSize: 15, color: '#1d1d1f', background: '#fafafa', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Mínimo 8 caracteres" disabled={isPending} aria-required="true"
              style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 12, fontSize: 15, color: '#1d1d1f', background: '#fafafa', outline: 'none', width: '100%' }} />
            <span style={{ fontSize: 12, color: '#aeaeb2' }}>Mínimo 8 caracteres</span>
          </div>
          <button type="submit" disabled={isPending} aria-busy={isPending}
            style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, letterSpacing: '-0.2px', marginTop: 4 }}>
            {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: '#aeaeb2', fontSize: 13 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} aria-hidden="true" />
          <span>o regístrate con</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} aria-hidden="true" />
        </div>

        <button onClick={handleGoogle} disabled={isPending} aria-label="Registrarse con Google"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, background: '#fff', fontSize: 15, fontWeight: 500, color: '#1d1d1f', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
          </svg>
          Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6e6e73', marginTop: 24 }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={{ color: '#1d1d1f', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>Iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}
