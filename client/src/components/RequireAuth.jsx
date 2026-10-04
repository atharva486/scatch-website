import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../axios/api';

/**
 * Route guard.
 *
 * The app had no route protection at all: typing /seller/dashboard in the URL
 * bar rendered the seller's dashboard for anyone, and /user/homepage rendered
 * for logged-out visitors who then just saw error toasts. This checks the
 * session first and redirects to the right login page.
 *
 * @param {'user'|'seller'} role
 */
export default function RequireAuth({ role, children }) {
  const location = useLocation();
  const [state, setState] = useState({ status: 'checking', sessionRole: null });

  useEffect(() => {
    let cancelled = false;

    api
      .get('/api/session')
      .then((res) => {
        if (!cancelled) setState({ status: 'done', sessionRole: res.data.role });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'done', sessionRole: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-100">
        <p className="text-lg text-primary-600 animate-pulse">Loading…</p>
      </div>
    );
  }

  const loginPath = role === 'seller' ? '/seller/login' : '/user/login';

  if (!state.sessionRole) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  // Right account type, wrong portal: send them to their own home.
  if (state.sessionRole !== role) {
    return <Navigate to={state.sessionRole === 'seller' ? '/seller/dashboard' : '/user/homepage'} replace />;
  }

  return children;
}