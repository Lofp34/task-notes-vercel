import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT t.id,t.title,t.done,
         n.id as note_id,n.content,n.created_at as note_created_at
  FROM tasks t
  LEFT JOIN notes n ON n.task_id=t.id
  WHERE t.task_date=CURRENT_DATE
  ORDER BY t.id ASC, n.created_at DESC
`;

console.log(JSON.stringify(rows, null, 2));
