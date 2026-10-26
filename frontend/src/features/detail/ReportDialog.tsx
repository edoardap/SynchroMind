import { useState } from 'react'
import { isApiError, type ReportReason } from '../../api'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Alert } from '../../components/ui/Feedback'
import { RadioGroup, TextAreaField } from '../../components/ui/Form'
import { LIMITS } from '../../config/brand'

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'incorrect', label: 'Informação errada ou desatualizada' },
  { value: 'offensive', label: 'Conteúdo ofensivo' },
  { value: 'confidential', label: 'Conteúdo confidencial' },
  { value: 'other', label: 'Outro motivo' },
]

interface ReportDialogProps {
  onClose: () => void
  onSubmit: (input: { reason: ReportReason; details?: string }) => Promise<void>
  onDone: () => void
}

/** B8: denunciar. Motivo obrigatório; explicação opcional de até 300 caracteres (sugestão). */
export function ReportDialog({ onClose, onSubmit, onDone }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [reasonError, setReasonError] = useState<string>()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>()

  async function submit() {
    if (!reason) {
      setReasonError('Escolha um motivo.')
      return
    }
    setReasonError(undefined)
    setError(undefined)
    setSending(true)
    try {
      await onSubmit({ reason, details: details.trim() || undefined })
      onDone()
    } catch (e) {
      setError(isApiError(e, 'already_reported') ? 'Você já denunciou este conteúdo.' : 'Não foi possível enviar a denúncia. Tente de novo.')
      setSending(false)
    }
  }

  return (
    <Dialog
      title="Denunciar este conteúdo"
      onClose={onClose}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => void submit()} loading={sending} loadingText="Enviando...">Enviar denúncia</Button>
        </>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <RadioGroup legend="Qual é o problema?" name="motivo" options={REASONS} value={reason} onChange={(v) => { setReason(v); setReasonError(undefined) }} error={reasonError} />
      <TextAreaField
        label="Quer explicar?"
        optional
        rows={3}
        maxLength={LIMITS.maxReportDetails}
        value={details}
        onChange={(e) => setDetails(e.target.value.slice(0, LIMITS.maxReportDetails))}
      />
      <p className="meta">Os administradores vão analisar. A pessoa que escreveu não é avisada.</p>
    </Dialog>
  )
}
