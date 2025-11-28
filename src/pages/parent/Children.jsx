import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import apiClient from '../../services/apiClient.js';

const getChildName = (child) => {
  if (!child) return '';
  const first = child.userId?.firstName ?? child.firstName ?? '';
  const last = child.userId?.lastName ?? child.lastName ?? '';
  return `${first} ${last}`.trim() || child.name || child.admissionNumber || 'Child';
};

const getTeacherName = (child) => {
  const teacherUser = child?.classId?.homeroomTeacherId?.userId;
  if (!teacherUser) return 'Not assigned';
  return `${teacherUser.firstName ?? ''} ${teacherUser.lastName ?? ''}`.trim();
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Not available');

const ParentChildrenPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [linkForm, setLinkForm] = useState({ admissionNumber: '', dateOfBirth: '' });

  const selectedChild = useMemo(
    () => children.find((child) => child._id === selectedChildId),
    [children, selectedChildId]
  );

  const fetchChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/parent/children');
      const records = res.data.data ?? [];
      setChildren(records);
      if (!selectedChildId && records.length) {
        setSelectedChildId(records[0]._id);
      } else if (records.length === 0) {
        setSelectedChildId('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load children');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLinkSubmit = async (event) => {
    event.preventDefault();
    if (!linkForm.admissionNumber.trim()) return;
    setLinking(true);
    setFeedback('');
    setError('');
    try {
      const payload = {
        admissionNumber: linkForm.admissionNumber.trim(),
        dateOfBirth: linkForm.dateOfBirth || undefined
      };
      const res = await apiClient.post('/parent/children/link', payload);
      const linkedChild = res.data.data;
      setFeedback('Child linked successfully.');
      setLinkForm({ admissionNumber: '', dateOfBirth: '' });
      await fetchChildren();
      if (linkedChild?._id) {
        setSelectedChildId(linkedChild._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to link child. Please verify the details and try again.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Linked Children" className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading children...</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-gray-500">No children linked yet. Use the form to add a child.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child) => {
                const isSelected = selectedChildId === child._id;
                return (
                  <div
                    key={child._id}
                    className={`rounded-2xl border p-4 transition ${
                      isSelected ? 'border-sidebar bg-sidebar/5' : 'border-softGrey hover:border-sidebar/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{getChildName(child)}</p>
                        <p className="text-sm text-gray-500">{child.classId?.name || 'Class not assigned'}</p>
                      </div>
                      <Button
                        variant={isSelected ? 'secondary' : 'primary'}
                        size="md"
                        onClick={() => setSelectedChildId(child._id)}
                      >
                        {isSelected ? 'Selected' : 'View profile'}
                      </Button>
                    </div>
                    <dl className="mt-3 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <dt>Admission No.</dt>
                        <dd>{child.admissionNumber || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Homeroom</dt>
                        <dd>{getTeacherName(child)}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card title="Link a Child">
          <form className="space-y-4" onSubmit={handleLinkSubmit}>
            <Input
              label="Admission Number"
              placeholder="e.g. STD/2023/001"
              value={linkForm.admissionNumber}
              onChange={(e) => setLinkForm((prev) => ({ ...prev, admissionNumber: e.target.value }))}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={linkForm.dateOfBirth}
              onChange={(e) => setLinkForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
            />
            <Button type="submit" size="lg" className="w-full" disabled={linking}>
              {linking ? 'Linking child...' : 'Link Child'}
            </Button>
            {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </Card>
      </div>

      <Card title="Child Profile">
        {selectedChild ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={selectedChild.userId?.avatarUrl || 'https://i.pravatar.cc/80'}
                alt={getChildName(selectedChild)}
                className="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h4 className="text-2xl font-semibold text-gray-900">{getChildName(selectedChild)}</h4>
                <p className="text-sm text-gray-600">Admission No: {selectedChild.admissionNumber || '—'}</p>
                <p className="text-sm text-gray-600">Homeroom Teacher: {getTeacherName(selectedChild)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-softGrey/60 p-4">
                <p className="text-xs uppercase text-gray-500">Class</p>
                <p className="text-lg font-semibold text-gray-900">{selectedChild.classId?.name || 'Not assigned'}</p>
                <p className="text-sm text-gray-600">
                  Session: {selectedChild.classId?.session || '—'} · Term: {selectedChild.classId?.term || '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-softGrey/60 p-4">
                <p className="text-xs uppercase text-gray-500">Contact</p>
                <p className="text-sm text-gray-700">{selectedChild.userId?.email || 'No email on file'}</p>
                <p className="text-sm text-gray-700">{selectedChild.userId?.phone || 'No phone on file'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-softGrey/60 p-4">
                <p className="text-xs uppercase text-gray-500">Gender</p>
                <p className="text-base text-gray-900 capitalize">{selectedChild.gender || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl border border-dashed border-softGrey/60 p-4">
                <p className="text-xs uppercase text-gray-500">Date of Birth</p>
                <p className="text-base text-gray-900">{formatDate(selectedChild.dateOfBirth)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a child to view their profile information.</p>
        )}
      </Card>
    </div>
  );
};

export default ParentChildrenPage;

