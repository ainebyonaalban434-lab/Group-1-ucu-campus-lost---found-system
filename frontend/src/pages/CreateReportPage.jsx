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

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setForm((current) => ({
      ...current,
      itemType: location.pathname.includes('found') ? 'FOUND' : 'LOST',
    }));
  }, [location.pathname]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (form.title.trim().length < 3) {
      return 'Item title must be at least 3 characters long (e.g., "Blue Keyring with Keys").';
    }
    if (form.category.trim().length < 2) {
      return 'Please enter a valid category (e.g., Keys, Electronics, ID Card, Books).';
    }
    if (form.publicDescription.trim().length < 10) {
      return 'Public description must be at least 10 characters so others can recognize the item.';
    }
    if (form.itemType === 'FOUND' && form.privateDetails.trim().length < 5) {
      return 'Found items require private identifying details (at least 5 characters) to verify the true owner.';
    }
    if (!form.itemDate) {
      return 'Please select the date the item was lost or found.';
    }
    if (form.itemDate > today) {
      return 'Item date cannot be in the future. Please select today or an earlier date.';
    }
    if (form.campusLocation.trim().length < 2) {
      return 'Please specify the UCU campus location (e.g., N5B, Hamu Mukasa Library, Touch of Class).';
    }
    if (form.imageUrl.trim()) {
      try {
        const url = new URL(form.imageUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'Image URL must start with http:// or https://.';
        }
      } catch {
        return 'Please enter a valid Image URL starting with http:// or https://, or leave it blank.';
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        itemType: form.itemType,
        title: form.title.trim(),
        category: form.category.trim(),
        publicDescription: form.publicDescription.trim(),
        privateDetails: form.itemType === 'FOUND' ? form.privateDetails.trim() : '',
        itemDate: form.itemDate,
        campusLocation: form.campusLocation.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      const { data } = await api.post('/reports', payload);
      setSuccess(data.message || 'Report created successfully.');
      setTimeout(() => navigate('/my-reports'), 700);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to create the report. Please check your inputs and try again.');
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

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {success && <div className="success-banner" role="status">{success}</div>}

        <label>
          Item type
          <select name="itemType" value={form.itemType} onChange={handleChange}>
            <option value="LOST">LOST</option>
            <option value="FOUND">FOUND</option>
          </select>
        </label>

        <label>
          Item title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Set of keys with blue keyring"
            required
          />
        </label>

        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Keys, Electronics, Documents, Bag"
            required
          />
        </label>

        <label>
          Public description
          <textarea
            name="publicDescription"
            value={form.publicDescription}
            onChange={handleChange}
            placeholder="Describe general appearance only. Do NOT include phone numbers, private contact details, or secret identifying marks."
            required
            rows={4}
          />
        </label>

        <p className="panel-copy" style={{ fontSize: '0.9rem', marginTop: '-0.25rem' }}>
          <strong>Privacy notice:</strong> Keep private contact details and secret identifying marks out of public descriptions and photographs.
        </p>

        {form.itemType === 'FOUND' && (
          <label>
            Private identifying details (visible only to you and the administrator)
            <textarea
              name="privateDetails"
              value={form.privateDetails}
              onChange={handleChange}
              placeholder="e.g. Engraving on the back of the keyring, serial number, or contents inside a wallet"
              rows={4}
              required
            />
          </label>
        )}

        <div className="form-row">
          <label>
            Date
            <input
              type="date"
              name="itemDate"
              max={today}
              value={form.itemDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Campus location
            <input
              name="campusLocation"
              value={form.campusLocation}
              onChange={handleChange}
              placeholder="e.g. N5B, Hamu Mukasa Library, Touch of Class"
              required
            />
          </label>
        </div>

        <label>
          Image URL (optional — ensure photo does not reveal secret identifying details)
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </label>

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Save report'}
        </button>
      </form>
    </div>
  );
}
