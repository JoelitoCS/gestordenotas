import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/features/ProfileForm'
import type { Profile } from '@/types/database'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase.from('profiles') as any)
    .select('full_name, avatar_url')
    .eq('id', user!.id)
    .single()

  const profile = profileRaw as Pick<Profile, 'full_name' | 'avatar_url'> | null

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>
      <ProfileForm
        userName={profile?.full_name ?? 'Usuario'}
        userEmail={user!.email ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <style>{`
        .page { padding: 36px 40px; max-width: 720px; width: 100%; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: #1d1d1f; }
        .page-subtitle { font-size: 14px; color: #aeaeb2; margin-top: 2px; }
        @media (max-width: 1024px) { .page { padding: 24px 20px; } }
        @media (max-width: 480px) { .page { padding: 20px 16px; } .page-title { font-size: 22px; } }
      `}</style>
    </div>
  )
}
