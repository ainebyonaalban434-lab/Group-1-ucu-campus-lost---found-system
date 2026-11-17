import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const initialState = {
  itemType: 'LOST',
  title: '',
  category: '',
  publicDescription: '',
  privateDetails: '',
  itemDate: '',
  campusLocation: '',
  imageUrl: '',
};

export default function CreateReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      itemType: location.pathname.includes('found') ? 'FOUND' : 'LOST',
    }));
  }, [location.pathname]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const payload = {
        itemType: form.itemType,
        title: form.title,
        category: form.category,
        publicDescription: form.publicDescription,
        privateDetails: form.privateDetails,
        itemDate: form.itemDate,
        campusLocation: form.campusLocation,
        imageUrl: form.imageUrl,
      };

      const { data } = await api.post('/reports', payload);
      setSuccess(data.message);
      setTimeout(() => navigate('/my-reports'), 700);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to create the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">Create report</span>
          <h1>{form.itemType === 'FOUND' ? 'Report a found item' : 'Report a lost item'}</h1>
        </div>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <label>
          Item type
          <select name="itemType" value={form.itemType} onChange={handleChange}>
            <option value="LOST">LOST</option>
            <option value="FOUND">FOUND</option>
          </select>
        </label>

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

        {form.itemType === 'FOUND' && (
          <label>
            Private identifying details
            <textarea name="privateDetails" value={form.privateDetails} onChange={handleChange} rows={4} required />
          </label>
        )}

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
          Image URL (optional)
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </label>

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Save report'}
        </button>
      </form>
    </div>
  );
}
