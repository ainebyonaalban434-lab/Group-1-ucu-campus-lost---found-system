import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClaims = async () => {
      try {
        setError('');
        const { data } = await api.get('/admin/claims');
        setClaims(data.claims || []);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            'Unable to load ownership claims.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Admin review</span>
          <h1>Ownership claims</h1>
        </div>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {loading ? (
        <p role="status">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="empty-state">No ownership claims have been submitted yet.</div>
      ) : (
        <div className="list-stack">
          {claims.map((claim) => (
            <article key={claim.id} className="claim-card">
              <div className="report-card-top">
                <span className={`status-badge ${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
                <span>{claim.item_title} ({claim.report_status})</span>
              </div>

              <p><strong>Claimant:</strong> {claim.claimant_name}</p>
              <p><strong>Evidence:</strong> {claim.evidence}</p>
              <p><strong>Reporter:</strong> {claim.reporter_name}</p>
              {claim.admin_response && (
                <p><strong>Admin response:</strong> {claim.admin_response}</p>
              )}

              {claim.status === 'PENDING' ? (
                <Link className="primary-button inline-button" to={`/admin/claims/${claim.id}`}>
                  Review claim
                </Link>
              ) : (
                <Link className="secondary-button inline-button" to={`/admin/claims/${claim.id}`}>
                  View decision
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
