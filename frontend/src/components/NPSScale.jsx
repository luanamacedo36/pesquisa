import './NPSScale.css'

const getNPSColor = (score) => {
  if (score <= 6) return 'nps-red'
  if (score <= 8) return 'nps-yellow'
  return 'nps-green'
}

const getNPSLabel = (score) => {
  if (score === null || score === undefined) return ''
  if (score <= 6) return 'Detrator'
  if (score <= 8) return 'Neutro'
  return 'Promotor'
}

function NPSScale({ value, onChange }) {
  return (
    <div className="nps-scale">
      <div className="nps-buttons">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`nps-btn ${getNPSColor(i)} ${value === i ? 'selected' : ''}`}
            onClick={() => onChange(i)}
            aria-label={`Nota ${i}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="nps-labels">
        <span className="nps-label-left">Muito improvável</span>
        {value !== null && value !== undefined && (
          <span className={`nps-selected-label ${getNPSColor(value)}-text`}>
            {getNPSLabel(value)}
          </span>
        )}
        <span className="nps-label-right">Muito provável</span>
      </div>
    </div>
  )
}

export default NPSScale
