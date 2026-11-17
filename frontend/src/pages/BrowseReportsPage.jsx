import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const initialFilters = {
  keyword: '',
  category: '',
  campusLocation: '',
  itemType: 'ALL',
  date: '',
};

export default function BrowseReportsPage() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await api.get('/reports');
        setReports(data.reports || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesKeyword =
        !filters.keyword ||
        report.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        report.public_description.toLowerCase().includes(filters.keyword.toLowerCase());

      const matchesCategory = !filters.category || report.category === filters.category;
      const matchesLocation = !filters.campusLocation || report.campus_location === filters.campusLocation;
      const matchesType = filters.itemType === 'ALL' || report.item_type === filters.itemType;
      const matchesDate = !filters.date || report.item_date === filters.date;

      return matchesKeyword && matchesCategory && matchesLocation && matchesType && matchesDate;
    });
  }, [reports, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Browse reports</span>
          <h1>Campus item listings</h1>
        </div>
      </header>

      <section className="filter-bar">
        <input name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Search by keyword" />
        <select name="itemType" value={filters.itemType} onChange={handleChange}>
          <option value="ALL">All item types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <input name="category" value={filters.category} onChange={handleChange} placeholder="Category" />
        <input name="campusLocation" value={filters.campusLocation} onChange={handleChange} placeholder="Campus location" />
        <input name="date" value={filters.date} onChange={handleChange} type="date" />
      </section>

      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">No reports match your filters yet.</div>
      ) : (
        <div className="report-list">
          {filteredReports.map((report) => (
            <article key={report.id} className="report-card">
              <div className="report-card-top">
                <span className={`status-badge ${report.item_type.toLowerCase()}`}>{report.item_type}</span>
                <span className="report-location">{report.campus_location}</span>
              </div>
              <h3>{report.title}</h3>
              <p>{report.public_description}</p>
              <div className="meta-row">
                <span>{report.category}</span>
                <span>{report.item_date}</span>
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
