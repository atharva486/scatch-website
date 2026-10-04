import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
import AuthLayout from '../../components/AuthLayout';
import { useFlash } from '../../context/FlashContext';

const EMPTY = { fullname: '', email: '', password: '', gstin: '' };

function RegisterSeller() {
  const navigate = useNavigate();
  const { triggerFlash } = useFlash();

  const [formData, setFormData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const { fullname, email, password, gstin } = formData;
    if (!fullname.trim() || !email.trim() || !password || !gstin.trim()) {
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
    if (gstin.trim().length !== 15) {
      triggerFlash('GSTIN must be exactly 15 characters (e.g. 27ABCDE1234F1Z5).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/seller/register', {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
        gstin: gstin.trim().toUpperCase(),
      });
      if (res.data.success) {
        triggerFlash('Seller account created', 'success');
        navigate('/seller/login', { replace: true });
      } else {
        triggerFlash(res.data.error || 'Could not create the account.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Server error or invalid input.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      tone="sage"
      eyebrow="Seller portal"
      title="Create your seller account"
      subtitle="List parts, track stock and see how your store is performing."
      footer={
        <>
          Already registered?{' '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/seller/login">
            Sign in instead
          </Link>
          {' · '}
          <Link className="font-semibold text-primary-900 underline-offset-4 hover:underline" to="/user/register">
            Shop as a customer
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <div>
          <label className="field-label" htmlFor="fullname">
            Business name
          </label>
          <input
            id="fullname"
            type="text"
            name="fullname"
            autoComplete="organization"
            placeholder="e.g. Aarav Motors"
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="gstin">
            GSTIN
          </label>
          <input
            id="gstin"
            type="text"
            name="gstin"
            placeholder="27ABCDE1234F1Z5"
            maxLength={15}
            value={formData.gstin}
            onChange={handleChange}
            className="field-input uppercase tracking-wider"
          />
          <p className="field-hint">Exactly 15 characters, as printed on your GST certificate.</p>
        </div>

        <button type="submit" disabled={submitting} className="btn-accent-wide mt-1">
          {submitting ? 'Creating account…' : 'Create seller account'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterSeller;
