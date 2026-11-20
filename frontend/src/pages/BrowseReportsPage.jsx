import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const initialFilters = {
  keyword: '',
  category: '',
  campusLocation: '',
  itemType: 'ALL',
  status: 'ALL',
  date: '',
};

export default function BrowseReportsPage() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setError('');
        const { data } = await api.get('/reports');
        setReports(data.reports || []);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            'Unable to load campus reports right now. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const category = filters.category.trim().toLowerCase();
    const campusLocation = filters.campusLocation.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesKeyword =
        !keyword ||
        report.title.toLowerCase().includes(keyword) ||
        report.public_description.toLowerCase().includes(keyword);

      const matchesCategory =
        !category || report.category.toLowerCase().includes(category);

      const matchesLocation =
        !campusLocation ||
        report.campus_location.toLowerCase().includes(campusLocation);

      const matchesType =
        filters.itemType === 'ALL' || report.item_type === filters.itemType;

      const matchesStatus =
        filters.status === 'ALL' || report.status === filters.status;

      const normalizedDate = String(report.item_date || '').slice(0, 10);
      const matchesDate = !filters.date || normalizedDate === filters.date;

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesLocation &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [reports, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Browse reports</span>
          <h1>Campus item listings</h1>
        </div>
      </header>

      <section className="filter-bar" aria-label="Filter reports">
        <input
          name="keyword"
          aria-label="Search by keyword"
          value={filters.keyword}
          onChange={handleChange}
          placeholder="Search by keyword..."
        />
        <select
          name="itemType"
          aria-label="Filter by item type"
          value={filters.itemType}
          onChange={handleChange}
        >
          <option value="ALL">All types (Lost & Found)</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select
          name="status"
          aria-label="Filter by status"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="RETURNED">Returned</option>
        </select>
        <input
          name="category"
          aria-label="Filter by category"
          value={filters.category}
          onChange={handleChange}
          placeholder="Category (e.g. Keys, ID)"
        />
        <input
          name="campusLocation"
          aria-label="Filter by campus location"
          value={filters.campusLocation}
          onChange={handleChange}
          placeholder="Location (e.g. N5B, Library)"
        />
        <input
          name="date"
          aria-label="Filter by date"
          value={filters.date}
          onChange={handleChange}
          type="date"
        />
        <button type="button" className="secondary-button" onClick={handleReset}>
          Clear filters
        </button>
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {loading ? (
        <p role="status">Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">No reports match your filters yet.</div>
      ) : (
        <div className="report-list">
          {filteredReports.map((report) => (
            <article key={report.id} className="report-card">
              <div className="report-card-top">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`status-badge ${report.item_type.toLowerCase()}`}>
                    {report.item_type}
                  </span>
                  <span className={`status-badge ${report.status.toLowerCase()}`}>
                    {report.status}
                  </span>
                </div>
                <span className="report-location">{report.campus_location}</span>
              </div>
              <h3>{report.title}</h3>
              <p>{report.public_description}</p>
              <div className="meta-row">
                <span>{report.category}</span>
                <span>{String(report.item_date || '').slice(0, 10)}</span>
              </div>
              <Link className="secondary-button inline-button" to={`/reports/${report.id}`}>
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
