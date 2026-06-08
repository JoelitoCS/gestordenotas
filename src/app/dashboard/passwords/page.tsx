import { createClient } from '@/lib/supabase/server'
import PasswordsGrid from '@/components/features/passwords/PasswordsGrid'
import type { PasswordEntry } from '@/types/database'

type PasswordRow = Pick<PasswordEntry, 'id' | 'service_name' | 'service_icon' | 'username' | 'created_at' | 'updated_at'>

export default async function PasswordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: passwordsRaw } = await (supabase.from('password_entries') as any)
    .select('id, service_name, service_icon, username, created_at, updated_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const passwords = (passwordsRaw ?? []) as PasswordRow[]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contraseñas</h1>
          <p className="page-subtitle">{passwords.length} entrada{passwords.length !== 1 ? 's' : ''} guardada{passwords.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <PasswordsGrid initialPasswords={passwords} />
      <style>{`
        .page { padding: 36px 40px; max-width: 1200px; width: 100%; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: #1d1d1f; }
        .page-subtitle { font-size: 14px; color: #aeaeb2; margin-top: 2px; }
        @media (max-width: 1024px) { .page { padding: 24px 20px; } }
        @media (max-width: 480px) { .page { padding: 20px 16px; } .page-title { font-size: 22px; } }
      `}</style>
    </div>
  )
}
