import { createClient } from '@/lib/supabase/server'
import NotesGrid from '@/components/features/notes/NotesGrid'
import type { Note } from '@/types/database'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notesRaw } = await (supabase.from('notes') as any)
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const notes = (notesRaw ?? []) as Note[]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis notas</h1>
          <p className="page-subtitle">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <NotesGrid initialNotes={notes} />
      <style>{`
        .page { padding: 36px 40px; max-width: 1200px; width: 100%; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); }
        .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 2px; }
        @media (max-width: 1024px) { .page { padding: 24px 20px; } }
        @media (max-width: 480px) { .page { padding: 20px 16px; } .page-title { font-size: 22px; } }
      `}</style>
    </div>
  )
}
