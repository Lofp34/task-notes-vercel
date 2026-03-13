import { getSql, initDb } from '@/lib/db';

export async function GET(req) {
  try {
    await initDb();
    const sql = getSql();
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return Response.json({ error: 'taskId requis' }, { status: 400 });
    }

    const notes = await sql`
      SELECT id, task_id AS "taskId", content, created_at AS "createdAt"
      FROM notes
      WHERE task_id = ${taskId}
      ORDER BY created_at DESC
    `;

    return Response.json({ notes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await initDb();
    const sql = getSql();
    const { taskId, content } = await req.json();

    if (!taskId || !content?.trim()) {
      return Response.json({ error: 'taskId et contenu requis' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO notes (task_id, content)
      VALUES (${taskId}, ${content.trim()})
      RETURNING id, task_id AS "taskId", content, created_at AS "createdAt"
    `;

    return Response.json({ note: rows[0] }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
