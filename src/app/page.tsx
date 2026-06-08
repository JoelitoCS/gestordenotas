'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Lock, Cloud, Palette, Zap, FileOutput } from 'lucide-react'

// ── Hook para detectar cuando un elemento entra en viewport ──
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

const features = [
  { icon: FileText, name: 'Editor rico', desc: 'Escribe con formato, añade imágenes y organiza tus ideas con el editor más limpio que hayas usado.' },
  { icon: FileOutput, name: 'Exporta a PDF', desc: 'Convierte cualquier nota en un documento PDF con un solo clic. Lista para compartir.' },
  { icon: Lock, name: 'Contraseñas cifradas', desc: 'AES-256 en servidor. Solo tú puedes verlas, y solo durante 60 segundos.' },
  { icon: Cloud, name: 'Siempre sincronizado', desc: 'Todos tus datos en la nube. Disponibles en cualquier dispositivo, al instante.' },
  { icon: Palette, name: 'Totalmente tuyo', desc: 'Colorea tus notas, añade etiquetas y organiza tu espacio como quieras.' },
  { icon: Zap, name: 'Velocidad real', desc: 'Construido con Next.js. Sin esperas, sin recargas. Todo responde al instante.' },
]

// ── Componente animado con dirección ──
function Reveal({
  children,
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
}) {
  const { ref, inView } = useInView()

  const initial = {
    up: 'translateY(40px)',
    left: 'translateX(-48px)',
    right: 'translateX(48px)',
  }[direction]

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate(0)' : initial,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Carrusel infinito de pancartas ──
const banners = [
  { icon: FileText, text: 'Editor de notas rico' },
  { icon: Lock, text: 'Contraseñas cifradas AES-256' },
  { icon: FileOutput, text: 'Exporta a PDF' },
  { icon: Cloud, text: 'Sincronización en la nube' },
  { icon: Palette, text: 'Notas personalizables' },
  { icon: Zap, text: 'Velocidad real' },
  { icon: FileText, text: 'Editor de notas rico' },
  { icon: Lock, text: 'Contraseñas cifradas AES-256' },
  { icon: FileOutput, text: 'Exporta a PDF' },
  { icon: Cloud, text: 'Sincronización en la nube' },
  { icon: Palette, text: 'Notas personalizables' },
  { icon: Zap, text: 'Velocidad real' },
]

export default function HomePage() {
  return (
    <main id="main-content">
      <style>{`
        /* ── Nav ── */
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 28px; height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #1d1d1f; font-weight: 700; font-size: 16px; letter-spacing: -0.4px; flex-shrink: 0; }
        .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-ghost { padding: 7px 14px; border-radius: 980px; font-size: 14px; font-weight: 500; color: #1d1d1f; text-decoration: none; transition: background .15s; white-space: nowrap; }
        .btn-ghost:hover { background: rgba(0,0,0,0.05); }
        .btn-dark { padding: 8px 16px; border-radius: 980px; font-size: 14px; font-weight: 600; color: #fff; background: #1d1d1f; text-decoration: none; transition: background .15s; white-space: nowrap; }
        .btn-dark:hover { background: #3a3a3c; }

        /* Ocultar "Iniciar sesión" en móvil pequeño, dejar solo "Empezar gratis" */
        @media (max-width: 430px) {
          .nav-inner { padding: 0 16px; height: 50px; }
          .nav-logo { font-size: 15px; }
          .btn-ghost { display: none; }
          .btn-dark { padding: 8px 14px; font-size: 13px; }
        }

        /* iPhone 16 Pro Max / Plus (430px) y menores hasta 390px */
        @media (min-width: 390px) and (max-width: 430px) {
          .btn-ghost { display: none; }
        }

        /* Pantallas muy pequeñas < 360px */
        @media (max-width: 359px) {
          .nav-logo span { display: none; }
          .btn-ghost { display: none; }
          .btn-dark { font-size: 12px; padding: 7px 12px; }
        }

        /* ── Hero ── */
        .hero { padding: 120px 28px 100px; text-align: center; background: #fff; overflow: hidden; }
        .hero-inner { max-width: 720px; margin: 0 auto; }
        .hero-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; margin-bottom: 28px; }
        .hero-title { font-size: clamp(44px, 6.5vw, 72px); font-weight: 700; letter-spacing: -2px; line-height: 1.04; color: #1d1d1f; margin-bottom: 24px; }
        .hero-title-muted { color: #c7c7cc; }
        .hero-sub { font-size: 18px; color: #6e6e73; line-height: 1.7; max-width: 500px; margin: 0 auto 44px; font-weight: 400; }
        .hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn-primary-lg { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 980px; font-size: 15px; font-weight: 600; color: #fff; background: #1d1d1f; text-decoration: none; transition: background .15s, transform .15s; }
        .btn-primary-lg:hover { background: #3a3a3c; transform: translateY(-1px); }
        .btn-outline-lg { display: inline-flex; align-items: center; gap: 6px; padding: 14px 24px; border-radius: 980px; font-size: 15px; font-weight: 500; color: #1d1d1f; text-decoration: none; border: 1px solid rgba(0,0,0,0.14); transition: background .15s; }
        .btn-outline-lg:hover { background: #f5f5f7; }

        /* ── Marquee / pancartas ── */
        .marquee-section { padding: 0; background: #fff; border-top: 1px solid rgba(0,0,0,0.06); border-bottom: 1px solid rgba(0,0,0,0.06); overflow: hidden; }
        .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-item { display: flex; align-items: center; gap: 10px; padding: 18px 36px; white-space: nowrap; font-size: 14px; font-weight: 500; color: #6e6e73; border-right: 1px solid rgba(0,0,0,0.06); }
        .marquee-item svg { color: #1d1d1f; flex-shrink: 0; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Features ── */
        .features { padding: 100px 28px; background: #f5f5f7; }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .features-header { margin-bottom: 64px; }
        .features-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; margin-bottom: 14px; }
        .features-title { font-size: clamp(32px, 4vw, 48px); font-weight: 700; letter-spacing: -1px; color: #1d1d1f; max-width: 480px; line-height: 1.1; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .feature-card { background: #fff; border-radius: 22px; padding: 30px; border: 1px solid rgba(0,0,0,0.06); }
        .feature-icon { width: 42px; height: 42px; border-radius: 13px; background: #f5f5f7; border: 1px solid rgba(0,0,0,0.07); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .feature-name { font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; letter-spacing: -0.3px; }
        .feature-desc { font-size: 14px; color: #6e6e73; line-height: 1.65; }

        /* ── Highlight strip ── */
        .highlight { padding: 100px 28px; background: #fff; }
        .highlight-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .highlight-inner.reverse { direction: rtl; }
        .highlight-inner.reverse > * { direction: ltr; }
        .highlight-text-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; margin-bottom: 16px; }
        .highlight-text-title { font-size: clamp(28px, 3vw, 40px); font-weight: 700; letter-spacing: -0.8px; color: #1d1d1f; margin-bottom: 16px; line-height: 1.15; }
        .highlight-text-desc { font-size: 16px; color: #6e6e73; line-height: 1.7; }
        .highlight-visual { background: #f5f5f7; border-radius: 24px; border: 1px solid rgba(0,0,0,0.06); padding: 40px; min-height: 280px; display: flex; align-items: center; justify-content: center; }
        .mock-note { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); padding: 20px; width: 100%; max-width: 300px; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .mock-note-title { font-size: 15px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; }
        .mock-note-line { height: 10px; background: #f0f0f0; border-radius: 5px; margin-bottom: 6px; }
        .mock-note-line.short { width: 60%; }
        .mock-note-tag { display: inline-block; background: #f5f5f7; border-radius: 980px; padding: 3px 10px; font-size: 11px; font-weight: 500; color: #6e6e73; margin-top: 10px; }
        .mock-pass { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); padding: 16px; width: 100%; max-width: 300px; box-shadow: 0 4px 20px rgba(0,0,0,0.07); display: flex; flex-direction: column; gap: 10px; }
        .mock-pass-row { display: flex; align-items: center; gap: 10px; }
        .mock-pass-icon { width: 34px; height: 34px; border-radius: 10px; background: #f5f5f7; border: 1px solid rgba(0,0,0,0.06); flex-shrink: 0; }
        .mock-pass-lines { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .mock-pass-line { height: 8px; background: #f0f0f0; border-radius: 4px; }
        .mock-pass-line.short { width: 55%; }
        .mock-pass-btn { height: 34px; background: #f5f5f7; border-radius: 10px; border: 1px solid rgba(0,0,0,0.07); }

        /* ── CTA ── */
        .cta-section { padding: 100px 28px; background: #f5f5f7; }
        .cta-box { max-width: 600px; margin: 0 auto; background: #1d1d1f; border-radius: 32px; padding: 72px 56px; text-align: center; }
        .cta-title { font-size: clamp(32px, 4vw, 48px); font-weight: 700; color: #fff; letter-spacing: -1px; margin-bottom: 12px; line-height: 1.1; }
        .cta-sub { font-size: 16px; color: rgba(255,255,255,0.45); margin-bottom: 36px; }
        .btn-white { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 980px; font-size: 15px; font-weight: 600; color: #1d1d1f; background: #fff; text-decoration: none; transition: background .15s, transform .15s; }
        .btn-white:hover { background: #f5f5f7; transform: translateY(-1px); }

        /* ── Footer ── */
        .footer { border-top: 1px solid rgba(0,0,0,0.07); padding: 28px 28px; background: #fff; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .footer-logo { font-weight: 700; font-size: 14px; color: #1d1d1f; letter-spacing: -0.3px; }
        .footer-copy { font-size: 13px; color: #aeaeb2; }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; }
          .highlight-inner { grid-template-columns: 1fr; gap: 40px; }
          .highlight-inner.reverse { direction: ltr; }
          .cta-box { padding: 48px 28px; }
        }

        /* ── Móvil: iPhone 16 y similares (390–430px) ── */
        @media (max-width: 430px) {
          .hero { padding: 64px 20px 56px; }
          .hero-title { font-size: 38px; letter-spacing: -1.5px; }
          .hero-sub { font-size: 16px; margin-bottom: 36px; }
          .hero-cta { flex-direction: column; align-items: stretch; gap: 10px; }
          .btn-primary-lg { justify-content: center; padding: 15px 24px; font-size: 16px; }
          .btn-outline-lg { justify-content: center; padding: 15px 24px; font-size: 16px; }
          .features { padding: 64px 20px; }
          .features-header { margin-bottom: 36px; }
          .feature-card { padding: 22px; border-radius: 18px; }
          .highlight { padding: 64px 20px; }
          .highlight-visual { min-height: 180px; padding: 24px; }
          .cta-section { padding: 64px 20px; }
          .cta-box { padding: 40px 24px; border-radius: 24px; }
          .cta-title { font-size: 30px; }
          .marquee-item { padding: 14px 24px; font-size: 13px; }
          .footer { padding: 24px 20px; }
        }

        /* ── Móvil pequeño < 360px ── */
        @media (max-width: 359px) {
          .hero-title { font-size: 32px; }
          .hero-sub { font-size: 15px; }
          .cta-box { padding: 32px 18px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="NoteVault inicio">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect width="22" height="22" rx="6" fill="#1d1d1f"/>
              <path d="M6 11h10M11 6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            NoteVault
          </Link>
          <div className="nav-actions">
            <Link href="/auth/login" className="btn-ghost">Iniciar sesión</Link>
            <Link href="/auth/register" className="btn-dark">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
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
            <p className="hero-sub">
              Escribe, organiza y protege lo que más importa. Sin complicaciones.
            </p>
          </Reveal>
          <Reveal direction="up" delay={240}>
            <div className="hero-cta">
              <Link href="/auth/register" className="btn-primary-lg">
                Crear cuenta gratis <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/auth/login" className="btn-outline-lg">
                Ya tengo cuenta
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE — pancartas deslizantes */}
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
      <section className="features" aria-labelledby="features-title">
        <div className="features-inner">
          <Reveal direction="left">
            <div className="features-header">
              <p className="features-label">Funcionalidades</p>
              <h2 id="features-title" className="features-title">
                Todo lo que necesitas,<br />nada que no.
              </h2>
            </div>
          </Reveal>
          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal
                key={f.name}
                direction={i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'up'}
                delay={i * 60}
              >
                <article className="feature-card" aria-labelledby={`feat-${i}`}>
                  <div className="feature-icon" aria-hidden="true">
                    <f.icon size={20} color="#1d1d1f" strokeWidth={2} />
                  </div>
                  <h3 id={`feat-${i}`} className="feature-name">{f.name}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT 1 — Notas */}
      <section className="highlight" aria-labelledby="hl1-title">
        <div className="highlight-inner">
          <Reveal direction="left">
            <div>
              <p className="highlight-text-label">Módulo de notas</p>
              <h2 id="hl1-title" className="highlight-text-title">
                Escribe como piensas, no como te dejan.
              </h2>
              <p className="highlight-text-desc">
                Editor rico con soporte de imágenes, colores, etiquetas y exportación a PDF. Cada nota es tuya y solo tuya.
              </p>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="highlight-visual" aria-hidden="true">
              <div className="mock-note">
                <div className="mock-note-title">Reunión de producto</div>
                <div className="mock-note-line" />
                <div className="mock-note-line" />
                <div className="mock-note-line short" />
                <span className="mock-note-tag">Trabajo</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HIGHLIGHT 2 — Contraseñas (invertido) */}
      <section className="highlight" style={{ background: '#f5f5f7' }} aria-labelledby="hl2-title">
        <div className="highlight-inner reverse">
          <Reveal direction="right">
            <div>
              <p className="highlight-text-label">Módulo de contraseñas</p>
              <h2 id="hl2-title" className="highlight-text-title">
                Tus contraseñas, cifradas y bajo llave.
              </h2>
              <p className="highlight-text-desc">
                Cifrado AES-256 en servidor. Solo tú puedes ver cada contraseña, y únicamente durante 60 segundos.
              </p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="highlight-visual" aria-hidden="true">
              <div className="mock-pass">
                <div className="mock-pass-row">
                  <div className="mock-pass-icon" />
                  <div className="mock-pass-lines">
                    <div className="mock-pass-line" />
                    <div className="mock-pass-line short" />
                  </div>
                </div>
                <div className="mock-pass-btn" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
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
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <span className="footer-logo">NoteVault</span>
          <p className="footer-copy">© {new Date().getFullYear()} NoteVault</p>
        </div>
      </footer>
    </main>
  )
}
