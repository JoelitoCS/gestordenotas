'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
})

export type ProfileActionResult = {
  error?: string
  success?: boolean
  avatar_url?: string
}

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = profileSchema.safeParse({ full_name: formData.get('full_name') })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'No se ha seleccionado ningún archivo' }
  if (file.size > 5 * 1024 * 1024) return { error: 'El archivo no puede superar 5MB' }

  const ext = file.name.split('.').pop()
  // Usamos timestamp en el nombre para evitar caché del CDN
  const path = `${user.id}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from('profiles') as any)
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard', 'layout')
  return { success: true, avatar_url: publicUrl }
}

export async function changePassword(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) return { error: 'Mínimo 8 caracteres' }
  if (password !== confirm) return { error: 'Las contraseñas no coinciden' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { success: true }
}
