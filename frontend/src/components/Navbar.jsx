import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{ padding: '12px 24px', background: '#01696f', color: '#fff', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Link to={user?.global_role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'} style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
        TaskManager
      </Link>

      {user && (
        <>
          <Link to="/projects" style={{ color: '#fff', textDecoration: 'none' }}>Projects</Link>
          <span style={{ marginLeft: 'auto' }}>
            {user.name} ({user.global_role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}