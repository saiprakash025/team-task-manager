import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/overview').then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading dashboard...</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Dashboard</h1>

      {/* Task status cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Total Assigned</h3>
          <p style={styles.bigNum}>{data.totalAssigned}</p>
        </div>
        {data.tasksByStatus.map((s) => (
          <div key={s.status} style={{ ...styles.card, borderTop: `4px solid ${statusColor(s.status)}` }}>
            <h3>{s.status}</h3>
            <p style={styles.bigNum}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Overdue tasks */}
      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>⚠️ Overdue Tasks</h2>
      {data.overdueTasks.length === 0 ? (
        <p style={{ color: '#7a7974' }}>No overdue tasks 🎉</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {data.overdueTasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td style={{ color: '#a12c7b' }}>{t.due_date?.slice(0, 10)}</td>
                <td>{t.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function statusColor(status) {
  return status === 'DONE' ? '#437a22' : status === 'IN_PROGRESS' ? '#d19900' : '#01696f';
}

const styles = {
  page: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
  title: { fontSize: '28px', marginBottom: '24px' },
  cards: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  card: { background: '#f9f8f5', padding: '20px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', minWidth: '160px' },
  bigNum: { fontSize: '36px', fontWeight: 700, margin: '8px 0 0', color: '#28251d' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#f9f8f5', borderRadius: '8px', overflow: 'hidden' },
};