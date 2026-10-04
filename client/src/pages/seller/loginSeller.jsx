import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import AuthLayout from '../../components/AuthLayout';
import { useFlash } from '../../context/FlashContext';

function LoginSeller() {
  const navigate = useNavigate();
  const { triggerFlash } = useFlash();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    // Was both `onSubmit` and `onClick`, which fired two login requests.
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
      const res = await api.post('/api/seller/login', { email: email.trim(), password });
      if (res.data.success) {
        triggerFlash('Logged in successfully', 'success');
        navigate('/seller/dashboard', { replace: true });
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
      tone="sage"
      eyebrow="Seller portal"
      title="Sign in to your store"
      subtitle="Manage your catalogue, stock levels and sales analytics."
      footer={
        <>
          New seller?{' '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/seller/register">
            Create a seller account
          </Link>
          {' · '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/user/login">
            Shop as a customer
          </Link>
        </>
      }
    >
      {/* Was both `onSubmit` and `onClick`, which fired two login requests. */}
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
            placeholder="you@yourstore.com"
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

        {/* Only in dev: the seeded seller accounts do not exist against a real
            database, so advertising them in production would be misleading. */}
        {import.meta.env.DEV ? (
          <p className="field-hint text-center">
            Demo store <span className="font-semibold text-primary-600">seller@scatch.dev</span> ·{' '}
            <span className="font-semibold text-primary-600">Password123</span>
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}

export default LoginSeller;
