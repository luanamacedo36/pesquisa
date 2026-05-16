import { useState } from 'react'
import NPSScale from '../components/NPSScale'
import StarRating from '../components/StarRating'
import WaitTimeRating from '../components/WaitTimeRating'
import './Survey.css'

const STEPS = [
  { id: 'nps', title: 'Recomendação', question: 'Em uma escala de 0 a 10, o quanto você recomendaria esta unidade de saúde para um familiar ou amigo?' },
  { id: 'recepcao', title: 'Recepção', question: 'Como você avalia o atendimento na recepção?' },
  { id: 'tempo_espera', title: 'Tempo de Espera', question: 'Como foi o tempo de espera?' },
  { id: 'atendimento', title: 'Atendimento', question: 'Como você avalia a qualidade do atendimento recebido?' },
  { id: 'limpeza', title: 'Limpeza e Estrutura', question: 'Como você avalia a limpeza e as instalações da unidade?' },
  { id: 'comentario', title: 'Comentário', question: 'Deixe um comentário (opcional)' },
]

const initialFormState = {
  nps: null,
  recepcao: null,
  tempo_espera: null,
  atendimento: null,
  limpeza: null,
  comentario: '',
}

function Survey() {
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  const getCurrentValue = () => form[step.id]

  const isCurrentStepValid = () => {
    const val = getCurrentValue()
    if (step.id === 'comentario') return true
    return val !== null && val !== undefined
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (!isCurrentStepValid()) return
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:3001/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nps: form.nps,
          recepcao: form.recepcao,
          tempo_espera: form.tempo_espera,
          atendimento: form.atendimento,
          limpeza: form.limpeza,
          comentario: form.comentario || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar resposta.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(initialFormState)
    setCurrentStep(0)
    setSubmitted(false)
    setError(null)
  }

  if (submitted) {
    return (
      <div className="survey-wrapper">
        <div className="survey-thankyou">
          <div className="thankyou-icon">✓</div>
          <h2>Obrigado pela sua avaliação!</h2>
          <p>Sua opinião é muito importante para melhorarmos nosso atendimento.</p>
          <button className="btn-primary btn-large" onClick={handleReset}>
            Nova Pesquisa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="survey-wrapper">
      <div className="survey-container">
        {/* Progress bar */}
        <div className="survey-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="progress-label">{currentStep + 1} de {STEPS.length}</span>
        </div>

        {/* Step indicators */}
        <div className="survey-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`step-indicator ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`}
            >
              <div className="step-dot">
                {i < currentStep ? '✓' : i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Question card */}
        <div className="survey-card" key={step.id}>
          <div className="card-header">
            <span className="card-category">{step.title}</span>
            <h2 className="card-question">{step.question}</h2>
          </div>

          <div className="card-body">
            {step.id === 'nps' && (
              <NPSScale
                value={form.nps}
                onChange={(val) => handleChange('nps', val)}
              />
            )}
            {step.id === 'recepcao' && (
              <StarRating
                value={form.recepcao}
                onChange={(val) => handleChange('recepcao', val)}
              />
            )}
            {step.id === 'tempo_espera' && (
              <WaitTimeRating
                value={form.tempo_espera}
                onChange={(val) => handleChange('tempo_espera', val)}
              />
            )}
            {step.id === 'atendimento' && (
              <StarRating
                value={form.atendimento}
                onChange={(val) => handleChange('atendimento', val)}
              />
            )}
            {step.id === 'limpeza' && (
              <StarRating
                value={form.limpeza}
                onChange={(val) => handleChange('limpeza', val)}
              />
            )}
            {step.id === 'comentario' && (
              <div className="comment-field">
                <textarea
                  className="comment-textarea"
                  placeholder="Escreva aqui seu comentário ou sugestão..."
                  value={form.comentario}
                  onChange={(e) => handleChange('comentario', e.target.value)}
                  rows={5}
                  maxLength={1000}
                />
                <div className="comment-counter">
                  {form.comentario.length}/1000
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="survey-error">
              {error}
            </div>
          )}

          <div className="card-actions">
            {currentStep > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              className={`btn-primary ${!isCurrentStepValid() ? 'btn-disabled' : ''}`}
              onClick={handleNext}
              disabled={!isCurrentStepValid() || loading}
            >
              {loading ? 'Enviando...' : isLastStep ? 'Enviar Pesquisa' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Survey
