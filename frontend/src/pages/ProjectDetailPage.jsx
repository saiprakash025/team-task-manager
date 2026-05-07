import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', due_date: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchTasks(); }, [projectId]);

  async function fetchTasks() {
    const res = await api.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    await api.post(`/tasks/project/${projectId}`, taskForm);
    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', due_date: '' });
    setShowTaskForm(false);
    fetchTasks();
  }

  async function handleStatusChange(taskId, newStatus) {
    await api.patch(`/tasks/${taskId}`, { status: newStatus });
    fetchTasks();
  }

  async function handleAddMember(e) {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, { userId: Number(memberUserId), role: 'MEMBER' });
      setMsg('Member added!');
      setMemberUserId('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding member');
    }
  }

  const statusColors = { TODO: '#01696f', IN_PROGRESS: '#d19900', DONE: '#437a22' };

  return (
    <div style={styles.page}>
      <h1 style={{ marginBottom: '24px' }}>Project #{projectId}</h1>

      {/* Add Member section */}
      <section style={styles.section}>
        <h2>Add Member</h2>
        <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <input
            placeholder="User ID"
            value={memberUserId}
            onChange={(e) => setMemberUserId(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.btn}>Add Member</button>
        </form>
        {msg && <p style={{ color: '#437a22', marginTop: '8px', fontSize: '14px' }}>{msg}</p>}
      </section>

      {/* Tasks section */}
      <section style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Tasks</h2>
          <button style={styles.btn} onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
        </div>

        {showTaskForm && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} style={styles.input} required />
            <input placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} style={styles.input} />
            <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} style={styles.input}>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
            <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.btn}>Create Task</button>
          </form>
        )}

        {tasks.length === 0 ? (
          <p style={{ color: '#7a7974', marginTop: '16px' }}>No tasks yet. Add one above!</p>
        ) : (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((t) => (
              <div key={t.id} style={styles.taskCard}>
                <div style={{ flex: 1 }}>
                  <strong>{t.title}</strong>
                  {t.description && <p style={{ color: '#7a7974', fontSize: '13px', marginTop: '4px' }}>{t.description}</p>}
                  <p style={{ fontSize: '13px', marginTop: '4px', color: '#7a7974' }}>
                    Priority: <strong>{t.priority}</strong>
                    {t.due_date && <> | Due: <span style={{ color: new Date(t.due_date) < new Date() && t.status !== 'DONE' ? '#a12c7b' : '#28251d' }}>{t.due_date?.slice(0, 10)}</span></>}
                  </p>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  style={{ ...styles.input, background: statusColors[t.status], color: '#fff', width: '140px', fontWeight: 600 }}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
  section: { background: '#f9f8f5', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  btn: { background: '#01696f', color: '#fff', padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxWidth: '400px' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4d1ca', fontSize: '14px' },
  taskCard: { background: '#fff', border: '1px solid #dcd9d5', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '16px' },
};