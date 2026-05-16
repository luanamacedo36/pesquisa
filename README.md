# Pesquisa de Satisfação — Unidades de Saúde

Sistema web de pesquisa NPS para unidades de saúde, com painel administrativo.

## Stack

- **Backend**: Node.js + Express + better-sqlite3 (SQLite)
- **Frontend**: React + Vite + recharts

## Como rodar

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Iniciar o backend (porta 3001)

```bash
npm run dev:backend
```

### 3. Iniciar o frontend (porta 5173)

```bash
npm run dev:frontend
```

## Páginas

- **`/`** — Formulário de pesquisa para o paciente (modo kiosk/tablet)
- **`/dashboard`** — Painel administrativo com métricas e gráficos

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/responses` | Salvar uma resposta da pesquisa |
| GET | `/api/dashboard` | Retornar dados agregados para o dashboard |

## Banco de dados

O SQLite é criado automaticamente em `backend/pesquisa.db` ao iniciar o servidor.

## Perguntas da pesquisa

1. **NPS** — Escala 0 a 10 (vermelho 0-6, amarelo 7-8, verde 9-10)
2. **Recepção** — 1 a 5 estrelas
3. **Tempo de espera** — 5 opções (Muito rápido → Muito demorado)
4. **Atendimento profissional** — 1 a 5 estrelas
5. **Limpeza e estrutura** — 1 a 5 estrelas
6. **Comentário** — Texto livre (opcional)

## Cálculo NPS

- **Promotores**: nota 9–10
- **Neutros**: nota 7–8
- **Detratores**: nota 0–6
- **NPS** = ((Promotores − Detratores) / Total) × 100
