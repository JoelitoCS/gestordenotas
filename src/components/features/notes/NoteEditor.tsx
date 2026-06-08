'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Note } from '@/types/database'
import { createNote, updateNote } from '@/actions/notes'

const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <div className="editor-loading" aria-label="Cargando editor...">Cargando editor...</div>,
})

const BG_COLORS = [
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Crema', value: '#faf8f0' },
  { label: 'Azul claro', value: '#f0f4fa' },
  { label: 'Verde claro', value: '#f0faf4' },
  { label: 'Rosa claro', value: '#faf0f4' },
  { label: 'Amarillo', value: '#fafaf0' },
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

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
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
      if (note) {
        const result = await updateNote(note.id, formData)
        if (result.error) { setError(result.error); return }
        onUpdated({ ...note, title, content, bg_color: bgColor, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean), updated_at: new Date().toISOString() })
      } else {
        const result = await createNote(formData)
        if (result.error) { setError(result.error); return }
        onCreated({
          id: result.id!,
          user_id: '',
          title,
          content,
          bg_color: bgColor,
          tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    })
  }, [title, content, bgColor, tagsInput, note, onCreated, onUpdated])

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"

    >
      <div className="modal" style={{ backgroundColor: bgColor }}>
        {/* Header */}
        <div className="modal-header">
          <input
            id="editor-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la nota"
            className="title-input"
            aria-label="Título de la nota"
            maxLength={200}
            autoFocus
          />
          <button onClick={onClose} className="btn-close" aria-label="Cerrar editor">✕</button>
        </div>

        {error && (
          <div className="editor-error" role="alert" aria-live="assertive">⚠ {error}</div>
        )}

        {/* Editor */}
        <div className="editor-wrap">
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* Options */}
        <div className="editor-options">
          <div className="option-group">
            <label className="option-label">Color de fondo</label>
            <div className="color-picker" role="radiogroup" aria-label="Color de fondo de la nota">
              {BG_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setBgColor(c.value)}
                  className={`color-btn ${bgColor === c.value ? 'color-btn-active' : ''}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                  aria-pressed={bgColor === c.value}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="option-group">
            <label htmlFor="tags-input" className="option-label">Etiquetas</label>
            <input
              id="tags-input"
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="trabajo, personal, ideas"
              className="tags-input"
              aria-describedby="tags-hint"
            />
            <span id="tags-hint" className="option-hint">Separadas por comas</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" disabled={isPending}>Cancelar</button>
          <button onClick={handleSave} className="btn-save" disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Guardando...' : note ? 'Guardar cambios' : 'Crear nota'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal { width: 100%; max-width: 680px; max-height: 90vh; border-radius: 24px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 24px 80px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; }
        .modal-header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 12px; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .title-input { flex: 1; border: none; background: transparent; font-size: 20px; font-weight: 700; color: #1d1d1f; font-family: inherit; letter-spacing: -0.4px; outline: none; }
        .title-input::placeholder { color: #aeaeb2; }
        .btn-close { background: rgba(0,0,0,0.06); border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 13px; color: #6e6e73; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
        .btn-close:hover { background: rgba(0,0,0,0.1); }
        .editor-error { margin: 0 20px; padding: 10px 14px; background: #fff2f2; border: 1px solid #ffcdd2; border-radius: 10px; font-size: 13px; color: #c62828; }
        .editor-wrap { flex: 1; overflow-y: auto; min-height: 200px; max-height: 340px; }
        .editor-loading { padding: 20px; color: #aeaeb2; font-size: 14px; }
        .editor-options { padding: 14px 20px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 12px; }
        .option-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .option-label { font-size: 12px; font-weight: 500; color: #6e6e73; width: 100px; flex-shrink: 0; }
        .color-picker { display: flex; gap: 6px; }
        .color-btn { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s, border-color 0.15s; }
        .color-btn:hover { transform: scale(1.15); }
        .color-btn-active { border-color: #0071e3; transform: scale(1.15); }
        .tags-input { flex: 1; padding: 7px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 13px; font-family: inherit; background: rgba(255,255,255,0.8); color: #1d1d1f; outline: none; transition: border-color 0.2s; }
        .tags-input:focus { border-color: #0071e3; }
        .option-hint { font-size: 11px; color: #aeaeb2; }
        .modal-footer { padding: 14px 20px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: flex-end; gap: 10px; }
        .btn-cancel { background: none; border: 1px solid rgba(0,0,0,0.12); border-radius: 10px; padding: 9px 18px; font-size: 14px; font-weight: 500; font-family: inherit; color: #6e6e73; cursor: pointer; transition: background 0.15s; }
        .btn-cancel:hover:not(:disabled) { background: rgba(0,0,0,0.04); }
        .btn-save { background: #1d1d1f; color: #fff; border: none; border-radius: 10px; padding: 9px 20px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.2s, transform 0.15s; }
        .btn-save:hover:not(:disabled) { background: #3a3a3c; }
        .btn-save:active { transform: scale(0.97); }
        .btn-save:disabled, .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
