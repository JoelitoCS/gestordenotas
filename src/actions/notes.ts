'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Note } from '@/types/database'

const noteSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  content: z.string().optional(),
  bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  tags: z.array(z.string()).default([]),

})

export type NoteActionResult = {
  error?: string
  success?: boolean
  id?: string
}

type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type NoteUpdate = Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export async function createNote(formData: FormData): Promise<NoteActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const tagsRaw = formData.get('tags')
  const tags = tagsRaw ? (tagsRaw as string).split(',').map(t => t.trim()).filter(Boolean) : []
  const contextRaw = formData.get('context') as string | null

  const parsed = noteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    bg_color: formData.get('bg_color') || '#ffffff',
    tags,
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const payload: NoteInsert = {
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content ?? null,
    bg_color: parsed.data.bg_color,
    tags: parsed.data.tags,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('notes') as any)
    .insert(payload)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/notes')
  return { success: true, id: data.id }
}

export async function updateNote(id: string, formData: FormData): Promise<NoteActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const tagsRaw = formData.get('tags')
  const tags = tagsRaw ? (tagsRaw as string).split(',').map(t => t.trim()).filter(Boolean) : []
  const contextRaw = formData.get('context') as string | null

  const parsed = noteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    bg_color: formData.get('bg_color') || '#ffffff',
    tags,
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const payload: NoteUpdate = {
    title: parsed.data.title,
    content: parsed.data.content ?? null,
    bg_color: parsed.data.bg_color,
    tags: parsed.data.tags,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('notes') as any)
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/notes')
  return { success: true }
}

export async function deleteNote(id: string): Promise<NoteActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('notes') as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/notes')
  return { success: true }
}
