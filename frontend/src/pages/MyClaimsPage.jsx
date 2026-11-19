import { useEffect, useState } from 'react';
import api from '../api';

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState('');

  const loadClaims = async () => {
    try {
      const { data } = await api.get('/claims/my');
      setClaims(data.claims || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const viewEvidence = async (claimId) => {
    try {
      const { data } = await api.get(`/claims/${claimId}/evidence`);
      setEvidence(data.evidence);
    } catch (error) {
      console.error(error);
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

      {loading ? (
        <p>Loading your claims...</p>
      ) : claims.length === 0 ? (
        <div className="empty-state">You have not made any ownership claims yet.</div>
      ) : (
        <div className="list-stack">
          {claims.map((claim) => (
            <article key={claim.id} className="claim-card">
              <div className="report-card-top">
                <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                <span>{claim.item_title}</span>
              </div>
              {claim.admin_response && <p><strong>Admin response:</strong> {claim.admin_response}</p>}
              <button className="secondary-button inline-button" type="button" onClick={() => viewEvidence(claim.id)}>
                View private evidence
              </button>
            </article>
          ))}
        </div>
      )}

      {evidence && (
        <div className="evidence-box">
          <h3>Private evidence</h3>
          <p>{evidence}</p>
        </div>
      )}
    </div>
  );
}
