import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Notification from '../../components/ui/Notification.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import apiClient from '../../services/apiClient.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setNotification(null);
    try {
      const { data } = await apiClient.post('/auth/login', form);
      const { accessToken, user: loggedInUser } = data.data;
      login(loggedInUser, accessToken);
      setNotification({ type: 'success', message: 'Signed in successfully. Redirecting...' });
      setTimeout(() => {
        navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
      }, 400);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Invalid email or password';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-sidebar">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to continue to Full SMS</p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          endAdornment={
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="uppercase">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/parent/signup" className="text-sidebar underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

