import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const { data } = await api.get('/admin/claims');
        setClaims(data.claims || []);
      } catch (error) {
        console.error(error);
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

      {loading ? (
        <p>Loading claims...</p>
      ) : (
        <div className="list-stack">
          {claims.map((claim) => (
            <article key={claim.id} className="claim-card">
              <div className="report-card-top">
                <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                <span>{claim.item_title}</span>
              </div>

              <p><strong>Claimant:</strong> {claim.claimant_name}</p>
              <p><strong>Evidence:</strong> {claim.evidence}</p>
              <p><strong>Reporter:</strong> {claim.reporter_name}</p>

              <Link className="primary-button inline-button" to={`/admin/claims/${claim.id}`}>
                Review claim
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
