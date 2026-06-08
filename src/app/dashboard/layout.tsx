import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { Profile } from '@/types/database'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase.from('profiles') as any)
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Pick<Profile, 'full_name' | 'avatar_url'> | null

  return (
    <div className="dashboard">
      <Sidebar
        userName={profile?.full_name ?? user.email ?? 'Usuario'}
        avatarUrl={profile?.avatar_url ?? null}
        userEmail={user.email ?? ''}
      />
      <main id="main-content" className="dashboard-main">
        {children}
      </main>
      <style>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #f5f5f7;
        }
        .dashboard-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          /* En móvil el main ocupa todo el ancho */
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 1024px) {
          .dashboard {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
