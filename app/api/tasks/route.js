import { getSql, initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const sql = getSql();
    const tasks = await sql`
      SELECT id, title, done
      FROM tasks
      WHERE task_date = CURRENT_DATE
      ORDER BY id ASC
    `;
    return Response.json({ tasks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await initDb();
    const sql = getSql();
    const { title } = await req.json();
    if (!title?.trim()) {
      return Response.json({ error: 'Titre requis' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO tasks (title, task_date)
      VALUES (${title.trim()}, CURRENT_DATE)
      RETURNING id, title, done
    `;

    return Response.json({ task: rows[0] }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await initDb();
    const sql = getSql();
    const { id, done } = await req.json();

    const rows = await sql`
      UPDATE tasks
      SET done = ${!!done}
      WHERE id = ${id}
      RETURNING id, title, done
    `;

    if (!rows[0]) {
      return Response.json({ error: 'Tâche introuvable' }, { status: 404 });
    }

    return Response.json({ task: rows[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
