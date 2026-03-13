import { neon } from '@neondatabase/serverless';

const DAILY_PRIORITIES = [
  '🔴 Suivi appel — Christian Jacquart (aujourd’hui)',
  '🟠 Faire le PEA Boursobank',
  '🟠 Préparer GEDEAS',
  '🟠 Point audits + relance des RDV',
  '📌 Initium/Endholistic : préparer le RDV Jordan du 17/03 (scénario de décision)',
  '📌 Ovea : relance + sécuriser clôture au 30/03 (8 900 €)',
  '📌 PES Solutions : envoyer le lien e-learning Kevin',
  '📌 PES Solutions : préparer le RDV du 03/04 à 15h',
];

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.NEON_DATABASE_URL
  );
}

function getSql() {
  const url = getDatabaseUrl();

  if (!url) {
    throw new Error(
      'Aucune URL Postgres trouvée (DATABASE_URL / POSTGRES_URL / POSTGRES_PRISMA_URL / NEON_DATABASE_URL).',
    );
  }

  return neon(url);
}

export async function initDb() {
  const sql = getSql();

  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM tasks
    WHERE task_date = CURRENT_DATE
  `;

  if (countRows[0].count === 0) {
    for (const title of DAILY_PRIORITIES) {
      await sql`INSERT INTO tasks (title, task_date) VALUES (${title}, CURRENT_DATE)`;
    }
  }
}

export { getSql };
