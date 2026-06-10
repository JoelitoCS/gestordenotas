'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Note } from '@/types/database'
import { createNote, updateNote } from '@/actions/notes'

const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <div className="editor-loading">Cargando editor...</div>,
})

const BG_COLORS = [
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Amarillo', value: '#fef08a' },
  { label: 'Verde', value: '#bbf7d0' },
  { label: 'Azul', value: '#bfdbfe' },
  { label: 'Rosa', value: '#fecdd3' },
  { label: 'Naranja', value: '#fed7aa' },
  { label: 'Morado', value: '#e9d5ff' },
  { label: 'Gris', value: '#e5e7eb' },
  { label: 'Amarillo pastel', value: '#fafaf0' },
  { label: 'Verde pastel', value: '#f0faf4' },
  { label: 'Azul pastel', value: '#f0f4fa' },
  { label: 'Rosa pastel', value: '#faf0f4' },
  { label: 'Naranja pastel', value: '#fdf6f0' },
  { label: 'Morado pastel', value: '#f5f0fa' },
  { label: 'Crema', value: '#faf8f0' },
]

interface NoteEditorProps {
  note: Note | null
  onCreated: (note: Note) => void
  onUpdated: (note: Note) => void
  onClose: () => void
}

export default function NoteEditor({ note, onCreated, onUpdated, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [bgColor, setBgColor] = useState(note?.bg_color ?? '#ffffff')
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = useCallback(() => {
    if (!title.trim()) { setError('El título no puede estar vacío'); return }
    setError(null)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)
    formData.set('bg_color', bgColor)
    formData.set('tags', tagsInput)

    startTransition(async () => {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      if (note) {
        const result = await updateNote(note.id, formData)
        if (result.error) { setError(result.error); return }
        onUpdated({ ...note, title, content, bg_color: bgColor, tags, updated_at: new Date().toISOString() })
      } else {
        const result = await createNote(formData)
        if (result.error) { setError(result.error); return }
        onCreated({ id: result.id!, user_id: '', title, content, bg_color: bgColor, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    })
  }, [title, content, bgColor, tagsInput, note, onCreated, onUpdated])

  const isLightBg = (() => {
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 160
  })()
  const modalTextColor = isLightBg ? '#1d1d1f' : '#f5f5f7'
  const modalMutedColor = isLightBg ? '#6e6e73' : 'rgba(255,255,255,0.6)'
  const modalBorderColor = isLightBg ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="editor-title-input">
      <div className="modal" data-theme="light" style={{ backgroundColor: bgColor }}>

        {/* Header */}
        <div className="modal-header" style={{ borderBottom: `1px solid ${modalBorderColor}` }}>
          <input
            id="editor-title-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la nota"
            className="title-input"
            style={{ color: modalTextColor }}
            aria-label="Título de la nota"
            maxLength={200}
            autoFocus
          />
          <button onClick={onClose} className="btn-close" aria-label="Cerrar editor"
            style={{ color: modalMutedColor, background: isLightBg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)' }}>
            ✕
          </button>
        </div>

        {error && (
          <div className="editor-error" role="alert" aria-live="assertive">⚠ {error}</div>
        )}

        {/* Editor */}
        <div className="editor-wrap">
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* Options */}
        <div className="editor-options" style={{ borderTop: `1px solid ${modalBorderColor}` }}>

          {/* Color de fondo */}
          <div className="option-group">
            <label className="option-label" style={{ color: modalMutedColor }}>Color</label>
            <div className="color-picker" role="radiogroup" aria-label="Color de fondo">
              {BG_COLORS.map(c => (
                <button key={c.value} onClick={() => setBgColor(c.value)}
                  className={`color-btn ${bgColor === c.value ? 'color-btn-active' : ''}`}
                  style={{ backgroundColor: c.value }} aria-label={c.label} aria-pressed={bgColor === c.value} title={c.label} />
              ))}
            </div>
          </div>

          {/* Etiquetas */}
          <div className="option-group">
            <label htmlFor="tags-input" className="option-label" style={{ color: modalMutedColor }}>Etiquetas</label>
            <input id="tags-input" type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              placeholder="reunión, q3, sprint..." className="tags-input"
              style={{ background: isLightBg ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.2)', color: modalTextColor, borderColor: modalBorderColor }}
              aria-describedby="tags-hint" />
            <span id="tags-hint" className="option-hint" style={{ color: modalMutedColor }}>Por comas</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: `1px solid ${modalBorderColor}` }}>
          <button onClick={onClose} className="btn-cancel" disabled={isPending}
            style={{ color: modalMutedColor, borderColor: modalBorderColor }}>
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-save" disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Guardando...' : note ? 'Guardar cambios' : 'Crear nota'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal { width: 100%; max-width: 680px; max-height: 90vh; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 24px 80px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; }
        .modal-header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 12px; }
        .title-input { flex: 1; border: none; background: transparent; font-size: 20px; font-weight: 700; letter-spacing: -0.4px; outline: none; }
        .btn-close { border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: opacity .15s; flex-shrink: 0; }
        .btn-close:hover { opacity: 0.7; }
        .editor-error { margin: 0 20px; padding: 10px 14px; background: var(--error-bg); border: 1px solid var(--error-border); border-radius: 10px; font-size: 13px; color: var(--error-text); }
        .editor-wrap { flex: 1; overflow-y: auto; min-height: 180px; max-height: 300px; }
        .editor-loading { padding: 20px; color: var(--text-muted); font-size: 14px; }
        .editor-options { padding: 12px 20px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 200px; }
        .option-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .option-label { font-size: 12px; font-weight: 500; width: 70px; flex-shrink: 0; }
        .color-picker { display: flex; gap: 7px; flex-wrap: wrap; }
        .color-btn { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform .15s, border-color .15s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .color-btn:hover { transform: scale(1.15); }
        .color-btn-active { border-color: #0071e3 !important; transform: scale(1.15); }
        .tags-input { flex: 1; padding: 6px 12px; border: 1px solid; border-radius: 10px; font-size: 13px; outline: none; transition: border-color .2s; min-width: 0; }
        .option-hint { font-size: 11px; white-space: nowrap; }
        .modal-footer { padding: 14px 20px; display: flex; justify-content: flex-end; gap: 10px; }
        .btn-cancel { background: none; border: 1px solid; border-radius: 10px; padding: 9px 18px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity .15s; }
        .btn-cancel:hover:not(:disabled) { opacity: 0.7; }
        .btn-save { background: #1d1d1f; color: #fff; border: none; border-radius: 10px; padding: 9px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
        .btn-save:hover:not(:disabled) { opacity: 0.85; }
        .btn-save:disabled, .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 480px) { .modal { border-radius: 18px; } .modal-overlay { padding: 12px; } }
      `}</style>
    </div>
  )
}
