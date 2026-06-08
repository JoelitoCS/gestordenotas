'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { FileText, Lock, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react'
import { logout } from '@/actions/auth'
import { useTheme } from '@/components/ThemeProvider'

interface SidebarProps {
  userName: string
  avatarUrl: string | null
  userEmail: string
}

const navItems = [
  { href: '/dashboard/notes', label: 'Notas', icon: FileText },
  { href: '/dashboard/passwords', label: 'Contraseñas', icon: Lock },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
]

export default function Sidebar({ userName, avatarUrl, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => { setMobileOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function handleLogout() {
    startTransition(async () => { await logout() })
  }

  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const SidebarContent = () => (
    <>
      {/* Logo + close btn */}
      <div style={{ padding: '2px 10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" aria-label="Clavis inicio" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="22" height="22" rx="6" fill="var(--btn-bg)"/>
            <path d="M6 11h10M11 6v10" stroke="var(--btn-text)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Clavey
        </Link>
        <button onClick={() => setMobileOpen(false)} className="sidebar-close-btn" aria-label="Cerrar menú">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Secciones principales" style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }} role="list">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px',
                    borderRadius: 10, fontSize: 14, fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    textDecoration: 'none', transition: 'background .15s, color .15s',
                  }}>
                  <item.icon size={16} aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={`Avatar de ${userName}`} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--btn-bg)', color: 'var(--btn-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
          </div>
        </div>
        {/* Theme toggle */}
        <button onClick={toggle} aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
          {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
        </button>
        {/* Logout */}
        <button onClick={handleLogout} disabled={isPending} aria-label="Cerrar sesión" title="Cerrar sesión"
          style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: isPending ? 0.5 : 1, flexShrink: 0, transition: 'color .15s' }}>
          <LogOut size={15} aria-hidden="true" />
        </button>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .sidebar-desktop {
          width: 240px; min-height: 100vh; background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 20px 10px; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
          transition: background .3s, border-color .3s;
        }
        .mobile-topbar {
          display: none; position: sticky; top: 0; z-index: 50;
          background: var(--surface); border-bottom: 1px solid var(--border);
          padding: 0 20px; height: 54px; align-items: center; justify-content: space-between;
          transition: background .3s;
        }
        .mobile-logo {
          display: flex; align-items: center; gap: 8px; text-decoration: none;
          color: var(--text-primary); font-weight: 700; font-size: 15px; letter-spacing: -0.3px;
        }
        .mobile-topbar-right { display: flex; align-items: center; gap: 6px; }
        .hamburger-btn {
          background: none; border: none; cursor: pointer; padding: 6px; border-radius: 10px;
          color: var(--text-primary); display: flex; align-items: center; justify-content: center; transition: background .15s;
        }
        .hamburger-btn:hover { background: var(--surface-2); }
        .topbar-theme-btn {
          background: none; border: none; cursor: pointer; padding: 6px; border-radius: 10px;
          color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: background .15s;
        }
        .topbar-theme-btn:hover { background: var(--surface-2); }
        .mobile-overlay {
          display: none; position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0); transition: background 0.35s ease; pointer-events: none;
        }
        .mobile-overlay.open { background: rgba(0,0,0,0.35); pointer-events: all; }
        .mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
          background: var(--surface); z-index: 101; display: flex; flex-direction: column; padding: 20px 10px;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), background .3s;
          box-shadow: 4px 0 32px rgba(0,0,0,0.12);
          padding-left: max(10px, env(safe-area-inset-left));
          padding-top: max(20px, env(safe-area-inset-top));
          padding-bottom: max(20px, env(safe-area-inset-bottom));
        }
        .mobile-drawer.open { transform: translateX(0); }
        .sidebar-close-btn {
          display: none; background: var(--surface-2); border: none; border-radius: 10px;
          padding: 6px; cursor: pointer; color: var(--text-primary);
          align-items: center; justify-content: center; transition: background .15s;
        }
        .sidebar-close-btn:hover { background: var(--border); }

        @media (max-width: 1024px) {
          .sidebar-desktop { display: none; }
          .mobile-topbar { display: flex; }
          .mobile-overlay { display: block; }
          .sidebar-close-btn { display: flex; }
        }
        @media (min-width: 1025px) {
          .mobile-topbar { display: none !important; }
          .mobile-overlay { display: none !important; }
          .mobile-drawer { display: none !important; }
          .sidebar-desktop { display: flex; }
        }
      `}</style>

      {/* DESKTOP */}
      <aside className="sidebar-desktop" aria-label="Navegación del dashboard">
        <SidebarContent />
      </aside>

      {/* MÓVIL topbar */}
      <div className="mobile-topbar" aria-label="Cabecera móvil">
        <Link href="/" className="mobile-logo" aria-label="Clavis inicio">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="22" height="22" rx="6" fill="var(--btn-bg)"/>
            <path d="M6 11h10M11 6v10" stroke="var(--btn-text)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Clavey
        </Link>
        <div className="mobile-topbar-right">
          <button className="topbar-theme-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menú" aria-expanded={mobileOpen} aria-controls="mobile-drawer">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />

      {/* Drawer */}
      <nav id="mobile-drawer" className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} aria-label="Menú de navegación" aria-hidden={!mobileOpen}>
        <SidebarContent />
      </nav>
    </>
  )
}
