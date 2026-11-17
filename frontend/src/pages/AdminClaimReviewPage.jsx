import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function AdminClaimReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [status, setStatus] = useState('APPROVED');
  const [adminResponse, setAdminResponse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClaim = async () => {
      try {
        const { data } = await api.get('/admin/claims');
        const found = data.claims.find((item) => item.id === Number(id));
        if (!found) {
          throw new Error('Claim not found');
        }
        setClaim(found);
        setStatus(found.status === 'APPROVED' ? 'APPROVED' : 'APPROVED');
        setAdminResponse(found.admin_response || '');
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load the claim for review.');
      }
    };

    loadClaim();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.patch(`/admin/claims/${id}`, { status, adminResponse });
      navigate('/admin/claims');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to review the claim.');
    }
  };

  if (!claim) {
    return <p>{error || 'Loading claim...'}</p>;
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Claim review</span>
          <h1>Review ownership claim</h1>
        </div>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <p><strong>Item:</strong> {claim.item_title}</p>
        <p><strong>Claimant:</strong> {claim.claimant_name}</p>
        <p><strong>Evidence:</strong> {claim.evidence}</p>

        <label>
          Decision
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>

        <label>
          Admin response
          <textarea value={adminResponse} onChange={(event) => setAdminResponse(event.target.value)} rows={4} required />
        </label>

        <button type="submit" className="primary-button full-width">Submit decision</button>
      </form>
    </div>
  );
}
