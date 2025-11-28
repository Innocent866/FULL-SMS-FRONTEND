import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import Modal from '../../components/ui/Modal.jsx';
import apiClient from '../../services/apiClient.js';

const subjectColumns = (handlers) => [
  { Header: 'Code', accessor: 'code' },
  { Header: 'Subject', accessor: 'name' },
  { Header: 'Level', accessor: 'classLevel' },
  {
    Header: 'Teachers',
    accessor: 'teachers',
    Cell: (row) => row.teacherNames || 'Unassigned'
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: (row) => (
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button onClick={() => handlers.onEdit(row)} className="text-sidebar hover:underline">Edit</button>
        <button onClick={() => handlers.onDelete(row)} className="text-rose-600 hover:underline">Delete</button>
      </div>
    )
  }
];

const initialForm = {
  code: '',
  name: '',
  classLevel: '',
  creditUnits: 1,
  description: '',
  teacherIds: []
};

const TeacherSelector = ({ selected = [], onToggle, teachers = [] }) => (
  <div className="flex flex-wrap gap-2">
    {teachers.map((teacher) => (
      <label key={teacher.id} className="flex items-center gap-2 rounded-full border border-softGrey px-3 py-1 text-xs text-gray-600">
        <input type="checkbox" checked={selected.includes(teacher.id)} onChange={() => onToggle(teacher.id)} />
        {teacher.name}
      </label>
    ))}
    {teachers.length === 0 && <p className="text-xs text-gray-500">No teachers available</p>}
  </div>
);

const AdminSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, subjectId: null });
  const [editForm, setEditForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectRes, teacherRes] = await Promise.all([apiClient.get('/admin/subjects'), apiClient.get('/admin/teachers')]);
      const mappedSubjects = (subjectRes.data.data ?? []).map((subject) => ({
        ...subject,
        teacherNames:
          subject.teacherIds?.length > 0
            ? subject.teacherIds
                .map((teacher) => {
                  const user = teacher.userId;
                  return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
                })
                .join(', ')
            : ''
      }));
      setSubjects(mappedSubjects);
      setTeachers(teacherRes.data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load subjects' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTeacher = (teacherId) => {
    setForm((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.includes(teacherId)
        ? prev.teacherIds.filter((id) => id !== teacherId)
        : [...prev.teacherIds, teacherId]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotification(null);
    try {
      await apiClient.post('/admin/subjects', form);
      setNotification({ type: 'success', message: 'Subject created' });
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to create subject';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (subject) => {
    setEditForm({
      code: subject.code || '',
      name: subject.name || '',
      classLevel: subject.classLevel || '',
      creditUnits: subject.creditUnits || 1,
      description: subject.description || '',
      teacherIds: subject.teacherIds?.map((teacher) => teacher._id || teacher.id) || []
    });
    setEditModal({ open: true, subjectId: subject._id });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEditTeacher = (teacherId) => {
    setEditForm((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.includes(teacherId)
        ? prev.teacherIds.filter((id) => id !== teacherId)
        : [...prev.teacherIds, teacherId]
    }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    try {
      await apiClient.put(`/admin/subjects/${editModal.subjectId}`, editForm);
      await apiClient.post(`/admin/subjects/${editModal.subjectId}/teachers`, { teacherIds: editForm.teacherIds });
      setNotification({ type: 'success', message: 'Subject updated' });
      setEditModal({ open: false, subjectId: null });
      await fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update subject';
      setNotification({ type: 'error', message });
    }
  };

  const deleteSubject = async (subject) => {
    if (!window.confirm(`Delete ${subject.name}?`)) return;
    try {
      await apiClient.delete(`/admin/subjects/${subject._id}`);
      setNotification({ type: 'success', message: 'Subject removed' });
      await fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to delete subject';
      setNotification({ type: 'error', message });
    }
  };

  const columns = subjectColumns({
    onEdit: openEditModal,
    onDelete: deleteSubject
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Academics</p>
          <h1 className="text-2xl font-semibold text-gray-900">Subjects & Teachers</h1>
        </div>
      </div>

      {notification && <Notification type={notification.type}>{notification.message}</Notification>}

      <Card title="Add Subject">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="Code" name="code" value={form.code} onChange={handleChange} required />
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Class Level" name="classLevel" value={form.classLevel} onChange={handleChange} placeholder="e.g. JSS 2" required />
          <Input
            type="number"
            label="Credit Units"
            name="creditUnits"
            value={form.creditUnits}
            min={1}
            onChange={handleChange}
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            containerClassName="md:col-span-3"
            placeholder="Optional notes"
          />
          <div className="md:col-span-3">
            <p className="text-sm font-medium text-gray-700">Subject Teachers</p>
            <TeacherSelector selected={form.teacherIds} onToggle={toggleTeacher} teachers={teachers} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Subject'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Subject Catalogue">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <Table columns={columns} data={subjects} />}
      </Card>

      <Modal open={editModal.open} title="Edit Subject" onClose={() => setEditModal({ open: false, subjectId: null })}>
        <form className="grid gap-4" onSubmit={submitEdit}>
          <Input label="Code" name="code" value={editForm.code} onChange={handleEditChange} required />
          <Input label="Name" name="name" value={editForm.name} onChange={handleEditChange} required />
          <Input label="Class Level" name="classLevel" value={editForm.classLevel} onChange={handleEditChange} required />
          <Input type="number" label="Credit Units" name="creditUnits" value={editForm.creditUnits} onChange={handleEditChange} />
          <Input label="Description" name="description" value={editForm.description} onChange={handleEditChange} />
          <div>
            <p className="text-sm font-medium text-gray-700">Subject Teachers</p>
            <TeacherSelector selected={editForm.teacherIds} onToggle={toggleEditTeacher} teachers={teachers} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, subjectId: null })}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSubjectsPage;

