import { useState } from 'react'
import './StarRating.css'

const STAR_LABELS = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null)

  const activeValue = hovered !== null ? hovered : value

  return (
    <div className="star-rating">
      <div className="stars" role="group" aria-label="Avaliação por estrelas">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${activeValue >= star ? 'star-filled' : 'star-empty'}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${star} estrela${star > 1 ? 's' : ''} - ${STAR_LABELS[star]}`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="star-label">
        {activeValue ? (
          <span className="star-label-text">{STAR_LABELS[activeValue]}</span>
        ) : (
          <span className="star-label-empty">Selecione uma nota</span>
        )}
      </div>
    </div>
  )
}

export default StarRating
