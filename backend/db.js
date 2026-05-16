import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

await pool.query(`
  CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    nps INTEGER NOT NULL CHECK(nps >= 0 AND nps <= 10),
    recepcao INTEGER NOT NULL CHECK(recepcao >= 1 AND recepcao <= 5),
    tempo_espera INTEGER NOT NULL CHECK(tempo_espera >= 1 AND tempo_espera <= 5),
    atendimento INTEGER NOT NULL CHECK(atendimento >= 1 AND atendimento <= 5),
    limpeza INTEGER NOT NULL CHECK(limpeza >= 1 AND limpeza <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

export default pool
