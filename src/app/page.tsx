'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Lock, Cloud, Palette, Zap, FileOutput, Moon, Sun, ShieldCheck, Download, Smartphone, Monitor, Wifi } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
import { useTheme } from '@/components/ThemeProvider'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Reveal({ children, direction = 'up', delay = 0 }: {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
}) {
  const { ref, inView } = useInView()
  const initial = { up: 'translateY(40px)', left: 'translateX(-48px)', right: 'translateX(48px)' }[direction]
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translate(0)' : initial,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

const features = [
  { icon: FileText, name: 'Editor rico', desc: 'Escribe con formato, añade imágenes y organiza tus ideas con el editor más limpio que hayas usado.' },
  { icon: FileOutput, name: 'Exporta a PDF', desc: 'Convierte cualquier nota en un documento PDF con un solo clic. Lista para compartir.' },
  { icon: Lock, name: 'Contraseñas cifradas', desc: 'AES-256 en servidor. Solo tú puedes verlas, y solo durante 60 segundos.' },
  { icon: Cloud, name: 'Siempre sincronizado', desc: 'Todos tus datos en la nube. Disponibles en cualquier dispositivo, al instante.' },
  { icon: Palette, name: 'Totalmente tuyo', desc: 'Colorea tus notas, añade etiquetas y organiza tu espacio como quieras.' },
  { icon: Zap, name: 'Velocidad real', desc: 'Construido con Next.js. Sin esperas, sin recargas. Todo responde al instante.' },
]

const banners = [
  { icon: FileText, text: 'Editor de notas rico' },
  { icon: Lock, text: 'Contraseñas cifradas AES-256' },
  { icon: FileOutput, text: 'Exporta a PDF' },
  { icon: Cloud, text: 'Sincronización en la nube' },
  { icon: Palette, text: 'Notas personalizables' },
  { icon: Zap, text: 'Velocidad real' },
  { icon: Smartphone, text: 'Disponible en iOS y Android' },
  { icon: Monitor, text: 'Disponible en Windows y Mac' },
  { icon: Download, text: 'Descárgalo gratis' },
  { icon: FileText, text: 'Editor de notas rico' },
  { icon: Lock, text: 'Contraseñas cifradas AES-256' },
  { icon: FileOutput, text: 'Exporta a PDF' },
  { icon: Cloud, text: 'Sincronización en la nube' },
  { icon: Palette, text: 'Notas personalizables' },
  { icon: Zap, text: 'Velocidad real' },
  { icon: Smartphone, text: 'Disponible en iOS y Android' },
  { icon: Monitor, text: 'Disponible en Windows y Mac' },
  { icon: Download, text: 'Descárgalo gratis' },
]

export default function HomePage() {
  const { theme, toggle } = useTheme()
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const phoneRef = useRef<HTMLDivElement>(null)
  const [phoneRotation, setPhoneRotation] = useState(18)

  useEffect(() => {
    function handleScroll() {
      if (!phoneRef.current) return
      const rect = phoneRef.current.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.min(Math.max((windowH - rect.top) / (windowH * 0.6), 0), 1)
      setPhoneRotation(18 - progress * 18)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    setInstalling(true)
    const prompt = installPrompt as BeforeInstallPromptEvent
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setInstallPrompt(null)
    setInstalling(false)
  }

  return (
    <main id="main-content">
      <style>{`
        /* ── Variables usadas aquí ── */
        .home-nav { position: sticky; top: 0; z-index: 100; background: var(--surface); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); transition: background .3s; }
        .home-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 28px; height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .home-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--text-primary); font-weight: 700; font-size: 16px; letter-spacing: -0.4px; flex-shrink: 0; }
        .home-nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-ghost { padding: 7px 14px; border-radius: 980px; font-size: 14px; font-weight: 500; color: var(--text-primary); text-decoration: none; transition: background .15s; white-space: nowrap; }
        .btn-ghost:hover { background: var(--surface-2); }
        .btn-dark { padding: 8px 16px; border-radius: 980px; font-size: 14px; font-weight: 600; color: var(--btn-text); background: var(--btn-bg); text-decoration: none; transition: background .15s; white-space: nowrap; }
        .btn-dark:hover { opacity: 0.85; }
        .theme-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, transform .15s; flex-shrink: 0; }
        .theme-btn:hover { transform: scale(1.08); background: var(--border); }

        /* ── Hero ── */
        .home-hero { padding: 120px 28px 100px; text-align: center; background: var(--surface); transition: background .3s; }
        .home-hero-inner { max-width: 720px; margin: 0 auto; }
        .hero-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 28px; }
        .hero-title { font-size: clamp(44px, 6.5vw, 72px); font-weight: 700; letter-spacing: -2px; line-height: 1.04; color: var(--text-primary); margin-bottom: 24px; }
        .hero-title-muted { color: var(--text-muted); }
        .hero-sub { font-size: 18px; color: var(--text-secondary); line-height: 1.7; max-width: 500px; margin: 0 auto 44px; }
        .hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn-primary-lg { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 980px; font-size: 15px; font-weight: 600; color: var(--btn-text); background: var(--btn-bg); text-decoration: none; transition: opacity .15s, transform .15s; }
        .btn-primary-lg:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-outline-lg { display: inline-flex; align-items: center; gap: 6px; padding: 14px 24px; border-radius: 980px; font-size: 15px; font-weight: 500; color: var(--text-primary); text-decoration: none; border: 1px solid var(--border-strong); transition: background .15s; }
        .btn-outline-lg:hover { background: var(--surface-2); }

        /* ── Marquee ── */
        .marquee-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); overflow: hidden; transition: background .3s; }
        .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item { display: flex; align-items: center; gap: 10px; padding: 18px 36px; white-space: nowrap; font-size: 14px; font-weight: 500; color: var(--text-secondary); border-right: 1px solid var(--border); }
        .marquee-item svg { color: var(--text-primary); flex-shrink: 0; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* ── Features ── */
        .home-features { padding: 100px 28px; background: var(--surface-2); transition: background .3s; }
        .home-features-inner { max-width: 1100px; margin: 0 auto; }
        .features-header { margin-bottom: 64px; }
        .features-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; }
        .features-title { font-size: clamp(32px, 4vw, 48px); font-weight: 700; letter-spacing: -1px; color: var(--text-primary); max-width: 480px; line-height: 1.1; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 14px; align-items: stretch; }
        .features-grid > div { height: 100%; display: flex; }
        .feature-card { width: 100%; min-height: 200px; background: var(--surface); border-radius: 22px; padding: 30px; border: 1px solid var(--border); display: flex; flex-direction: column; transition: background .3s, box-shadow .2s; }
        .feature-card:hover { box-shadow: var(--card-shadow-hover); }
        .feature-icon { width: 42px; height: 42px; border-radius: 13px; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .feature-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.3px; }
        .feature-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.65; }

        /* ── Highlight ── */
        .home-highlight { padding: 100px 28px; background: var(--surface); transition: background .3s; }
        .home-highlight-alt { padding: 100px 28px; background: var(--surface-2); transition: background .3s; }
        .highlight-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .highlight-inner.reverse { direction: rtl; }
        .highlight-inner.reverse > * { direction: ltr; }
        .highlight-text-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
        .highlight-text-title { font-size: clamp(28px, 3vw, 40px); font-weight: 700; letter-spacing: -0.8px; color: var(--text-primary); margin-bottom: 16px; line-height: 1.15; }
        .highlight-text-desc { font-size: 16px; color: var(--text-secondary); line-height: 1.7; }
        .highlight-visual { background: var(--surface-2); border-radius: 24px; border: 1px solid var(--border); padding: 40px; min-height: 280px; display: flex; align-items: center; justify-content: center; transition: background .3s; }
        .mock-note { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 20px; width: 100%; max-width: 300px; box-shadow: var(--card-shadow); }
        .mock-note-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
        .mock-note-line { height: 10px; background: var(--surface-2); border-radius: 5px; margin-bottom: 6px; }
        .mock-note-line.short { width: 60%; }
        .mock-note-tag { display: inline-block; background: var(--surface-2); border-radius: 980px; padding: 3px 10px; font-size: 11px; font-weight: 500; color: var(--text-secondary); margin-top: 10px; }
        .mock-pass { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 16px; width: 100%; max-width: 300px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 10px; }
        .mock-pass-row { display: flex; align-items: center; gap: 10px; }
        .mock-pass-icon { width: 34px; height: 34px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); flex-shrink: 0; }
        .mock-pass-lines { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .mock-pass-line { height: 8px; background: var(--surface-2); border-radius: 4px; }
        .mock-pass-line.short { width: 55%; }
        .mock-pass-btn { height: 34px; background: var(--surface-2); border-radius: 10px; border: 1px solid var(--border); }

        /* ── Download PWA ── */
        .pwa-section { padding: 100px 28px; background: var(--surface); transition: background .3s; }
        .pwa-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .pwa-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
        .pwa-title { font-size: clamp(28px, 3vw, 42px); font-weight: 700; letter-spacing: -0.8px; color: var(--text-primary); margin-bottom: 16px; line-height: 1.15; }
        .pwa-desc { font-size: 16px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px; }
        .pwa-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
        .pwa-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 980px; border: 1px solid var(--border); font-size: 13px; font-weight: 500; color: var(--text-secondary); background: var(--surface-2); }
        .btn-install { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; border-radius: 980px; font-size: 15px; font-weight: 600; color: var(--btn-text); background: var(--btn-bg); border: none; cursor: pointer; transition: opacity .15s, transform .15s; letter-spacing: -0.2px; }
        .btn-install:hover { opacity: 0.85; transform: translateY(-2px); }
        .btn-install:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-install-installed { display: inline-flex; align-items: center; gap: 10px; padding: 15px 28px; border-radius: 16px; font-size: 16px; font-weight: 700; color: #16a34a; background: #f0faf4; border: 1px solid #a7f3c0; cursor: default; letter-spacing: -0.3px; }
        .pwa-visual { position: relative; display: flex; align-items: center; justify-content: center; }
        .pwa-phone { width: 220px; background: var(--btn-bg); border-radius: 36px; padding: 16px 12px; box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1); }
        .pwa-phone-screen { background: var(--surface); border-radius: 24px; overflow: hidden; }
        .pwa-phone-topbar { background: var(--surface); padding: 10px 14px 8px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); }
        .pwa-phone-logo { width: 22px; height: 22px; border-radius: 7px; background: var(--btn-bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pwa-phone-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
        .pwa-phone-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .pwa-phone-card { background: var(--surface-2); border-radius: 12px; padding: 12px; border: 1px solid var(--border); }
        .pwa-phone-card-title { font-size: 11px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .pwa-phone-line { height: 7px; background: var(--border); border-radius: 4px; margin-bottom: 4px; }
        .pwa-phone-line.short { width: 55%; }
        .pwa-badge { position: absolute; top: -12px; right: -12px; background: #22c55e; color: #fff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 980px; white-space: nowrap; box-shadow: 0 4px 12px rgba(34,197,94,0.35); animation: badgePulse 2.5s ease-in-out infinite; }
        @keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .pwa-inner { grid-template-columns: 1fr; gap: 48px; } .pwa-visual { order: -1; } }
        @media (max-width: 430px) { .pwa-section { padding: 64px 20px; } .pwa-phone { width: 180px; } }
        .cta-section { padding: 100px 28px; background: var(--surface-2); transition: background .3s; }
        .cta-box { max-width: 600px; margin: 0 auto; background: var(--btn-bg); border-radius: 32px; padding: 72px 56px; text-align: center; transition: background .3s; }
        .cta-title { font-size: clamp(32px, 4vw, 48px); font-weight: 700; color: var(--btn-text); letter-spacing: -1px; margin-bottom: 12px; line-height: 1.1; }
        .cta-sub { font-size: 16px; color: var(--btn-text); opacity: 0.45; margin-bottom: 36px; }
        .btn-white { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 980px; font-size: 15px; font-weight: 600; color: var(--btn-bg); background: var(--btn-text); text-decoration: none; transition: opacity .15s, transform .15s; }
        .btn-white:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ── Footer ── */
        .home-footer { border-top: 1px solid var(--border); padding: 52px 28px 28px; background: var(--surface); transition: background .3s; }
        .home-footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-main { display: grid; grid-template-columns: minmax(260px, 1.15fr) 2fr; gap: 56px; align-items: start; padding-bottom: 36px; border-bottom: 1px solid var(--border); }
        .footer-brand { display: flex; flex-direction: column; gap: 16px; }
        .footer-brand-mark { display: inline-flex; align-items: center; gap: 10px; color: var(--text-primary); font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
        .footer-brand-icon { width: 34px; height: 34px; border-radius: 10px; background: var(--btn-bg); color: var(--btn-text); display: flex; align-items: center; justify-content: center; box-shadow: var(--card-shadow); }
        .footer-slogan { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1.2; max-width: 260px; }
        .footer-desc { max-width: 330px; font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
        .footer-trust { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 8px 12px; border: 1px solid var(--border); border-radius: 999px; color: var(--text-secondary); background: var(--surface-2); font-size: 12px; font-weight: 600; }
        .footer-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .footer-card { padding: 20px; border: 1px solid var(--border); border-radius: 18px; background: var(--surface-2); min-height: 172px; }
        .footer-card-title { font-size: 13px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.2px; margin-bottom: 10px; }
        .footer-card-text { font-size: 13px; color: var(--text-secondary); line-height: 1.65; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 22px; flex-wrap: wrap; }
        .footer-copy { font-size: 13px; color: var(--text-muted); }
        .footer-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .footer-meta span { font-size: 13px; color: var(--text-secondary); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; }
          .highlight-inner { grid-template-columns: 1fr; gap: 40px; }
          .highlight-inner.reverse { direction: ltr; }
          .cta-box { padding: 48px 28px; }
          .footer-main { grid-template-columns: 1fr; gap: 32px; }
          .footer-columns { grid-template-columns: 1fr; }
        }
        @media (max-width: 430px) {
          .home-nav-inner { padding: 0 16px; height: 50px; }
          .home-logo { font-size: 15px; }
          .btn-ghost { display: none; }
          .btn-dark { padding: 8px 14px; font-size: 13px; }
          .home-hero { padding: 64px 20px 56px; }
          .hero-title { font-size: 38px; letter-spacing: -1.5px; }
          .hero-sub { font-size: 16px; margin-bottom: 36px; }
          .hero-cta { flex-direction: column; align-items: stretch; gap: 10px; }
          .btn-primary-lg { justify-content: center; padding: 15px 24px; font-size: 16px; }
          .btn-outline-lg { justify-content: center; padding: 15px 24px; font-size: 16px; }
          .home-features { padding: 64px 20px; }
          .features-header { margin-bottom: 36px; }
          .feature-card { padding: 22px; border-radius: 18px; }
          .home-highlight, .home-highlight-alt { padding: 64px 20px; }
          .highlight-visual { min-height: 180px; padding: 24px; }
          .cta-section { padding: 64px 20px; }
          .cta-box { padding: 40px 24px; border-radius: 24px; }
          .cta-title { font-size: 30px; }
          .marquee-item { padding: 14px 24px; font-size: 13px; }
          .home-footer { padding: 40px 20px 24px; }
          .footer-main { padding-bottom: 28px; }
          .footer-slogan { font-size: 18px; }
          .footer-card { min-height: auto; padding: 18px; border-radius: 16px; }
          .footer-bottom { align-items: flex-start; flex-direction: column; }
        }
        @media (max-width: 359px) {
          .hero-title { font-size: 32px; }
          .hero-sub { font-size: 15px; }
          .cta-box { padding: 32px 18px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="home-nav" role="navigation" aria-label="Navegación principal">
        <div className="home-nav-inner">
          <Link href="/" className="home-logo" aria-label="Clavey inicio">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect width="22" height="22" rx="6" fill="currentColor"/>
              <path d="M6 11h10M11 6v10" stroke={theme === 'dark' ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Clavey
          </Link>
          <div className="home-nav-right">
            <Link href="/auth/login" className="btn-ghost">Iniciar sesión</Link>
            <Link href="/auth/register" className="btn-dark">Empezar gratis</Link>
            <button className="theme-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              {theme === 'dark' ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-inner">
          <Reveal direction="up">
            <p className="hero-label">Gestión personal</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h1 id="hero-title" className="hero-title">
              Notas y contraseñas.<br />
              <span className="hero-title-muted">Todo en un lugar.</span>
            </h1>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="hero-sub">Escribe, organiza y protege lo que más importa. Sin complicaciones.</p>
          </Reveal>
          <Reveal direction="up" delay={240}>
            <div className="hero-cta">
              <Link href="/auth/register" className="btn-primary-lg">
                Crear cuenta gratis <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/auth/login" className="btn-outline-lg">Ya tengo cuenta</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section" aria-hidden="true">
        <div className="marquee-track">
          {banners.map((b, i) => (
            <div key={i} className="marquee-item">
              <b.icon size={15} strokeWidth={2} />
              {b.text}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="home-features" aria-labelledby="features-title">
        <div className="home-features-inner">
          <Reveal direction="left">
            <div className="features-header">
              <p className="features-label">Funcionalidades</p>
              <h2 id="features-title" className="features-title">Todo lo que necesitas,<br />nada que no.</h2>
            </div>
          </Reveal>
          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.name} direction={i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'up'} delay={i * 60}>
                <article className="feature-card" aria-labelledby={`feat-${i}`}>
                  <div className="feature-icon" aria-hidden="true">
                    <f.icon size={20} color="var(--text-primary)" strokeWidth={2} />
                  </div>
                  <h3 id={`feat-${i}`} className="feature-name">{f.name}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT 1 */}
      <section className="home-highlight" aria-labelledby="hl1-title">
        <div className="highlight-inner">
          <Reveal direction="left">
            <div>
              <p className="highlight-text-label">Módulo de notas</p>
              <h2 id="hl1-title" className="highlight-text-title">Escribe como piensas, no como te dejan.</h2>
              <p className="highlight-text-desc">Editor rico con soporte de imágenes, colores, etiquetas y exportación a PDF. Cada nota es tuya y solo tuya.</p>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="highlight-visual" aria-hidden="true">
              <div className="mock-note">
                <div className="mock-note-title">Reunión de producto</div>
                <div className="mock-note-line" /><div className="mock-note-line" /><div className="mock-note-line short" />
                <span className="mock-note-tag">Trabajo</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HIGHLIGHT 2 */}
      <section className="home-highlight-alt" aria-labelledby="hl2-title">
        <div className="highlight-inner reverse">
          <Reveal direction="right">
            <div>
              <p className="highlight-text-label">Módulo de contraseñas</p>
              <h2 id="hl2-title" className="highlight-text-title">Tus contraseñas, cifradas y bajo llave.</h2>
              <p className="highlight-text-desc">Cifrado AES-256 en servidor. Solo tú puedes ver cada contraseña, y únicamente durante 60 segundos.</p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="highlight-visual" aria-hidden="true">
              <div className="mock-pass">
                <div className="mock-pass-row">
                  <div className="mock-pass-icon" />
                  <div className="mock-pass-lines">
                    <div className="mock-pass-line" /><div className="mock-pass-line short" />
                  </div>
                </div>
                <div className="mock-pass-btn" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PWA DOWNLOAD */}
      <section className="pwa-section" aria-labelledby="pwa-title">
        <div className="pwa-inner">
          <Reveal direction="left">
            <div>
              <p className="pwa-label">Disponible como app</p>
              <h2 id="pwa-title" className="pwa-title">Llévate Clavey en el bolsillo.</h2>
              <p className="pwa-desc">
                Instala Clavey como una app nativa en tu móvil o escritorio. Sin tiendas, sin descargas extra. Un clic y listo.
              </p>
              <div className="pwa-pills">
                <span className="pwa-pill"><Smartphone size={13} aria-hidden="true" /> iOS y Android</span>
                <span className="pwa-pill"><Monitor size={13} aria-hidden="true" /> Windows y Mac</span>
                <span className="pwa-pill"><Wifi size={13} aria-hidden="true" /> Funciona offline</span>
              </div>
              {isInstalled ? (
                <div className="btn-install-installed">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="9" fill="#22c55e"/>
                    <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ya está instalada
                </div>
              ) : (
                <button
                  onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall}
                  disabled={!isIOS && (!installPrompt || installing)}
                  className="btn-install"
                  aria-label="Instalar Clavey como app"
                >
                  <Download size={18} aria-hidden="true" />
                  {installing ? 'Instalando...' : 'Instalar app gratis'}
                </button>
              )}

              {/* Modal iOS */}
              {showIOSGuide && (
                <div
                  onClick={() => setShowIOSGuide(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 32px' }}
                  role="dialog" aria-modal="true" aria-labelledby="ios-guide-title"
                >
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ background: 'var(--surface)', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', animation: 'slideUp .3s cubic-bezier(0.22,1,0.36,1)' }}
                  >
                    <h3 id="ios-guide-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.3px' }}>Instalar en iPhone / iPad</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { step: '1', text: 'Abre esta página en Safari (no Chrome ni otro navegador)' },
                        { step: '2', text: 'Pulsa el botón de compartir ️ en la barra inferior' },
                        { step: '3', text: 'Desplázate y toca “Añadir a pantalla de inicio”' },
                        { step: '4', text: 'Pulsa “Añadir” y listo' },
                      ].map(({ step, text }) => (
                        <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--btn-bg)', color: 'var(--btn-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{step}</div>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, paddingTop: 4 }}>{text}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowIOSGuide(false)}
                      style={{ marginTop: 24, width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'var(--btn-bg)', color: 'var(--btn-text)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal direction="right">
            <div className="pwa-visual" aria-hidden="true" ref={phoneRef}>
              {/* Sombras detrás del teléfono */}
              <div style={{
                position: 'absolute',
                width: 220,
                background: 'var(--btn-bg)',
                borderRadius: 36,
                top: 10,
                left: '50%',
                transform: `translateX(-50%) rotate(${phoneRotation + 6}deg)`,
                transition: 'transform 0.08s linear',
                opacity: 0.15,
                bottom: 10,
              }} />
              <div style={{
                position: 'absolute',
                width: 220,
                background: 'var(--btn-bg)',
                borderRadius: 36,
                top: 6,
                left: '50%',
                transform: `translateX(-50%) rotate(${phoneRotation + 3}deg)`,
                transition: 'transform 0.08s linear',
                opacity: 0.3,
                bottom: 6,
              }} />
              <div
                style={{
                  width: 220,
                  background: 'var(--btn-bg)',
                  borderRadius: 36,
                  padding: '16px 12px',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
                  transform: `rotate(${phoneRotation}deg)`,
                  transition: 'transform 0.08s linear',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div className="pwa-phone-screen">
                  <div className="pwa-phone-topbar">
                    <div className="pwa-phone-logo">
                      <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                        <path d="M6 11h10M11 6v10" stroke={theme === 'dark' ? '#000000' : '#ffffff'} strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="pwa-phone-title">Clavey</span>
                  </div>
                  <div className="pwa-phone-body">
                    <div className="pwa-phone-card">
                      <div className="pwa-phone-card-title">Mis notas</div>
                      <div className="pwa-phone-line" />
                      <div className="pwa-phone-line short" />
                    </div>
                    <div className="pwa-phone-card">
                      <div className="pwa-phone-card-title">Reunión de producto</div>
                      <div className="pwa-phone-line" />
                      <div className="pwa-phone-line short" />
                    </div>
                    <div className="pwa-phone-card" style={{ opacity: 0.5 }}>
                      <div className="pwa-phone-card-title">Ideas del proyecto</div>
                      <div className="pwa-phone-line" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" aria-labelledby="cta-title">
        <Reveal direction="up">
          <div className="cta-box">
            <h2 id="cta-title" className="cta-title">Empieza hoy,<br />gratis.</h2>
            <p className="cta-sub">Sin tarjeta de crédito. Sin complicaciones.</p>
            <Link href="/auth/register" className="btn-white">
              Crear mi cuenta <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="home-footer" role="contentinfo">
        <div className="home-footer-inner">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-brand-mark" aria-label="Clavey">
                <span className="footer-brand-icon" aria-hidden="true">
                  <svg width="19" height="19" viewBox="0 0 22 22" fill="none">
                    <path d="M6 11h10M11 6v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </span>
                Clavey
              </div>
              <p className="footer-slogan">Tu espacio personal.</p>
              <p className="footer-desc">
                Un lugar tranquilo para guardar notas, organizar ideas y proteger contraseñas sin ruido ni complicaciones.
              </p>
              <div className="footer-trust">
                <ShieldCheck size={14} aria-hidden="true" />
                Privacidad desde el diseño
              </div>
            </div>

            <div className="footer-columns" aria-label="Información legal y de privacidad">
              <section className="footer-card" aria-labelledby="footer-privacy">
                <h3 id="footer-privacy" className="footer-card-title">Privacidad</h3>
                <p className="footer-card-text">
                  Tus notas y contraseñas son tuyas. Clavey no vende, comparte ni manipula los datos personales de los usuarios con fines externos.
                </p>
              </section>
              <section className="footer-card" aria-labelledby="footer-security">
                <h3 id="footer-security" className="footer-card-title">Seguridad</h3>
                <p className="footer-card-text">
                  La información confidencial se trata con cuidado y no se muestra de forma permanente. Las contraseñas solo se revelan cuando tú lo decides.
                </p>
              </section>
              <section className="footer-card" aria-labelledby="footer-terms">
                <h3 id="footer-terms" className="footer-card-title">Términos</h3>
                <p className="footer-card-text">
                  Usa Clavey como tu espacio personal de gestión. El acceso a tu cuenta y el contenido guardado dependen siempre de tu autenticación.
                </p>
              </section>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} Clavey. Todos los derechos reservados.</p>
            <div className="footer-meta" aria-label="Resumen de compromisos">
              <span>Sin venta de datos</span>
              <span>Información confidencial protegida</span>
              <span>Hecho para uso personal</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
