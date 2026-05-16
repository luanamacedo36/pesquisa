import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'pesquisa.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create the responses table
db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nps INTEGER NOT NULL CHECK(nps >= 0 AND nps <= 10),
    recepcao INTEGER NOT NULL CHECK(recepcao >= 1 AND recepcao <= 5),
    tempo_espera INTEGER NOT NULL CHECK(tempo_espera >= 1 AND tempo_espera <= 5),
    atendimento INTEGER NOT NULL CHECK(atendimento >= 1 AND atendimento <= 5),
    limpeza INTEGER NOT NULL CHECK(limpeza >= 1 AND limpeza <= 5),
    comentario TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
