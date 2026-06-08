'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Eye, EyeOff, Copy, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { revealPassword, deletePassword } from '@/actions/passwords'

type PasswordEntry = {
  id: string
  service_name: string
  service_icon: string | null
  username: string
  created_at: string
  updated_at: string
}

const REVEAL_SECONDS = 60

export default function PasswordCard({ entry, onDeleted }: { entry: PasswordEntry; onDeleted: (id: string) => void }) {
  const [revealed, setRevealed] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startCountdown() {
    setCountdown(REVEAL_SECONDS)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); setRevealed(null); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function handleReveal() {
    setError(null)
    startTransition(async () => {
      const result = await revealPassword(entry.id)
      if (result.error) { setError(result.error); return }
      setRevealed(result.decrypted!)
      startCountdown()
    })
  }

  function handleHide() {
    setRevealed(null)
    setCountdown(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function handleCopy() {
    if (!revealed) return
    navigator.clipboard.writeText(revealed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${entry.service_name}"?`)) return
    startDelete(async () => {
      const result = await deletePassword(entry.id)
      if (result.success) onDeleted(entry.id)
    })
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const progress = (countdown / REVEAL_SECONDS) * 100
  const initial = entry.service_name[0].toUpperCase()

  return (
    <article style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, transition: 'background .3s' }} aria-label={`Contraseña de ${entry.service_name}`}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }} aria-hidden="true">
          {entry.service_icon
            ? <Image src={entry.service_icon} alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
            : <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{initial}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.service_name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.username}</p>
        </div>
        <button onClick={handleDelete} disabled={isDeleting} aria-label={`Eliminar ${entry.service_name}`} title="Eliminar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: isDeleting ? 0.4 : 0.5, transition: 'opacity .15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 8, padding: '8px 10px' }} role="alert">{error}</p>
      )}

      {revealed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: '100%', height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}
            role="progressbar" aria-valuenow={countdown} aria-valuemin={0} aria-valuemax={REVEAL_SECONDS} aria-label={`Se oculta en ${countdown}s`}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--btn-bg)', borderRadius: 2, transition: 'width 1s linear' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 10, padding: '9px 12px', border: '1px solid var(--border)' }}>
            <code style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontFamily: '"SF Mono","Fira Code","Courier New",monospace', wordBreak: 'break-all' }} aria-label="Contraseña revelada">{revealed}</code>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={handleCopy} aria-label="Copiar contraseña" title={copied ? 'Copiado' : 'Copiar'}
                style={{ background: copied ? 'var(--success-bg)' : 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: copied ? 'var(--success-text)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color .15s' }}>
                <Copy size={13} aria-hidden="true" />
              </button>
              <button onClick={handleHide} aria-label="Ocultar contraseña" title="Ocultar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <EyeOff size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }} aria-live="polite">
            Se oculta en <strong style={{ color: 'var(--text-secondary)' }}>{countdown}s</strong>
          </p>
        </div>
      ) : (
        <button onClick={handleReveal} disabled={isPending} aria-busy={isPending} aria-label={`Ver contraseña de ${entry.service_name}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 9, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, transition: 'opacity .15s' }}>
          <Eye size={14} aria-hidden="true" />
          {isPending ? 'Descifrando...' : 'Ver contraseña'}
        </button>
      )}
    </article>
  )
}
