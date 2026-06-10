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
  const [filterTag, setFilterTag] = useState<string>('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Etiquetas únicas de todas las notas del usuario
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach(n => n.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [notes])

  const filtered = useMemo(() => {
    let result = notes
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.content ?? '').toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    if (filterTag) result = result.filter(n => n.tags.includes(filterTag))
    return result
  }, [notes, search, filterTag])

  function handleCreated(note: Note) { setNotes(prev => [note, ...prev]); setShowEditor(false) }
  function handleUpdated(note: Note) { setNotes(prev => prev.map(n => n.id === note.id ? note : n)); setEditingNote(null); setShowEditor(false) }
  function handleDeleted(id: string) { setNotes(prev => prev.filter(n => n.id !== id)) }
  function handleEdit(note: Note) { setEditingNote(note); setShowEditor(true) }
  function handleClose() { setShowEditor(false); setEditingNote(null) }

  return (
    <div>
      <style>{`
        .notes-search-input { width: 100%; padding: 10px 14px 10px 36px; border: 1px solid var(--border-strong); border-radius: 12px; font-size: 14px; background: var(--surface); color: var(--text-primary); outline: none; transition: border-color .2s, box-shadow .2s; }
        .notes-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
        .notes-search-input::placeholder { color: var(--text-muted); }
        .notes-btn-new { display: inline-flex; align-items: center; gap: 6px; background: var(--btn-bg); color: var(--btn-text); border: none; border-radius: 12px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; letter-spacing: -0.2px; transition: opacity .15s; }
        .notes-btn-new:hover { opacity: 0.85; }
        .filter-chip { padding: 5px 12px; border-radius: 980px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-secondary); transition: all .15s; white-space: nowrap; }
        .filter-chip:hover { border-color: var(--border-strong); color: var(--text-primary); }
        .filter-chip.active-normal { border-color: #6e6e73; background: rgba(0,0,0,0.06); color: #1d1d1f; }
        .filter-chip.active-important { border-color: #d97706; background: #fef3c7; color: #d97706; }
        .filter-chip.active-urgent { border-color: #dc2626; background: #fee2e2; color: #dc2626; }
        .filter-chip.active-tag { border-color: var(--btn-bg); background: var(--btn-bg); color: var(--btn-text); }
      `}</style>

      {/* Toolbar búsqueda + nuevo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} aria-hidden="true" />
          <input type="search" placeholder="Buscar notas..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Buscar notas" className="notes-search-input" />
        </div>
        <button onClick={() => { setEditingNote(null); setShowEditor(true) }} className="notes-btn-new" aria-label="Crear nueva nota">
          <Plus size={15} aria-hidden="true" /> Nueva nota
        </button>
      </div>

      {/* Filtros de etiqueta */}
      {availableTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }} role="group" aria-label="Filtrar por etiqueta">
          {availableTags.map(tag => (
            <button key={tag}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className={`filter-chip ${filterTag === tag ? 'active-tag' : ''}`}
              aria-pressed={filterTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }} aria-live="polite">
          {search || filterTag ? (
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>No hay notas con estos filtros</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={22} color="var(--text-muted)" aria-hidden="true" />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Sin notas todavía</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Crea tu primera nota para empezar</p>
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
