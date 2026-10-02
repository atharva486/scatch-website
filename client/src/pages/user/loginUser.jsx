import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
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
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-sky-500 py-5 flex flex-col gap-10 items-center">
      <div className="w-full flex justify-between px-5">
        <div className="text-xl rounded-2xl px-2">
          Are you a seller?{' '}
          <Link className="text-xl text-blue-500 hover:underline" to="/seller/login">
            Login
          </Link>
        </div>
        <div className="text-xl rounded-2xl px-2">
          Create a new account?{' '}
          <Link className="text-xl text-blue-500 hover:underline" to="/user/register">
            Register
          </Link>
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-6 pt-10 rounded-4xl">
        <div className="w-full mx-auto text-2xl font-bold text-black">Login Your Account</div>

        <form className="m-0 p-0 w-3/4 flex flex-col gap-3" onSubmit={submit}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold"
          />
          {/* `onClick={submit}` used to sit alongside `onSubmit={submit}`, so a
              click fired two login requests (and the click path skipped
              preventDefault, reloading the page). Now the form handles it once. */}
          <button
            type="submit"
            disabled={submitting}
            className="ml-1 w-fit bg-blue-700 hover:bg-blue-900 disabled:bg-blue-400 px-4 rounded-4xl h-10 text-xl text-white font-semibold hover:cursor-pointer"
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginUser;
