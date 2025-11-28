import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import Modal from '../../components/ui/Modal.jsx';
import apiClient from '../../services/apiClient.js';

const teacherColumns = (handlers) => [
  { Header: 'Name', accessor: 'name' },
  { Header: 'Subjects', accessor: 'specialization' },
  { Header: 'Email', accessor: 'email' },
  { Header: 'Phone', accessor: 'phone' },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: (row) => (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {row.status}
      </span>
    )
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: (row) => (
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button onClick={() => handlers.onEdit(row)} className="text-sidebar hover:underline">Edit</button>
        <button
          onClick={() => handlers.onStatus(row)}
          disabled={handlers.busyIds[row.id]}
          className="text-amber-600 hover:underline disabled:text-gray-400"
        >
          {row.status === 'suspended' ? 'Activate' : 'Suspend'}
        </button>
        <button
          onClick={() => handlers.onDelete(row)}
          disabled={handlers.busyIds[row.id]}
          className="text-rose-600 hover:underline disabled:text-gray-400"
        >
          Delete
        </button>
      </div>
    )
  }
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  staffNo: '',
  specialization: 'Mathematics',
  qualifications: ''
};

const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [busyIds, setBusyIds] = useState({});
  const [editModal, setEditModal] = useState({ open: false, teacherId: null });
  const [editForm, setEditForm] = useState(initialForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/teachers');
      setTeachers(data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load teachers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
      await apiClient.post('/admin/teachers', {
        ...form,
        specialization: form.specialization
      });
      setNotification({ type: 'success', message: 'Teacher added successfully' });
      setForm(initialForm);
      await fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to add teacher';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    setEditForm({
      id: teacher.id,
      firstName: teacher.firstName || teacher.name?.split(' ')?.[0] || '',
      lastName: teacher.lastName || teacher.name?.split(' ')?.slice(1).join(' ') || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      staffNo: teacher.staffNo || '',
      specialization: teacher.specializationList?.join(', ') || teacher.specialization || '',
      qualifications: teacher.qualifications || ''
    });
    setEditModal({ open: true, teacherId: teacher.id });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setEditSubmitting(true);
    try {
      await apiClient.put(`/admin/teachers/${editModal.teacherId}`, editForm);
      setNotification({ type: 'success', message: 'Teacher updated' });
      setEditModal({ open: false, teacherId: null });
      await fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update teacher';
      setNotification({ type: 'error', message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleStatus = async (teacher) => {
    const nextStatus = teacher.status === 'suspended' ? 'active' : 'suspended';
    setBusyIds((prev) => ({ ...prev, [teacher.id]: true }));
    try {
      await apiClient.patch(`/admin/teachers/${teacher.id}/status`, { status: nextStatus });
      setNotification({ type: 'success', message: `Teacher ${nextStatus === 'active' ? 're-activated' : 'suspended'}` });
      await fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update status';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [teacher.id]: false }));
    }
  };

  const deleteTeacher = async (teacher) => {
    const confirmed = window.confirm(`Delete ${teacher.name}? This action is permanent.`);
    if (!confirmed) return;
    setBusyIds((prev) => ({ ...prev, [teacher.id]: true }));
    try {
      await apiClient.delete(`/admin/teachers/${teacher.id}`);
      setNotification({ type: 'success', message: 'Teacher removed' });
      await fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to delete teacher';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [teacher.id]: false }));
    }
  };

  const columns = teacherColumns({
    onEdit: openEditModal,
    onStatus: toggleStatus,
    onDelete: deleteTeacher,
    busyIds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Academics</p>
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Management</h1>
        </div>
      </div>

      <Card title="Add Teacher">
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          <Input type="email" label="Email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Temporary Password" name="password" value={form.password} onChange={handleChange} placeholder="Optional" />
          <Input label="Staff Number" name="staffNo" value={form.staffNo} onChange={handleChange} />
          <Input label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
          <Input label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Teacher'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Directory">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <Table columns={columns} data={teachers} />}
      </Card>

      <Modal open={editModal.open} title="Edit Teacher" onClose={() => setEditModal({ open: false, teacherId: null })}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitEdit}>
          <Input label="First Name" name="firstName" value={editForm.firstName} onChange={handleEditChange} required />
          <Input label="Last Name" name="lastName" value={editForm.lastName} onChange={handleEditChange} required />
          <Input type="email" label="Email" name="email" value={editForm.email} onChange={handleEditChange} required />
          <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
          <Input label="Staff Number" name="staffNo" value={editForm.staffNo} onChange={handleEditChange} />
          <Input
            label="Specialization (comma separated)"
            name="specialization"
            value={editForm.specialization}
            onChange={handleEditChange}
            containerClassName="md:col-span-2"
          />
          <Input
            label="Qualifications"
            name="qualifications"
            value={editForm.qualifications}
            onChange={handleEditChange}
            containerClassName="md:col-span-2"
          />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, teacherId: null })}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSubmitting}>
              {editSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTeachersPage;

