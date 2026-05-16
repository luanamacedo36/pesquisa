import './WaitTimeRating.css'

const OPTIONS = [
  { label: 'Muito rápido', value: 5, icon: '⚡', className: 'wait-excellent' },
  { label: 'Rápido', value: 4, icon: '✓', className: 'wait-good' },
  { label: 'Adequado', value: 3, icon: '~', className: 'wait-ok' },
  { label: 'Demorado', value: 2, icon: '!', className: 'wait-bad' },
  { label: 'Muito demorado', value: 1, icon: '✕', className: 'wait-terrible' },
]

function WaitTimeRating({ value, onChange }) {
  return (
    <div className="wait-time-rating">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`wait-btn ${option.className} ${value === option.value ? 'selected' : ''}`}
          onClick={() => onChange(option.value)}
          aria-label={option.label}
          aria-pressed={value === option.value}
        >
          <span className="wait-icon">{option.icon}</span>
          <span className="wait-label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

export default WaitTimeRating
