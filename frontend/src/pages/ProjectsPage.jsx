import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const res = await api.get('/projects');
    setProjects(res.data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ name: '', description: '' });
    setShowForm(false);
    fetchProjects();
  }

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Projects</h1>
        {user?.global_role === 'ADMIN' && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ New Project</button>
        )}
      </div>

      {showForm && user?.global_role === 'ADMIN' && (
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.input}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Create</button>
        </form>
      )}

      {projects.length === 0 ? (
        <p style={{ color: '#7a7974', marginTop: '32px', textAlign: 'center' }}>No projects yet.</p>
      ) : (
        <div style={styles.grid}>
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} style={styles.card}>
              <h3 style={{ marginBottom: '8px' }}>{p.name}</h3>
              <p style={{ color: '#7a7974', fontSize: '14px' }}>{p.description || 'No description'}</p>
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#01696f', fontWeight: 600 }}>
                My Role: {p.currentUserRole}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
  btn: { background: '#01696f', color: '#fff', padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px' },
  form: { background: '#f9f8f5', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxWidth: '400px' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4d1ca', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: { background: '#f9f8f5', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textDecoration: 'none', color: '#28251d', display: 'block' },
};