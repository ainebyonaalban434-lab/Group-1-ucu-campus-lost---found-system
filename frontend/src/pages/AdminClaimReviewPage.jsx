
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadClaim = async () => {
      try {
        const { data } = await api.get('/admin/claims');
        const found = data.claims.find(
          (item) => item.id === Number(id)
        );

        if (!found) {
          throw new Error('Claim not found');
        }

        setClaim(found);
        setStatus('APPROVED');
        setAdminResponse(found.admin_response || '');
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
          loadError.message ||
          'Unable to load the claim for review.'
        );
      }
    };

    loadClaim();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || claim?.status !== 'PENDING') {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.patch(`/admin/claims/${id}`, {
        status,
        adminResponse: adminResponse.trim(),
      });

      navigate('/admin/claims');
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
        'Unable to review the claim.'
      );
    } finally {
      setIsSubmitting(false);
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

      <div className="form-card">
        {error && <div className="error-banner">{error}</div>}

        <p><strong>Item:</strong> {claim.item_title}</p>
        <p><strong>Claimant:</strong> {claim.claimant_name}</p>
        <p><strong>Evidence:</strong> {claim.evidence}</p>
        <p><strong>Current status:</strong> {claim.status}</p>

        {claim.status === 'PENDING' ? (
          <form onSubmit={handleSubmit}>
            <label>
              Decision
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={isSubmitting}
              >
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>

            <label>
              Admin response
              <textarea
                value={adminResponse}
                onChange={(event) => setAdminResponse(event.target.value)}
                rows={4}
                required
                disabled={isSubmitting}
              />
            </label>

            <button
              type="submit"
              className="primary-button full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit decision'}
            </button>
          </form>
        ) : (
          <div>
            <p><strong>Admin response:</strong></p>
            <p>{claim.admin_response || 'No response recorded.'}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate('/admin/claims')}
            >
              Back to claims
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
