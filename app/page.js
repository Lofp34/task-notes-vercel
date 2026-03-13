'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [notesByTask, setNotesByTask] = useState({});
  const [newTask, setNewTask] = useState('');
  const [newNoteByTask, setNewNoteByTask] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    const res = await fetch('/api/tasks', { cache: 'no-store' });
    const data = await res.json();
    setTasks(data.tasks || []);
  }

  async function loadNotes(taskId) {
    const res = await fetch(`/api/notes?taskId=${taskId}`, { cache: 'no-store' });
    const data = await res.json();
    setNotesByTask((prev) => ({ ...prev, [taskId]: data.notes || [] }));
  }

  useEffect(() => {
    (async () => {
      await loadTasks();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!openTaskId) return;

    const id = setInterval(() => {
      loadNotes(openTaskId);
    }, 3500);

    const onFocus = () => loadNotes(openTaskId);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [openTaskId]);

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask.trim() }),
    });

    setNewTask('');
    await loadTasks();
  }

  async function toggleTask(task) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    });

    await loadTasks();
  }

  async function openTask(taskId) {
    setOpenTaskId((prev) => (prev === taskId ? null : taskId));
    if (openTaskId !== taskId) await loadNotes(taskId);
  }

  async function addNote(e, taskId) {
    e.preventDefault();
    const text = (newNoteByTask[taskId] || '').trim();
    if (!text) return;

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, content: text }),
    });

    if (!res.ok) {
      alert('Impossible d’enregistrer la note.');
      return;
    }

    setNewNoteByTask((prev) => ({ ...prev, [taskId]: '' }));
    await loadNotes(taskId);
  }

  if (loading) {
    return <main className="app"><section className="shell">Chargement…</section></main>;
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <main className="app">
      <section className="shell">
        <header className="hero">
          <p className="kicker">CLAWDIA · DAILY FOCUS</p>
          <h1>Priorités du jour</h1>
          <p className="sub">Cartes dépliables, notes synchronisées, usage mobile premium.</p>
        </header>

        <form onSubmit={addTask} className="new-task">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Ajouter une nouvelle tâche"
          />
          <button type="submit">Ajouter</button>
        </form>

        <div className="stats">{done}/{tasks.length} tâches faites</div>

        <section className="cards">
          {tasks.map((task) => {
            const isOpen = openTaskId === task.id;
            const notes = notesByTask[task.id] || [];
            const draft = newNoteByTask[task.id] || '';

            return (
              <article key={task.id} className={`task-card ${task.done ? 'done' : ''}`}>
                <button className="task-head" onClick={() => openTask(task.id)}>
                  <span className="left">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTask(task);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="title">{task.title}</span>
                  </span>
                  <span className="chevron">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="task-body">
                    <div className="notes-bar">
                      <span>{notes.length} note(s)</span>
                      <button type="button" onClick={() => loadNotes(task.id)}>Actualiser</button>
                    </div>

                    <form onSubmit={(e) => addNote(e, task.id)} className="note-form">
                      <textarea
                        rows={3}
                        value={draft}
                        onChange={(e) =>
                          setNewNoteByTask((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder="Saisir une note sur cette tâche..."
                      />
                      <button type="submit">Enregistrer la note</button>
                    </form>

                    <div className="notes-list">
                      {notes.map((note) => (
                        <div className="note" key={note.id}>
                          <small>{new Date(note.createdAt).toLocaleString('fr-FR')}</small>
                          <p>{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
