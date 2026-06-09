'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Eye, EyeOff, Copy, Trash2, X, Check } from 'lucide-react'
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
  const [showConfirm, setShowConfirm] = useState(false)
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

  function handleConfirmDelete() {
    startDelete(async () => {
      const result = await deletePassword(entry.id)
      if (result.success) onDeleted(entry.id)
      setShowConfirm(false)
    })
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const progress = (countdown / REVEAL_SECONDS) * 100
  const initial = entry.service_name[0].toUpperCase()

  return (
    <>
      <article
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, transition: 'background .3s' }}
        aria-label={`Contraseña de ${entry.service_name}`}
      >
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
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            aria-label={`Eliminar ${entry.service_name}`}
            title="Eliminar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: isDeleting ? 0.4 : 0.5, transition: 'opacity .15s', touchAction: 'manipulation' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {/* Botón copiar con tooltip bocadillo */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {copied && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1d1d1f',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '5px 10px',
                      borderRadius: 8,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      animation: 'tooltipIn .2s cubic-bezier(0.22,1,0.36,1)',
                      zIndex: 10,
                    }} aria-live="polite">
                      <Check size={11} strokeWidth={2.5} color="#4ade80" aria-hidden="true" />
                      Copiado
                      {/* Flecha del bocadillo */}
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #1d1d1f',
                      }} />
                    </div>
                  )}
                  <button onClick={handleCopy} aria-label="Copiar contraseña" title="Copiar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: copied ? '#4ade80' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color .2s' }}>
                    <Copy size={13} aria-hidden="true" />
                  </button>
                </div>
                <button onClick={handleHide} aria-label="Ocultar contraseña" title="Ocultar"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  <EyeOff size={13} aria-hidden="true" />
                </button>
              </div>
              <style>{`
                @keyframes tooltipIn {
                  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
                  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
              `}</style>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }} aria-live="polite">
              Se oculta en <strong style={{ color: 'var(--text-secondary)' }}>{countdown}s</strong>
            </p>
          </div>
        ) : (
          <button onClick={handleReveal} disabled={isPending} aria-busy={isPending} aria-label={`Ver contraseña de ${entry.service_name}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, touchAction: 'manipulation' }}>
            <Eye size={14} aria-hidden="true" />
            {isPending ? 'Descifrando...' : 'Ver contraseña'}
          </button>
        )}
      </article>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-pass-title"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="#ef4444" aria-hidden="true" />
              </div>
              <button onClick={() => setShowConfirm(false)} aria-label="Cancelar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: 'var(--text-muted)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <h2 id="confirm-pass-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.3px' }}>
              Eliminar contraseña
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              ¿Seguro que quieres eliminar la entrada de <strong>"{entry.service_name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border-strong)', background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} disabled={isDeleting} aria-busy={isDeleting}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1 }}>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
