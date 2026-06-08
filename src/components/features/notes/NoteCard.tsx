'use client'

import { useState, useTransition } from 'react'
import { Trash2, X } from 'lucide-react'
import type { Note } from '@/types/database'
import { deleteNote } from '@/actions/notes'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDeleted: (id: string) => void
}

function htmlToPreview(html: string): string {
  return html
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let i = 0
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, content: string) => {
        i++
        return `${i}. ${content.replace(/<[^>]*>/g, '').trim()}\n`
      })
    })
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
      return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, content: string) => {
        return `• ${content.replace(/<[^>]*>/g, '').trim()}\n`
      })
    })
    .replace(/<\/(p|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/)
  return match ? match[1] : null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NoteCard({ note, onEdit, onDeleted }: NoteCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const preview = note.content ? htmlToPreview(note.content).slice(0, 180) : ''
  const firstImage = note.content ? extractFirstImage(note.content) : null

  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 160
  }

  const bg = note.bg_color || '#ffffff'
  const light = isLight(bg)
  const textColor = light ? '#1d1d1f' : '#f5f5f7'
  const mutedColor = light ? '#6e6e73' : 'rgba(255,255,255,0.6)'
  const tagBg = light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.15)'

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteNote(note.id)
      if (result.success) onDeleted(note.id)
      setShowConfirm(false)
    })
  }

  return (
    <>
      <article
        className="note-card"
        style={{ backgroundColor: bg }}
        aria-label={`Nota: ${note.title}`}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = ''
          ;(e.currentTarget as HTMLElement).style.transform = ''
        }}
      >
        <button
          onClick={() => onEdit(note)}
          aria-label={`Editar nota: ${note.title}`}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 16px 10px', flex: 1, textAlign: 'left', width: '100%', boxSizing: 'border-box' }}
        >
          {firstImage && (
            <div style={{ width: '100%', height: 100, borderRadius: 10, overflow: 'hidden', marginBottom: 2 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={firstImage} alt="" aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          {note.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Etiquetas">
              {note.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ background: tagBg, color: mutedColor, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 980, letterSpacing: '0.02em' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: textColor, letterSpacing: '-0.2px', lineHeight: 1.35 }}>
            {note.title}
          </h3>
          {preview && !firstImage && (
            <p style={{ fontSize: 12, color: mutedColor, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
              {preview}{preview.length >= 180 ? '...' : ''}
            </p>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 12px' }}>
          <time style={{ fontSize: 11, color: mutedColor }} dateTime={note.updated_at}>
            {formatDate(note.updated_at)}
          </time>
          <button
            onClick={e => { e.stopPropagation(); setShowConfirm(true) }}
            disabled={isPending}
            aria-label={`Eliminar nota: ${note.title}`}
            title="Eliminar"
            style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', padding: '8px', borderRadius: 8, color: mutedColor, opacity: 0.5, display: 'flex', alignItems: 'center', transition: 'opacity .15s', touchAction: 'manipulation' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </article>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="#ef4444" aria-hidden="true" />
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                aria-label="Cancelar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <h2 id="confirm-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.3px' }}>
              Eliminar nota
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              ¿Seguro que quieres eliminar <strong>"{note.title}"</strong>? Esta acción no se puede deshacer.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border-strong)', background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', transition: 'background .15s' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isPending}
                aria-busy={isPending}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, transition: 'opacity .15s' }}
              >
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .note-card {
          border-radius: 18px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow .2s, transform .2s;
          cursor: pointer;
          min-width: 0;
        }
      `}</style>
    </>
  )
}
