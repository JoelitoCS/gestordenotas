'use client'

import { useState, useTransition } from 'react'
import { Plus, AlertCircle, Lock } from 'lucide-react'
import { createPassword } from '@/actions/passwords'
import PasswordCard from './PasswordCard'

type PasswordEntry = {
  id: string
  service_name: string
  service_icon: string | null
  username: string
  created_at: string
  updated_at: string
}

export default function PasswordsGrid({ initialPasswords }: { initialPasswords: PasswordEntry[] }) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(initialPasswords)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await createPassword(formData)
      if (result.error) { setError(result.error); return }
      setPasswords(prev => [{
        id: crypto.randomUUID(),
        service_name: formData.get('service_name') as string,
        service_icon: formData.get('service_icon') as string || null,
        username: formData.get('username') as string,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, ...prev])
      setShowForm(false)
      form.reset()
    })
  }

  return (
    <div>
      <style>{`
        .pass-btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--btn-bg); color: var(--btn-text);
          border: none; border-radius: 12px; padding: 10px 16px;
          font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: -0.2px;
          transition: opacity .15s;
        }
        .pass-btn-add:hover { opacity: 0.85; }
        .pass-form {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 24px; margin-bottom: 24px;
          box-shadow: var(--card-shadow);
        }
        .pass-form-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 18px; letter-spacing: -0.3px; }
        .pass-field-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .pass-field-input {
          padding: 10px 13px; border: 1px solid var(--border-strong); border-radius: 10px;
          font-size: 14px; color: var(--text-primary); background: var(--input-bg);
          outline: none; width: 100%; transition: border-color .2s, box-shadow .2s;
        }
        .pass-field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
        .pass-field-input::placeholder { color: var(--text-muted); }
        .pass-field-input:disabled { opacity: 0.5; }
        .pass-btn-save {
          background: var(--btn-bg); color: var(--btn-text);
          border: none; border-radius: 10px; padding: 10px 22px;
          font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: -0.2px;
          transition: opacity .15s;
        }
        .pass-btn-save:hover:not(:disabled) { opacity: 0.85; }
        .pass-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .pass-error {
          display: flex; align-items: center; gap: 8px;
          background: var(--error-bg); border: 1px solid var(--error-border);
          border-radius: 10px; padding: 10px 14px; font-size: 13px; color: var(--error-text); margin-bottom: 16px;
        }
        .pass-empty {
          padding: 80px 0; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .pass-empty-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--surface-2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .pass-empty-title { font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
        .pass-empty-sub { font-size: 14px; color: var(--text-muted); }
        @media (max-width: 600px) { .pass-form-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowForm(v => !v)} aria-expanded={showForm} className="pass-btn-add">
          <Plus size={15} aria-hidden="true" />
          {showForm ? 'Cancelar' : 'Añadir contraseña'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} aria-label="Añadir contraseña" noValidate className="pass-form">
          <h2 className="pass-form-title">Nueva entrada</h2>
          {error && (
            <div role="alert" className="pass-error">
              <AlertCircle size={14} aria-hidden="true" /> {error}
            </div>
          )}
          <div className="pass-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {[
              { id: 'service_name', label: 'Servicio', type: 'text', placeholder: 'Google, GitHub...' },
              { id: 'service_icon', label: 'Icono URL', type: 'url', placeholder: 'https://', optional: true },
              { id: 'username', label: 'Email / Usuario', type: 'text', placeholder: 'tu@email.com', autoComplete: 'off' },
              { id: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
            ].map(f => (
              <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label htmlFor={f.id} className="pass-field-label">
                  {f.label} {f.optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>}
                </label>
                <input id={f.id} name={f.id} type={f.type} required={!f.optional}
                  placeholder={f.placeholder} autoComplete={f.autoComplete}
                  className="pass-field-input" disabled={isPending} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isPending} aria-busy={isPending} className="pass-btn-save">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {passwords.length === 0 ? (
        <div className="pass-empty" aria-live="polite">
          <div className="pass-empty-icon">
            <Lock size={22} color="var(--text-muted)" aria-hidden="true" />
          </div>
          <p className="pass-empty-title">Sin contraseñas guardadas</p>
          <p className="pass-empty-sub">Añade tu primera entrada para empezar</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }} role="list" aria-label="Contraseñas guardadas">
          {passwords.map(p => (
            <li key={p.id}>
              <PasswordCard entry={p} onDeleted={id => setPasswords(prev => prev.filter(p => p.id !== id))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
