import { useEffect, useState } from 'react';
import api from '../api';

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState('');
  const [activeClaimId, setActiveClaimId] = useState(null);

  const loadClaims = async () => {
    try {
      setError('');
      const { data } = await api.get('/claims/my');
      setClaims(data.claims || []);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          'Unable to load your claims right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const viewEvidence = async (claimId) => {
    if (activeClaimId === claimId) {
      setActiveClaimId(null);
      setEvidence('');
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/claims/${claimId}/evidence`);
      setEvidence(data.evidence);
      setActiveClaimId(claimId);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          'Unable to load private claim evidence.'
      );
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Claim history</span>
          <h1>My claims</h1>
        </div>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {loading ? (
        <p role="status">Loading your claims...</p>
      ) : claims.length === 0 ? (
        <div className="empty-state">You have not made any ownership claims yet.</div>
      ) : (
        <div className="list-stack">
          {claims.map((claim) => (
            <article key={claim.id} className="claim-card">
              <div className="report-card-top">
                <span className={`status-badge ${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
                <span>{claim.item_title}</span>
              </div>

              {claim.admin_response && (
                <p><strong>Admin response:</strong> {claim.admin_response}</p>
              )}

              <button
                className="secondary-button inline-button"
                type="button"
                onClick={() => viewEvidence(claim.id)}
              >
                {activeClaimId === claim.id ? 'Hide private evidence' : 'View private evidence'}
              </button>

              {activeClaimId === claim.id && evidence && (
                <div className="evidence-box" style={{ marginTop: '0.75rem', padding: '1rem' }}>
                  <h3>Private evidence</h3>
                  <p>{evidence}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
