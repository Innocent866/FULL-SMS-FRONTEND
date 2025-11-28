import { useEffect, useRef, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import apiClient from '../../services/apiClient.js';
import axios from 'axios'

const studentColumns = (handlers) => [
  { Header: 'Name', accessor: 'name' },
  {
    Header: 'Class',
    accessor: 'className',
    Cell: (row) => row.className || row.classLevel || 'Not set'
  },
  { Header: 'Admission No', accessor: 'admissionNumber' },
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
  admissionNumber: '',
  classLevel: '',
  classId: ''
};

const AdminStudentsPage = () => {
  const formRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [busyIds, setBusyIds] = useState({});
  const [editModal, setEditModal] = useState({ open: false, studentId: null });
  const [editForm, setEditForm] = useState(initialForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const token = localStorage.getItem('smsAccessToken')

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/students');
      setStudents(data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load students' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/classes', 
        
        { headers: { Authorization: `Bearer ${token}` } });
      console.log(data);
      
      const options = (data.data ?? []).map((classItem) => ({
        value: classItem._id,
        label: `${classItem.name}${classItem.level ? ` • ${classItem.level}` : ''}${classItem.arm ? ` (${classItem.arm})` : ''}`,
        levelName: classItem.levelId?.name || classItem.level || ''
      }));
      setClassOptions(options);
      console.log(options);
      
    } catch (error) {
      console.error('Unable to load classes', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (event) => {
    const { value } = event.target;
    const selected = classOptions.find((option) => option.value === value);
    setForm((prev) => ({ ...prev, classId: value, classLevel: selected?.levelName || '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotification(null);
    setSubmitting(true);
    try {
      await apiClient.post('/admin/students', form);
      setNotification({ type: 'success', message: 'Student added successfully' });
      setForm(initialForm);
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to add student';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setEditForm({
      id: student.id,
      firstName: student.firstName || student.name?.split(' ')?.[0] || '',
      lastName: student.lastName || student.name?.split(' ')?.slice(1).join(' ') || '',
      email: student.email || '',
      phone: student.phone || '',
      admissionNumber: student.admissionNumber || '',
      classId: student.classId || '',
      classLevel: student.classLevel || '',
      address: student.address || ''
    });
    setEditModal({ open: true, studentId: student.id });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClassChange = (event) => {
    const { value } = event.target;
    const selected = classOptions.find((option) => option.value === value);
    setEditForm((prev) => ({ ...prev, classId: value, classLevel: selected?.levelName || prev.classLevel }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setEditSubmitting(true);
    try {
      await apiClient.put(`/admin/students/${editModal.studentId}`, editForm);
      setNotification({ type: 'success', message: 'Student updated' });
      setEditModal({ open: false, studentId: null });
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update student';
      setNotification({ type: 'error', message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleStatus = async (student) => {
    const nextStatus = student.status === 'suspended' ? 'active' : 'suspended';
    setBusyIds((prev) => ({ ...prev, [student.id]: true }));
    try {
      await apiClient.patch(`/admin/students/${student.id}/status`, { status: nextStatus });
      setNotification({ type: 'success', message: `Student ${nextStatus === 'active' ? 're-activated' : 'suspended'}` });
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update status';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [student.id]: false }));
    }
  };

  const deleteStudent = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name}? This action is permanent.`);
    if (!confirmed) return;
    setBusyIds((prev) => ({ ...prev, [student.id]: true }));
    try {
      await apiClient.delete(`/admin/students/${student.id}`);
      setNotification({ type: 'success', message: 'Student removed' });
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to delete student';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [student.id]: false }));
    }
  };

  const tableColumns = studentColumns({
    onEdit: openEditModal,
    onStatus: toggleStatus,
    onDelete: deleteStudent,
    busyIds
  });

  const classSelectOptions = [{ value: '', label: 'Select class' }, ...classOptions];

  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Community</p>
          <h1 className="text-2xl font-semibold text-gray-900">Student Records</h1>
        </div>
      <Button variant="secondary" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>
        Add Student
      </Button>
      </div>

      <Card title="Add Student" ref={formRef}>
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          <Input type="email" label="Email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Temporary Password" name="password" value={form.password} onChange={handleChange} placeholder="Optional" />
          <Input label="Admission Number" name="admissionNumber" value={form.admissionNumber} onChange={handleChange} required />
          <Select label="Assigned Class" name="classId" value={form.classId} onChange={handleClassChange} options={classSelectOptions} />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Student'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Enrolled Students">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <Table columns={tableColumns} data={students} />}
      </Card>

      <Modal open={editModal.open} title="Edit Student" onClose={() => setEditModal({ open: false, studentId: null })}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitEdit}>
          <Input label="First Name" name="firstName" value={editForm.firstName} onChange={handleEditChange} required />
          <Input label="Last Name" name="lastName" value={editForm.lastName} onChange={handleEditChange} required />
          <Input type="email" label="Email" name="email" value={editForm.email} onChange={handleEditChange} required />
          <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
          <Input label="Admission Number" name="admissionNumber" value={editForm.admissionNumber} onChange={handleEditChange} required />
          <Select label="Assigned Class" name="classId" value={editForm.classId} onChange={handleEditClassChange} options={classSelectOptions} />
          <Input className="md:col-span-2" label="Address" name="address" value={editForm.address || ''} onChange={handleEditChange} placeholder="Residential address" />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, studentId: null })}>
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

export default AdminStudentsPage;

