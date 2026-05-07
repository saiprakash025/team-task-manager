import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    global_role: 'ADMIN',
  });
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
      const res = await api.post('/auth/signup', form);
      login(res.data.token, res.data.user);

      if (res.data.user.global_role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.errors?.length) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.message || 'Server error');
      }
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}

        <select name="global_role" value={form.global_role} onChange={handleChange} style={styles.input}>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
        </select>

        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={styles.input} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} style={styles.input} required />

        <button type="submit" style={styles.btn}>Sign Up</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  form: { background: '#f9f8f5', padding: '32px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px', width: '340px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4d1ca', fontSize: '15px' },
  btn: { padding: '10px', background: '#01696f', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '15px' },
  error: { color: '#a12c7b', fontSize: '14px' },
};