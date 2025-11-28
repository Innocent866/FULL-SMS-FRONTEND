import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import apiClient from '../../services/apiClient.js';

const initialForm = {
  title: '',
  body: '',
  audience: 'all',
  publishAt: ''
};

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/announcements');
      setAnnouncements(data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotification(null);
    try {
      await apiClient.post('/admin/announcements', { ...form });
      setNotification({ type: 'success', message: 'Announcement created' });
      setForm(initialForm);
      await fetchAnnouncements();
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create announcement';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Communication</p>
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
        </div>
      </div>

      <Card title="New Announcement">
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <label className="text-sm text-gray-700">
            <span className="block mb-1">Details</span>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-softGrey px-4 py-2 text-sm focus:border-sidebar focus:outline-none focus:ring-1 focus:ring-sidebar"
              required
            />
          </label>
          <Input label="Audience" name="audience" value={form.audience} onChange={handleChange} placeholder="e.g. parents, teachers" />
          <Input
            label="Publish At"
            type="datetime-local"
            name="publishAt"
            value={form.publishAt}
            onChange={handleChange}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <Card title="Announcements">
            <p className="text-sm text-gray-500">Loading...</p>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} title={announcement.title}>
              <p className="text-sm text-gray-600 capitalize">{announcement.audience}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {announcement.publishAt ? new Date(announcement.publishAt).toLocaleString() : 'Draft'}
                </span>
                <span className="rounded-full bg-sidebar/10 px-3 py-1 text-sidebar">Active</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncementsPage;

