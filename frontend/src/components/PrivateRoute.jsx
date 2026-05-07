import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.global_role)) {
    return <Navigate to={user.global_role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'} replace />;
  }

  return <Outlet />;
}