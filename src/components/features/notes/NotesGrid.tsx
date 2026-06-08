'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import type { Note } from '@/types/database'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

interface NotesGridProps {
  initialNotes: Note[]
}

export default function NotesGrid({ initialNotes }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content ?? '').toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [notes, search])

  function handleCreated(note: Note) { setNotes(prev => [note, ...prev]); setShowEditor(false) }
  function handleUpdated(note: Note) { setNotes(prev => prev.map(n => n.id === note.id ? note : n)); setEditingNote(null); setShowEditor(false) }
  function handleDeleted(id: string) { setNotes(prev => prev.filter(n => n.id !== id)) }
  function handleEdit(note: Note) { setEditingNote(note); setShowEditor(true) }
  function handleClose() { setShowEditor(false); setEditingNote(null) }

  return (
    <div>
      <style>{`
        .notes-search-input {
          width: 100%;
          padding: 10px 14px 10px 36px;
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          font-size: 14px;
          background: var(--surface);
          color: var(--text-primary);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .notes-search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
        }
        .notes-search-input::placeholder { color: var(--text-muted); }
        .notes-btn-new {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--btn-bg); color: var(--btn-text);
          border: none; border-radius: 12px; padding: 10px 16px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          white-space: nowrap; letter-spacing: -0.2px;
          transition: opacity .15s;
        }
        .notes-btn-new:hover { opacity: 0.85; }
        .notes-empty-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--surface-2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .notes-empty-title { font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .notes-empty-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
        .notes-empty-search { font-size: 15px; color: var(--text-secondary); }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar notas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar notas"
            className="notes-search-input"
          />
        </div>
        <button onClick={() => { setEditingNote(null); setShowEditor(true) }} aria-label="Crear nueva nota" className="notes-btn-new">
          <Plus size={15} aria-hidden="true" /> Nueva nota
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }} aria-live="polite">
          {search ? (
            <p className="notes-empty-search">No se encontraron notas para <strong>"{search}"</strong></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="notes-empty-icon">
                <Search size={22} color="var(--text-muted)" aria-hidden="true" />
              </div>
              <p className="notes-empty-title">Sin notas todavía</p>
              <p className="notes-empty-sub">Crea tu primera nota para empezar</p>
              <button onClick={() => setShowEditor(true)} className="notes-btn-new">
                <Plus size={15} aria-hidden="true" /> Crear nota
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }} role="list" aria-label="Lista de notas">
          {filtered.map(note => (
            <li key={note.id}>
              <NoteCard note={note} onEdit={handleEdit} onDeleted={handleDeleted} />
            </li>
          ))}
        </ul>
      )}

      {showEditor && (
        <NoteEditor note={editingNote} onCreated={handleCreated} onUpdated={handleUpdated} onClose={handleClose} />
      )}
    </div>
  )
}
