import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function ClaimSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/claims', {
        itemReportId: Number(id),
        evidence,
      });

      setSuccess(data.message);
      setTimeout(() => navigate('/my-claims'), 900);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to submit your claim.');
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Claim ownership</span>
          <h1>Submit evidence</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <label>
          Private ownership description
          <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={6} required />
        </label>

        <button type="submit" className="primary-button full-width">Submit claim</button>
      </form>
    </div>
  );
}
