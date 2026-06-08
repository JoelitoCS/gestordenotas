'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { updateProfile, uploadAvatar, changePassword } from '@/actions/profile'

interface ProfileFormProps {
  userName: string
  userEmail: string
  avatarUrl: string | null
}

export default function ProfileForm({ userName, userEmail, avatarUrl }: ProfileFormProps) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [isPendingProfile, startProfile] = useTransition()
  const [isPendingPass, startPass] = useTransition()
  const [isPendingAvatar, startAvatar] = useTransition()

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMsg(null)
    const formData = new FormData(e.currentTarget)
    startProfile(async () => {
      const result = await updateProfile(formData)
      setProfileMsg(result.error
        ? { type: 'err', text: result.error }
        : { type: 'ok', text: 'Perfil actualizado correctamente' })
    })
  }

  function handlePassSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPassMsg(null)
    const formData = new FormData(e.currentTarget)
    startPass(async () => {
      const result = await changePassword(formData)
      setPassMsg(result.error
        ? { type: 'err', text: result.error }
        : { type: 'ok', text: 'Contraseña cambiada correctamente' })
      if (result.success) (e.target as HTMLFormElement).reset()
    })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarMsg(null)

    // Validación en cliente
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: 'err', text: 'El archivo no puede superar 5MB' })
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setAvatarMsg({ type: 'err', text: 'Formato no válido. Usa JPG, PNG o WebP' })
      return
    }

    const formData = new FormData()
    formData.set('avatar', file)

    startAvatar(async () => {
      const result = await uploadAvatar(formData)
      if (result.error) {
        setAvatarMsg({ type: 'err', text: result.error })
      } else if (result.avatar_url) {
        setCurrentAvatar(result.avatar_url)
        setAvatarMsg({ type: 'ok', text: 'Foto actualizada correctamente' })
      }
    })
  }

  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

      {/* Avatar */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }} aria-labelledby="avatar-title">
        <h2 id="avatar-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', marginBottom: 18 }}>
          Foto de perfil
        </h2>

        {avatarMsg && (
          <div role="alert" aria-live="polite" style={{
            background: avatarMsg.type === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${avatarMsg.type === 'ok' ? 'var(--success-border)' : 'var(--error-border)'}`,
            color: avatarMsg.type === 'ok' ? 'var(--success-text)' : 'var(--error-text)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16,
          }}>
            {avatarMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt={`Avatar de ${userName}`}
                width={72}
                height={72}
                style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--btn-bg)', color: 'var(--btn-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                {initials}
              </div>
            )}
            {isPendingAvatar && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'inline-block', background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: isPendingAvatar ? 'not-allowed' : 'pointer', opacity: isPendingAvatar ? 0.6 : 1, marginBottom: 6 }}>
              {isPendingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                aria-label="Seleccionar imagen de perfil"
                disabled={isPendingAvatar}
              />
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG o WebP. Máx. 5MB</p>
          </div>
        </div>
      </section>

      {/* Info personal */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }} aria-labelledby="info-title">
        <h2 id="info-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', marginBottom: 18 }}>
          Información personal
        </h2>
        {profileMsg && (
          <div role="alert" aria-live="polite" style={{
            background: profileMsg.type === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${profileMsg.type === 'ok' ? 'var(--success-border)' : 'var(--error-border)'}`,
            color: profileMsg.type === 'ok' ? 'var(--success-text)' : 'var(--error-text)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16,
          }}>
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={handleProfileSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label htmlFor="full_name" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Nombre completo</label>
            <input id="full_name" name="full_name" type="text" defaultValue={userName} required disabled={isPendingProfile}
              style={{ padding: '10px 14px', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Email</label>
            <input type="email" value={userEmail} disabled
              style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-muted)', background: 'var(--surface-2)', outline: 'none', cursor: 'not-allowed' }} />
          </div>
          <button type="submit" disabled={isPendingProfile}
            style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: isPendingProfile ? 'not-allowed' : 'pointer', opacity: isPendingProfile ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {isPendingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* Contraseña */}
      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }} aria-labelledby="pass-title">
        <h2 id="pass-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', marginBottom: 18 }}>
          Cambiar contraseña
        </h2>
        {passMsg && (
          <div role="alert" aria-live="polite" style={{
            background: passMsg.type === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${passMsg.type === 'ok' ? 'var(--success-border)' : 'var(--error-border)'}`,
            color: passMsg.type === 'ok' ? 'var(--success-text)' : 'var(--error-text)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16,
          }}>
            {passMsg.text}
          </div>
        )}
        <form onSubmit={handlePassSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label htmlFor="password" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Nueva contraseña</label>
            <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required autoComplete="new-password" disabled={isPendingPass}
              style={{ padding: '10px 14px', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label htmlFor="confirm" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Confirmar contraseña</label>
            <input id="confirm" name="confirm" type="password" placeholder="Repite la contraseña" required autoComplete="new-password" disabled={isPendingPass}
              style={{ padding: '10px 14px', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', background: 'var(--input-bg)', outline: 'none' }} />
          </div>
          <button type="submit" disabled={isPendingPass}
            style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: isPendingPass ? 'not-allowed' : 'pointer', opacity: isPendingPass ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {isPendingPass ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
