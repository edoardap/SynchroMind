import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DevProfile } from '../api'
import { useDevTools } from '../app/ApiContext'
import styles from './DevProfileSwitch.module.css'

const PROFILES: { value: DevProfile; label: string }[] = [
  { value: 'user', label: 'Usuário comum' },
  { value: 'admin', label: 'Admin' },
  { value: 'anonymous', label: 'Sem login' },
  { value: 'unconfirmed', label: 'E-mail não confirmado' },
]

/**
 * Controle de desenvolvimento: troca o perfil da camada em memória para ver as telas de permissão.
 * Só aparece quando a camada de dados oferece `devTools` (a implementação em memória); com a API real, some.
 */
export function DevProfileSwitch() {
  const dev = useDevTools()
  const client = useQueryClient()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<DevProfile | null>(() => dev?.getProfile() ?? null)
  if (!dev || !profile) return null

  function onChange(next: DevProfile) {
    dev?.setProfile(next)
    setProfile(next)
    client.clear()
    navigate('/')
  }

  return (
    <div className={styles.box}>
      <label htmlFor="perfil-teste">Perfil de teste</label>
      <select id="perfil-teste" value={profile} onChange={(e) => onChange(e.target.value as DevProfile)}>
        {PROFILES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  )
}
