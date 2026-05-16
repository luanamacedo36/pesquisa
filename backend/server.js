import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const distPath = join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// POST /api/responses
app.post('/api/responses', async (req, res) => {
  try {
    const { nps, recepcao, tempo_espera, atendimento, limpeza, comentario } = req.body;

    if (nps === undefined || nps === null) return res.status(400).json({ error: 'Campo NPS é obrigatório.' });
    if (!recepcao)      return res.status(400).json({ error: 'Campo recepção é obrigatório.' });
    if (!tempo_espera)  return res.status(400).json({ error: 'Campo tempo de espera é obrigatório.' });
    if (!atendimento)   return res.status(400).json({ error: 'Campo atendimento é obrigatório.' });
    if (!limpeza)       return res.status(400).json({ error: 'Campo limpeza é obrigatório.' });

    if (nps < 0 || nps > 10) return res.status(400).json({ error: 'NPS deve ser entre 0 e 10.' });
    for (const [field, value] of Object.entries({ recepcao, tempo_espera, atendimento, limpeza })) {
      if (value < 1 || value > 5) return res.status(400).json({ error: `Campo ${field} deve ser entre 1 e 5.` });
    }

    const result = await pool.query(
      `INSERT INTO responses (nps, recepcao, tempo_espera, atendimento, limpeza, comentario)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [Number(nps), Number(recepcao), Number(tempo_espera), Number(atendimento), Number(limpeza), comentario || null]
    );

    res.status(201).json({ success: true, id: result.rows[0].id, message: 'Resposta salva com sucesso!' });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Erro interno ao salvar a resposta.' });
  }
});

// GET /api/dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const { rows: [{ total }] } = await pool.query('SELECT COUNT(*)::int AS total FROM responses');

    if (total === 0) {
      return res.json({
        npsScore: null, total: 0,
        promoters: 0, passives: 0, detractors: 0,
        promotersPercent: 0, passivesPercent: 0, detractorsPercent: 0,
        averages: { recepcao: 0, tempo_espera: 0, atendimento: 0, limpeza: 0 },
        npsDistribution: Array.from({ length: 11 }, (_, i) => ({ score: i, count: 0 })),
        recentResponses: [],
      });
    }

    const [catsResult, avgsResult, distResult, recentResult] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE nps >= 9)::int              AS promoters,
          COUNT(*) FILTER (WHERE nps >= 7 AND nps <= 8)::int AS passives,
          COUNT(*) FILTER (WHERE nps <= 6)::int              AS detractors
        FROM responses
      `),
      pool.query(`
        SELECT
          ROUND(AVG(recepcao)::numeric, 1)     AS recepcao,
          ROUND(AVG(tempo_espera)::numeric, 1) AS tempo_espera,
          ROUND(AVG(atendimento)::numeric, 1)  AS atendimento,
          ROUND(AVG(limpeza)::numeric, 1)      AS limpeza
        FROM responses
      `),
      pool.query(`
        SELECT nps AS score, COUNT(*)::int AS count
        FROM responses GROUP BY nps ORDER BY nps
      `),
      pool.query(`
        SELECT id, nps, recepcao, tempo_espera, atendimento, limpeza, comentario, created_at
        FROM responses ORDER BY created_at DESC LIMIT 20
      `),
    ]);

    const { promoters, passives, detractors } = catsResult.rows[0];
    const avgs = avgsResult.rows[0];
    const npsScore = Math.round(((promoters - detractors) / total) * 1000) / 10;

    const distMap = {};
    distResult.rows.forEach(r => { distMap[r.score] = r.count; });
    const npsDistribution = Array.from({ length: 11 }, (_, i) => ({ score: i, count: distMap[i] || 0 }));

    res.json({
      npsScore,
      total,
      promoters, passives, detractors,
      promotersPercent: Math.round((promoters / total) * 1000) / 10,
      passivesPercent:  Math.round((passives  / total) * 1000) / 10,
      detractorsPercent: Math.round((detractors / total) * 1000) / 10,
      averages: {
        recepcao:     Number(avgs.recepcao),
        tempo_espera: Number(avgs.tempo_espera),
        atendimento:  Number(avgs.atendimento),
        limpeza:      Number(avgs.limpeza),
      },
      npsDistribution,
      recentResponses: recentResult.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Erro interno ao buscar dados do dashboard.' });
  }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
