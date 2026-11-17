import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
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
      await register(form);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to create an account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-panel">
      <h1>Create account</h1>
      <p className="panel-copy">Register as a UCU student to report lost or found items.</p>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="error-banner">{error}</div>}

        <label>
          Full name
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
        </label>

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="switch-copy">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
