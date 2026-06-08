'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { Note } from '@/types/database'
import { deleteNote } from '@/actions/notes'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDeleted: (id: string) => void
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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
  const preview = note.content ? stripHtml(note.content).slice(0, 100) : ''
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

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta nota?')) return
    startTransition(async () => {
      const result = await deleteNote(note.id)
      if (result.success) onDeleted(note.id)
    })
  }

  return (
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
        style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 16px 10px', flex: 1, textAlign: 'left', width: '100%' }}
      >
        {/* Imagen preview */}
        {firstImage && (
          <div style={{ width: '100%', height: 100, borderRadius: 10, overflow: 'hidden', marginBottom: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstImage}
              alt=""
              aria-hidden="true"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Etiquetas">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ background: tagBg, color: mutedColor, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 980, letterSpacing: '0.02em' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Título */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: textColor, letterSpacing: '-0.2px', lineHeight: 1.35 }}>
          {note.title}
        </h3>

        {/* Preview texto */}
        {preview && !firstImage && (
          <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.55 }}>
            {preview}{preview.length >= 100 ? '...' : ''}
          </p>
        )}
      </button>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 12px' }}>
        <time style={{ fontSize: 11, color: mutedColor }} dateTime={note.updated_at}>
          {formatDate(note.updated_at)}
        </time>
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Eliminar nota: ${note.title}`}
          title="Eliminar"
          style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', padding: '4px 5px', borderRadius: 7, color: mutedColor, opacity: 0.5, display: 'flex', alignItems: 'center', transition: 'opacity .15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      </div>

      <style>{`
        .note-card {
          border-radius: 18px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow .2s, transform .2s;
          cursor: pointer;
        }
      `}</style>
    </article>
  )
}
