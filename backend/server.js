import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend files in production
const distPath = join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// POST /api/responses — save a survey response
app.post('/api/responses', (req, res) => {
  try {
    const { nps, recepcao, tempo_espera, atendimento, limpeza, comentario } = req.body;

    // Validate required fields
    if (nps === undefined || nps === null) {
      return res.status(400).json({ error: 'Campo NPS é obrigatório.' });
    }
    if (!recepcao) {
      return res.status(400).json({ error: 'Campo recepção é obrigatório.' });
    }
    if (!tempo_espera) {
      return res.status(400).json({ error: 'Campo tempo de espera é obrigatório.' });
    }
    if (!atendimento) {
      return res.status(400).json({ error: 'Campo atendimento é obrigatório.' });
    }
    if (!limpeza) {
      return res.status(400).json({ error: 'Campo limpeza é obrigatório.' });
    }

    // Validate ranges
    if (nps < 0 || nps > 10) {
      return res.status(400).json({ error: 'NPS deve ser entre 0 e 10.' });
    }
    for (const [field, value] of Object.entries({ recepcao, tempo_espera, atendimento, limpeza })) {
      if (value < 1 || value > 5) {
        return res.status(400).json({ error: `Campo ${field} deve ser entre 1 e 5.` });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO responses (nps, recepcao, tempo_espera, atendimento, limpeza, comentario)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      Number(nps),
      Number(recepcao),
      Number(tempo_espera),
      Number(atendimento),
      Number(limpeza),
      comentario || null
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Resposta salva com sucesso!'
    });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Erro interno ao salvar a resposta.' });
  }
});

// GET /api/dashboard — return aggregated data
app.get('/api/dashboard', (req, res) => {
  try {
    // Total count
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM responses').get();
    const total = totalRow.total;

    if (total === 0) {
      return res.json({
        npsScore: null,
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promotersPercent: 0,
        passivesPercent: 0,
        detractorsPercent: 0,
        averages: {
          recepcao: 0,
          tempo_espera: 0,
          atendimento: 0,
          limpeza: 0
        },
        npsDistribution: Array.from({ length: 11 }, (_, i) => ({ score: i, count: 0 })),
        recentResponses: []
      });
    }

    // NPS category counts
    const promoters = db.prepare('SELECT COUNT(*) as count FROM responses WHERE nps >= 9').get().count;
    const passives = db.prepare('SELECT COUNT(*) as count FROM responses WHERE nps >= 7 AND nps <= 8').get().count;
    const detractors = db.prepare('SELECT COUNT(*) as count FROM responses WHERE nps <= 6').get().count;

    // NPS score calculation
    const npsScore = ((promoters - detractors) / total) * 100;

    // Averages
    const averagesRow = db.prepare(`
      SELECT
        AVG(recepcao) as recepcao,
        AVG(tempo_espera) as tempo_espera,
        AVG(atendimento) as atendimento,
        AVG(limpeza) as limpeza
      FROM responses
    `).get();

    // NPS distribution (count per score 0-10)
    const distributionRows = db.prepare(`
      SELECT nps as score, COUNT(*) as count
      FROM responses
      GROUP BY nps
      ORDER BY nps
    `).all();

    // Build full distribution array with 0s for missing scores
    const distributionMap = {};
    distributionRows.forEach(row => {
      distributionMap[row.score] = row.count;
    });
    const npsDistribution = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: distributionMap[i] || 0
    }));

    // Recent 20 responses
    const recentResponses = db.prepare(`
      SELECT id, nps, recepcao, tempo_espera, atendimento, limpeza, comentario, created_at
      FROM responses
      ORDER BY created_at DESC
      LIMIT 20
    `).all();

    res.json({
      npsScore: Math.round(npsScore * 10) / 10,
      total,
      promoters,
      passives,
      detractors,
      promotersPercent: Math.round((promoters / total) * 100 * 10) / 10,
      passivesPercent: Math.round((passives / total) * 100 * 10) / 10,
      detractorsPercent: Math.round((detractors / total) * 100 * 10) / 10,
      averages: {
        recepcao: Math.round(averagesRow.recepcao * 10) / 10,
        tempo_espera: Math.round(averagesRow.tempo_espera * 10) / 10,
        atendimento: Math.round(averagesRow.atendimento * 10) / 10,
        limpeza: Math.round(averagesRow.limpeza * 10) / 10
      },
      npsDistribution,
      recentResponses
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Erro interno ao buscar dados do dashboard.' });
  }
});

// SPA fallback — must come after API routes
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
