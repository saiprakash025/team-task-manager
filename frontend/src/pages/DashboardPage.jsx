import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard/overview')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading dashboard...</p>;
  if (!data) return <p style={{ padding: '24px' }}>Unable to load dashboard.</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{user?.global_role === 'ADMIN' ? 'Admin Dashboard' : 'Member Dashboard'}</h1>

      <div style={styles.infoBox}>
        <p><strong>User ID:</strong> {data.user.id}</p>
        <p><strong>Email:</strong> {data.user.email}</p>
        <p><strong>Role:</strong> {data.user.global_role}</p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Total Projects</h3>
          <p style={styles.bigNum}>{data.totalProjects}</p>
        </div>
        <div style={styles.card}>
          <h3>Admin Projects</h3>
          <p style={styles.bigNum}>{data.adminProjectsCount}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Assigned</h3>
          <p style={styles.bigNum}>{data.totalAssigned}</p>
        </div>
        <div style={styles.card}>
          <h3>Tasks In My Projects</h3>
          <p style={styles.bigNum}>{data.totalTasksInMyProjects}</p>
        </div>
      </div>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Task Status</h2>
      <div style={styles.cards}>
        {data.tasksByStatus.length === 0 ? (
          <p>No assigned tasks yet.</p>
        ) : (
          data.tasksByStatus.map((s) => (
            <div key={s.status} style={{ ...styles.card, borderTop: `4px solid ${statusColor(s.status)}` }}>
              <h3>{s.status}</h3>
              <p style={styles.bigNum}>{s.count}</p>
            </div>
          ))
        )}
      </div>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Overdue Tasks</h2>
      {data.overdueTasks.length === 0 ? (
        <p style={{ color: '#7a7974' }}>No overdue tasks.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {data.overdueTasks.map((t) => (
              <tr key={t._id}>
                <td style={styles.td}>{t.title}</td>
                <td style={styles.td}>{t.status}</td>
                <td style={styles.td}>{new Date(t.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function statusColor(status) {
  if (status === 'DONE') return '#437a22';
  if (status === 'IN_PROGRESS') return '#d19900';
  return '#01696f';
}

const styles = {
  page: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '28px', marginBottom: '20px' },
  infoBox: { background: '#f9f8f5', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '24px' },
  cards: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  card: { background: '#f9f8f5', padding: '20px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', minWidth: '180px' },
  bigNum: { fontSize: '32px', fontWeight: 700, margin: '8px 0 0', color: '#28251d' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#f9f8f5', borderRadius: '8px', overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px', background: '#f3f0ec', borderBottom: '1px solid #ddd' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
};