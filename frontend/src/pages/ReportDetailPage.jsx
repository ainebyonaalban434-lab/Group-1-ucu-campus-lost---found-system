
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data } = await api.get(`/reports/${id}`);
        setReport(data.report);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
          'Unable to load this report. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  if (loading) {
    return <p>Loading report...</p>;
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="error-banner">{error}</div>
        <Link className="secondary-button inline-button" to="/">
          Back to reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return <div className="empty-state">Report not found.</div>;
  }

  const isOwner = user && Number(report.reporter_id) === Number(user.id);

  const canEdit =
    isOwner && report.status !== 'RETURNED';

  const canClaim =
    user &&
    user.role === 'STUDENT' &&
    !isOwner &&
    report.item_type === 'FOUND' &&
    report.status === 'OPEN';

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Report details</span>
          <h1>{report.title}</h1>
        </div>
      </header>

      <article className="detail-card">
        <div className="report-card-top">
          <span className={`status-badge ${report.item_type.toLowerCase()}`}>
            {report.item_type}
          </span>
          <span>{report.status}</span>
        </div>

        <p><strong>Category:</strong> {report.category}</p>
        <p><strong>Location:</strong> {report.campus_location}</p>
        <p><strong>Date:</strong> {report.item_date}</p>
        <p><strong>Reported by:</strong> {report.reporter_name}</p>
        <p><strong>Public description:</strong> {report.public_description}</p>

        {report.private_details && (
          <div className="private-box">
            <strong>Private identifying details:</strong>
            <p>{report.private_details}</p>
          </div>
        )}

        {report.image_url && (
          <img
            className="report-image"
            src={report.image_url}
            alt={report.title}
          />
        )}

        {canEdit && (
          <Link
            className="primary-button inline-button"
            to={`/reports/${report.id}/edit`}
          >
            Edit report
          </Link>
        )}

        {canClaim && (
          <button
            type="button"
            className="primary-button inline-button"
            onClick={() => navigate(`/claims/${report.id}`)}
          >
            Submit ownership claim
          </button>
        )}
      </article>
    </div>
  );
}
