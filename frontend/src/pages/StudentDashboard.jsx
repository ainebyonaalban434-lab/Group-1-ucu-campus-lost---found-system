import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ reports: 0, claims: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportsResponse, claimsResponse] = await Promise.all([
          api.get('/reports/my'),
          api.get('/claims/my'),
        ]);

        setStats({
          reports: reportsResponse.data.reports.length,
          claims: claimsResponse.data.claims.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Student dashboard</span>
          <h1>Welcome back</h1>
        </div>
      </header>

      {loading ? (
        <p>Loading your dashboard...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <strong>{stats.reports}</strong>
            <span>My reports</span>
          </div>
          <div className="stat-card">
            <strong>{stats.claims}</strong>
            <span>My claims</span>
          </div>
        </div>
      )}

      <div className="action-grid">
        <Link className="panel-card" to="/reports">Browse public reports</Link>
        <Link className="panel-card" to="/reports/new">Create a lost report</Link>
        <Link className="panel-card" to="/reports/found/new">Create a found report</Link>
        <Link className="panel-card" to="/my-reports">View my reports</Link>
        <Link className="panel-card" to="/my-claims">View my claims</Link>
      </div>
    </div>
  );
}
