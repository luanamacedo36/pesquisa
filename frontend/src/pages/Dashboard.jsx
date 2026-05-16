import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import './Dashboard.css'

const PIE_COLORS = ['#16A34A', '#CA8A04', '#DC2626']

const WAIT_LABELS = { 1: 'Muito demorado', 2: 'Demorado', 3: 'Adequado', 4: 'Rápido', 5: 'Muito rápido' }

function NPSGauge({ score }) {
  const color = score === null ? '#9CA3AF' : score > 50 ? '#16A34A' : score >= 0 ? '#CA8A04' : '#DC2626'
  return (
    <div className="nps-gauge">
      <div className="nps-score-value" style={{ color }}>
        {score === null ? '—' : score > 0 ? `+${score}` : score}
      </div>
      <div className="nps-score-label">NPS</div>
      {score !== null && (
        <div className="nps-classification" style={{ color }}>
          {score > 75 ? 'Excelente' : score > 50 ? 'Muito Bom' : score >= 0 ? 'Bom' : 'Crítico'}
        </div>
      )}
    </div>
  )
}

function StarDisplay({ value }) {
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= Math.round(value) ? 'star-on' : 'star-off'}>★</span>
      ))}
      <span className="star-value">{value > 0 ? value.toFixed(1) : '—'}</span>
    </div>
  )
}

function MetricCard({ title, value, type }) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      {type === 'star' ? (
        <StarDisplay value={value} />
      ) : (
        <div className="metric-value">{value > 0 ? value.toFixed(1) : '—'}</div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function getNPSBarColor(score) {
  if (score <= 6) return '#DC2626'
  if (score <= 8) return '#CA8A04'
  return '#16A34A'
}

const CustomBar = (props) => {
  const { x, y, width, height, score } = props
  return <rect x={x} y={y} width={width} height={height} fill={getNPSBarColor(score)} rx={3} />
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/api/dashboard')
      if (!res.ok) throw new Error('Erro ao buscar dados do servidor.')
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const pieData = data ? [
    { name: 'Promotores', value: data.promoters },
    { name: 'Neutros', value: data.passives },
    { name: 'Detratores', value: data.detractors },
  ] : []

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard de Satisfação</h1>
          {lastUpdated && (
            <p className="dashboard-updated">
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          {loading ? '...' : '↻ Atualizar'}
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {data && (
        <>
          {/* Top row: NPS + Categories */}
          <div className="top-row">
            <div className="card nps-card">
              <h2 className="card-title">Índice NPS</h2>
              <NPSGauge score={data.npsScore} />
              <div className="nps-meta">
                <span>{data.total} resposta{data.total !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="card categories-card">
              <h2 className="card-title">Categorias NPS</h2>
              <div className="categories">
                <div className="category promoters">
                  <div className="category-count">{data.promoters}</div>
                  <div className="category-label">Promotores</div>
                  <div className="category-pct">{data.promotersPercent}%</div>
                </div>
                <div className="category passives">
                  <div className="category-count">{data.passives}</div>
                  <div className="category-label">Neutros</div>
                  <div className="category-pct">{data.passivesPercent}%</div>
                </div>
                <div className="category detractors">
                  <div className="category-count">{data.detractors}</div>
                  <div className="category-label">Detratores</div>
                  <div className="category-pct">{data.detractorsPercent}%</div>
                </div>
              </div>
              <div className="nps-formula">
                <span className="formula-text">NPS = % Promotores − % Detratores</span>
              </div>
            </div>

            {data.total > 0 && (
              <div className="card pie-card">
                <h2 className="card-title">Distribuição</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '0.75rem', color: '#374151' }}>{value}</span>}
                    />
                    <Tooltip formatter={(v) => `${v} resposta${v !== 1 ? 's' : ''}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Averages */}
          <div className="card">
            <h2 className="card-title">Médias por Critério</h2>
            <div className="metrics-grid">
              <MetricCard title="Recepção" value={data.averages.recepcao} type="star" />
              <MetricCard title="Tempo de Espera" value={data.averages.tempo_espera} type="star" />
              <MetricCard title="Atendimento" value={data.averages.atendimento} type="star" />
              <MetricCard title="Limpeza e Estrutura" value={data.averages.limpeza} type="star" />
            </div>
          </div>

          {/* NPS Distribution Bar Chart */}
          {data.total > 0 && (
            <div className="card">
              <h2 className="card-title">Distribuição de Notas NPS</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.npsDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="score" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v} resposta${v !== 1 ? 's' : ''}`, 'Quantidade']}
                    labelFormatter={(l) => `Nota ${l}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} shape={(props) => {
                    return <CustomBar {...props} score={props.score} />
                  }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span className="legend-item detractor-legend">0–6 Detratores</span>
                <span className="legend-item passive-legend">7–8 Neutros</span>
                <span className="legend-item promoter-legend">9–10 Promotores</span>
              </div>
            </div>
          )}

          {/* Recent Responses */}
          <div className="card">
            <h2 className="card-title">Respostas Recentes</h2>
            {data.recentResponses.length === 0 ? (
              <p className="empty-state">Nenhuma resposta registrada ainda.</p>
            ) : (
              <div className="table-wrapper">
                <table className="responses-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>NPS</th>
                      <th>Recepção</th>
                      <th>Espera</th>
                      <th>Atendimento</th>
                      <th>Limpeza</th>
                      <th>Comentário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentResponses.map(r => (
                      <tr key={r.id}>
                        <td className="td-date">{formatDate(r.created_at)}</td>
                        <td>
                          <span className={`nps-badge ${r.nps >= 9 ? 'badge-promoter' : r.nps >= 7 ? 'badge-passive' : 'badge-detractor'}`}>
                            {r.nps}
                          </span>
                        </td>
                        <td>{r.recepcao}★</td>
                        <td title={WAIT_LABELS[r.tempo_espera]}>{r.tempo_espera}★</td>
                        <td>{r.atendimento}★</td>
                        <td>{r.limpeza}★</td>
                        <td className="td-comment">{r.comentario || <span className="no-comment">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && !data && !error && (
        <div className="empty-state card">Nenhum dado disponível.</div>
      )}
    </div>
  )
}
