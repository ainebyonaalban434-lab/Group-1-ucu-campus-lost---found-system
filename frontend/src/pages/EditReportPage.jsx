import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function EditReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    publicDescription: '',
    privateDetails: '',
    itemDate: '',
    campusLocation: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data } = await api.get(`/reports/${id}`);
        setForm({
          title: data.report.title,
          category: data.report.category,
          publicDescription: data.report.public_description,
          privateDetails: data.report.private_details || '',
          itemDate: data.report.item_date,
          campusLocation: data.report.campus_location,
          imageUrl: data.report.image_url || '',
        });
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load this report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.put(`/reports/${id}`, {
        title: form.title,
        category: form.category,
        publicDescription: form.publicDescription,
        privateDetails: form.privateDetails,
        itemDate: form.itemDate,
        campusLocation: form.campusLocation,
        imageUrl: form.imageUrl,
      });

      navigate('/my-reports');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to update report.');
    }
  };

  if (loading) {
    return <p>Loading report editor...</p>;
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Edit report</span>
          <h1>Update item details</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="error-banner">{error}</div>}

        <label>
          Item title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Category
          <input name="category" value={form.category} onChange={handleChange} required />
        </label>

        <label>
          Public description
          <textarea name="publicDescription" value={form.publicDescription} onChange={handleChange} required rows={4} />
        </label>

        <label>
          Private identifying details
          <textarea name="privateDetails" value={form.privateDetails} onChange={handleChange} rows={4} />
        </label>

        <div className="form-row">
          <label>
            Date
            <input type="date" name="itemDate" value={form.itemDate} onChange={handleChange} required />
          </label>
          <label>
            Campus location
            <input name="campusLocation" value={form.campusLocation} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Image URL
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </label>

        <button type="submit" className="primary-button full-width">Save changes</button>
      </form>
    </div>
  );
}
