import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import Modal from '../../components/ui/Modal.jsx';
import apiClient from '../../services/apiClient.js';

const accountColumns = (handlers) => [
  { Header: 'Name', accessor: 'name' },
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
  status: 'active'
};

const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyIds, setBusyIds] = useState({});
  const [editModal, setEditModal] = useState({ open: false, accountId: null });
  const [editForm, setEditForm] = useState(initialForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/accounts');
      setAccounts(data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
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
      await apiClient.post('/admin/accounts', form);
      setNotification({ type: 'success', message: 'Account created' });
      setForm(initialForm);
      await fetchAccounts();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to create account';
      setNotification({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (account) => {
    setEditForm({
      id: account.id,
      firstName: account.firstName || account.name?.split(' ')?.[0] || '',
      lastName: account.lastName || account.name?.split(' ')?.slice(1).join(' ') || '',
      email: account.email || '',
      phone: account.phone || '',
      status: account.status || 'active',
      password: ''
    });
    setEditModal({ open: true, accountId: account.id });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setEditSubmitting(true);
    try {
      await apiClient.put(`/admin/accounts/${editModal.accountId}`, editForm);
      setNotification({ type: 'success', message: 'Account updated' });
      setEditModal({ open: false, accountId: null });
      await fetchAccounts();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update account';
      setNotification({ type: 'error', message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleStatus = async (account) => {
    const nextStatus = account.status === 'suspended' ? 'active' : 'suspended';
    setBusyIds((prev) => ({ ...prev, [account.id]: true }));
    try {
      await apiClient.patch(`/admin/accounts/${account.id}/status`, { status: nextStatus });
      setNotification({ type: 'success', message: `Account ${nextStatus === 'active' ? 're-activated' : 'suspended'}` });
      await fetchAccounts();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update status';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [account.id]: false }));
    }
  };

  const deleteAccount = async (account) => {
    const confirmed = window.confirm(`Delete ${account.name}?`);
    if (!confirmed) return;
    setBusyIds((prev) => ({ ...prev, [account.id]: true }));
    try {
      await apiClient.delete(`/admin/accounts/${account.id}`);
      setNotification({ type: 'success', message: 'Account deleted' });
      await fetchAccounts();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to delete account';
      setNotification({ type: 'error', message });
    } finally {
      setBusyIds((prev) => ({ ...prev, [account.id]: false }));
    }
  };

  const columns = accountColumns({
    onEdit: openEditModal,
    onStatus: toggleStatus,
    onDelete: deleteAccount,
    busyIds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Security</p>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Accounts</h1>
        </div>
      </div>

      <Card title="Create Admin Account">
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          <Input type="email" label="Email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Temporary Password" name="password" value={form.password} onChange={handleChange} required />
          <Input label="Status" name="status" value={form.status} onChange={handleChange} />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Active Accounts">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <Table columns={columns} data={accounts} />}
      </Card>

      <Modal open={editModal.open} title="Edit Account" onClose={() => setEditModal({ open: false, accountId: null })}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitEdit}>
          <Input label="First Name" name="firstName" value={editForm.firstName} onChange={handleEditChange} required />
          <Input label="Last Name" name="lastName" value={editForm.lastName} onChange={handleEditChange} required />
          <Input type="email" label="Email" name="email" value={editForm.email} onChange={handleEditChange} required />
          <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
          <Input label="Status" name="status" value={editForm.status} onChange={handleEditChange} />
          <Input label="Reset Password" name="password" value={editForm.password} onChange={handleEditChange} placeholder="Leave blank to keep" />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, accountId: null })}>
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

export default AdminAccountsPage;

