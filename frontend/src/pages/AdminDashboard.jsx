import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Administrator dashboard</span>
          <h1>Review and manage reports</h1>
        </div>
      </header>

      <div className="action-grid">
        <Link className="panel-card" to="/admin/reports">Manage reports</Link>
        <Link className="panel-card" to="/admin/claims">Review claims</Link>
      </div>
    </div>
  );
}
