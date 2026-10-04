import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import AuthLayout from '../../components/AuthLayout';
import { useFlash } from '../../context/FlashContext';

function RegisterUser() {
  const navigate = useNavigate();
  const { triggerFlash } = useFlash();

  const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const { fullname, email, password } = formData;
    if (!fullname.trim() || !email.trim() || !password) {
      triggerFlash('All fields are required.', 'error');
      return;
    }
    if (!email.includes('@')) {
      triggerFlash('Invalid email address', 'error');
      return;
    }
    if (password.length < 8) {
      triggerFlash('Password must be at least 8 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/user/register', {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
      });
      if (res.data.success) {
        triggerFlash('Registered successfully', 'success');
        navigate('/user/login', { replace: true });
      } else {
        triggerFlash(res.data.error || 'Could not create the account.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Save your details once and check out in a couple of clicks."
      footer={
        <>
          Already registered?{' '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/user/login">
            Sign in instead
          </Link>
          {' · '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/seller/register">
            Register as a seller
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <div>
          <label className="field-label" htmlFor="fullname">
            Full name
          </label>
          <input
            id="fullname"
            type="text"
            name="fullname"
            autoComplete="name"
            placeholder="Your name"
            value={formData.fullname}
            onChange={handleChange}
            className="field-input"
          />
        </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="field-input"
          />
          <p className="field-hint">Use 8 characters or more.</p>
        </div>

        <button type="submit" disabled={submitting} className="btn-accent-wide mt-1">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterUser;
