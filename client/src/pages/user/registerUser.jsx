import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios/api';
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
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-sky-500 py-5 flex flex-col gap-10 items-center">
      <div className="w-full flex justify-between px-5">
        <div className="text-xl rounded-2xl px-2">
          Create a new account?{' '}
          <Link className="text-xl text-blue-500 hover:underline" to="/seller/register">
            Register as a seller
          </Link>
        </div>
        <div className="text-xl rounded-2xl px-2">
          <Link className="text-2xl text-blue-600 hover:underline" to="/user/login">
            Login
          </Link>
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-6 pt-5 rounded-4xl">
        <div className="w-full mx-auto text-2xl font-bold text-black">
          Welcome to <span className="text-blue-600 text-4xl">Scatch</span>
          <br />
          Create your account
        </div>

        <form className="m-0 p-0 w-3/4 flex flex-col gap-3" onSubmit={submit}>
          <input
            type="text"
            name="fullname"
            autoComplete="name"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            className="bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold"
          />
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
            autoComplete="new-password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-300 rounded-xl px-3 h-10 w-full outline-none font-semibold"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mx-auto w-fit bg-blue-700 hover:bg-blue-900 disabled:bg-blue-400 px-4 rounded-4xl h-10 text-xl text-white font-semibold hover:cursor-pointer"
          >
            {submitting ? 'Creating account…' : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterUser;
