import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
  const data = await login(form);
  navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
} catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-panel">
      <h1>Welcome back</h1>
      <p className="panel-copy">Sign in to manage your lost and found reports.</p>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="error-banner">{error}</div>}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="switch-copy">
        New to the system? <Link to="/register">Create a student account</Link>
      </p>
    </div>
  );
}
