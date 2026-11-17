import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const { data } = await api.get('/reports/my');
      setReports(data.reports || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">My reports</span>
          <h1>Reports you created</h1>
        </div>
      </header>

      {loading ? (
        <p>Loading your reports...</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">You have not submitted any reports yet.</div>
      ) : (
        <div className="report-list">
          {reports.map((report) => (
            <article key={report.id} className="report-card">
              <div className="report-card-top">
                <span className={`status-badge ${report.item_type.toLowerCase()}`}>{report.item_type}</span>
                <span className="report-location">{report.status}</span>
              </div>
              <h3>{report.title}</h3>
              <p>{report.public_description}</p>
              <div className="meta-row">
                <span>{report.category}</span>
                <span>{report.campus_location}</span>
              </div>
              <div className="row-actions">
                <Link className="secondary-button inline-button" to={`/reports/${report.id}`}>Open</Link>
                <Link className="primary-button inline-button" to={`/reports/${report.id}/edit`}>Edit</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
