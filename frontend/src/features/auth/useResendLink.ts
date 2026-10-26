import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useApi } from '../../app/ApiContext'

const COOLDOWN_SECONDS = 60

/** Reenvio do link com espera de 60 s entre envios (sugestão, a validar com a TI). */
export function useResendLink(email: string) {
  const api = useApi()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const mutation = useMutation({
    mutationFn: () => api.requestLink(email),
    onMutate: () => setSent(false),
    onSuccess: () => {
      setSent(true)
      setSecondsLeft(COOLDOWN_SECONDS)
    },
  })

  return {
    resend: () => mutation.mutate(),
    sending: mutation.isPending,
    sent,
    failed: mutation.isError,
    secondsLeft,
  }
}
