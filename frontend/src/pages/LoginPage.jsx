import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.btn}>Login</button>
        <p>Don't have an account? <Link to="/signup">Signup</Link></p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' },
  form: { background: '#f9f8f5', padding: '32px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px', width: '340px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4d1ca', fontSize: '15px' },
  btn: { padding: '10px', background: '#01696f', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '15px' },
  error: { color: '#a12c7b', fontSize: '14px' },
};