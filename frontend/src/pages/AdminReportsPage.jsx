import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await api.get('/admin/reports');
        setReports(data.reports || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const markReturned = async (reportId) => {
    try {
      const { data } = await api.patch(`/admin/reports/${reportId}/return`);
      alert(data.message);
      setReports((current) => current.map((report) => report.id === reportId ? { ...report, status: 'RETURNED' } : report));
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to mark this item as returned.');
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Admin review</span>
          <h1>Report management</h1>
        </div>
      </header>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <div className="list-stack">
          {reports.map((report) => (
            <article key={report.id} className="claim-card">
              <div className="report-card-top">
                <span className={`status-badge ${report.item_type.toLowerCase()}`}>{report.item_type}</span>
                <span>{report.status}</span>
              </div>
              <h3>{report.title}</h3>
              <p>{report.public_description}</p>
              <p><strong>Reporter:</strong> {report.reporter_name}</p>
              <p><strong>Location:</strong> {report.campus_location}</p>
              {report.private_details && <p><strong>Private details:</strong> {report.private_details}</p>}
              {report.status !== 'RETURNED' && (
                <button type="button" className="primary-button inline-button" onClick={() => markReturned(report.id)}>
                  Confirm return
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
