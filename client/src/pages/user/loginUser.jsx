import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import AuthLayout from '../../components/AuthLayout';
import { useFlash } from '../../context/FlashContext';

function LoginUser() {
  const navigate = useNavigate();
  const { triggerFlash } = useFlash();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const { email, password } = formData;
    if (!email.trim() || !password) {
      triggerFlash('Enter both your email and password.', 'error');
      return;
    }
    if (!email.includes('@')) {
      triggerFlash('Invalid email address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/user/login', { email: email.trim(), password });
      if (res.data.success) {
        triggerFlash('Logged in successfully', 'success');
        navigate('/user/homepage', { replace: true });
      } else {
        triggerFlash(res.data.error || 'Please enter correct credentials.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not log you in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Track orders, manage your wishlist and check out faster."
      footer={
        <>
          New to Scatch?{' '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/user/register">
            Create an account
          </Link>
          {' · '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/seller/login">
            Sell on Scatch
          </Link>
        </>
      }
    >
      {/* `onClick={submit}` used to sit alongside `onSubmit={submit}`, so a
          click fired two login requests (and the click path skipped
          preventDefault, reloading the page). Now the form handles it once. */}
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-accent-wide mt-1">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {/* Only in dev: these seeded accounts do not exist against a real
            database, so advertising them in production would be misleading. */}
        {import.meta.env.DEV ? (
          <p className="field-hint text-center">
            Demo account <span className="font-semibold text-primary-600">user@scatch.dev</span> ·{' '}
            <span className="font-semibold text-primary-600">Password123</span>
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}

export default LoginUser;
