import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Notification from '../../components/ui/Notification.jsx';
import Modal from '../../components/ui/Modal.jsx';
import apiClient from '../../services/apiClient.js';

const classColumns = (handlers) => [
  { Header: 'Class', accessor: 'name' },
  { Header: 'Level', accessor: 'level' },
  { Header: 'Arm', accessor: 'arm' },
  { Header: 'Session', accessor: 'session' },
  {
    Header: 'Teacher',
    accessor: 'teacher',
    Cell: (row) => {
      const teacherUser = row.homeroomTeacherId?.userId;
      const teacherName = teacherUser ? `${teacherUser.firstName ?? ''} ${teacherUser.lastName ?? ''}`.trim() : null;
      return teacherName || 'Unassigned';
    }
  },
  {
    Header: 'Capacity',
    accessor: 'capacity'
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: (row) => (
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button onClick={() => handlers.onAssign(row)} className="text-sidebar hover:underline">Assign Teacher</button>
        <button onClick={() => handlers.onDelete(row)} className="text-rose-600 hover:underline">Delete</button>
      </div>
    )
  }
];

const initialClassForm = {
  name: '',
  levelId: '',
  armId: '',
  sessionId: '',
  termId: '',
  capacity: 30,
  homeroomTeacherId: ''
};

const initialPromotionForm = {
  targetSessionId: '',
  targetTermId: '',
  dryRun: true
};

const AdminAcademicsPage = () => {
  const [classes, setClasses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [arms, setArms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classForm, setClassForm] = useState(initialClassForm);
  const [levelForm, setLevelForm] = useState({ name: '', order: 0 });
  const [armForm, setArmForm] = useState({ name: '', levelId: '' });
  const [sessionForm, setSessionForm] = useState({ name: '', startDate: '', endDate: '' });
  const [termForm, setTermForm] = useState({ name: '', sessionId: '', startDate: '', endDate: '' });
  const [promotionForm, setPromotionForm] = useState(initialPromotionForm);
  const [notification, setNotification] = useState(null);
  const [assignModal, setAssignModal] = useState({ open: false, classId: null, teacherId: '' });
  const [loading, setLoading] = useState(true);

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const [classRes, levelRes, armRes, sessionRes, termRes, teacherRes] = await Promise.all([
        apiClient.get('/admin/classes'),
        apiClient.get('/admin/structures/levels'),
        apiClient.get('/admin/structures/arms'),
        apiClient.get('/admin/structures/sessions'),
        apiClient.get('/admin/structures/terms'),
        apiClient.get('/admin/teachers')
      ]);
      setClasses(classRes.data.data ?? []);
      setLevels(levelRes.data.data ?? []);
      setArms(armRes.data.data ?? []);
      setSessions(sessionRes.data.data ?? []);
      setTerms(termRes.data.data ?? []);
      setTeachers(teacherRes.data.data ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load academic data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleClassFormChange = (event) => {
    const { name, value } = event.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const createClass = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/admin/classes', classForm);
      setNotification({ type: 'success', message: 'Class created successfully' });
      setClassForm(initialClassForm);
      await fetchStructures();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to create class';
      setNotification({ type: 'error', message });
    }
  };

  const createLevel = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/admin/structures/levels', levelForm);
      setNotification({ type: 'success', message: 'Level added' });
      setLevelForm({ name: '', order: 0 });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to add level' });
    }
  };

  const createArm = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/admin/structures/arms', armForm);
      setNotification({ type: 'success', message: 'Arm added' });
      setArmForm({ name: '', levelId: '' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to add arm' });
    }
  };

  const createSession = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/admin/structures/sessions', sessionForm);
      setNotification({ type: 'success', message: 'Session created' });
      setSessionForm({ name: '', startDate: '', endDate: '' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to create session' });
    }
  };

  const createTerm = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/admin/structures/terms', termForm);
      setNotification({ type: 'success', message: 'Term created' });
      setTermForm({ name: '', sessionId: '', startDate: '', endDate: '' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to create term' });
    }
  };

  const deleteLevel = async (level) => {
    if (!window.confirm(`Delete ${level.name}?`)) return;
    try {
      await apiClient.delete(`/admin/structures/levels/${level._id}`);
      setNotification({ type: 'success', message: 'Level deleted' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to delete level' });
    }
  };

  const deleteArm = async (arm) => {
    if (!window.confirm(`Delete ${arm.name}?`)) return;
    try {
      await apiClient.delete(`/admin/structures/arms/${arm._id}`);
      setNotification({ type: 'success', message: 'Arm deleted' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to delete arm' });
    }
  };

  const deleteClass = async (classItem) => {
    if (!window.confirm(`Delete ${classItem.name}?`)) return;
    try {
      await apiClient.delete(`/admin/classes/${classItem._id}`);
      setNotification({ type: 'success', message: 'Class deleted' });
      await fetchStructures();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to delete class';
      setNotification({ type: 'error', message });
    }
  };

  const assignTeacher = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post(`/admin/classes/${assignModal.classId}/assign-teacher`, {
        teacherId: assignModal.teacherId
      });
      setNotification({ type: 'success', message: 'Class teacher assigned' });
      setAssignModal({ open: false, classId: null, teacherId: '' });
      await fetchStructures();
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to assign teacher' });
    }
  };

  const runPromotion = async (event) => {
    event.preventDefault();
    try {
      const { data } = await apiClient.post('/admin/students/promote', promotionForm);
      setNotification({
        type: promotionForm.dryRun ? 'info' : 'success',
        message: `Promoted ${data.data.promoted} students, ${data.data.skipped} skipped`
      });
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to run promotions';
      setNotification({ type: 'error', message });
    }
  };

  const columns = classColumns({
    onAssign: (row) => setAssignModal({ open: true, classId: row._id, teacherId: row.homeroomTeacherId?._id || '' }),
    onDelete: deleteClass
  });

  const optionsFrom = (items, labelKey = 'name') => [
    { value: '', label: 'Select option' },
    ...items.map((item) => ({ value: item._id, label: item[labelKey] }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Academics</p>
          <h1 className="text-2xl font-semibold text-gray-900">Class & Session Management</h1>
        </div>
      </div>

      {notification && <Notification type={notification.type}>{notification.message}</Notification>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create Class">
          <form className="grid gap-4" onSubmit={createClass}>
            <Input label="Class Name" name="name" value={classForm.name} onChange={handleClassFormChange} required />
            <Select label="Level" name="levelId" value={classForm.levelId} onChange={handleClassFormChange} options={optionsFrom(levels)} />
            <Select label="Arm" name="armId" value={classForm.armId} onChange={handleClassFormChange} options={optionsFrom(arms)} />
            <Select
              label="Session"
              name="sessionId"
              value={classForm.sessionId}
              onChange={handleClassFormChange}
              options={optionsFrom(sessions)}
            />
            <Select label="Term" name="termId" value={classForm.termId} onChange={handleClassFormChange} options={optionsFrom(terms)} />
            <Select
              label="Homeroom Teacher"
              name="homeroomTeacherId"
              value={classForm.homeroomTeacherId}
              onChange={handleClassFormChange}
              options={[{ value: '', label: 'Select teacher' }, ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name }))]}
            />
            <Input type="number" label="Capacity" name="capacity" value={classForm.capacity} onChange={handleClassFormChange} min={10} />
            <div className="flex justify-end">
              <Button type="submit">Save Class</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Add Class Level">
            <form className="grid gap-3" onSubmit={createLevel}>
              <Input label="Name" name="name" value={levelForm.name} onChange={(e) => setLevelForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Input
                type="number"
                label="Order"
                name="order"
                value={levelForm.order}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
              />
              <div className="flex justify-end">
                <Button type="submit">Add Level</Button>
              </div>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {levels.map((level) => (
                <li key={level._id} className="flex items-center justify-between rounded-lg bg-milk px-3 py-2">
                  <span>{level.name}</span>
                  <button onClick={() => deleteLevel(level)} className="text-xs text-rose-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Add Class Arm">
            <form className="grid gap-3" onSubmit={createArm}>
              <Input label="Arm Name" name="name" value={armForm.name} onChange={(e) => setArmForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Select label="Level" name="levelId" value={armForm.levelId} onChange={(e) => setArmForm((prev) => ({ ...prev, levelId: e.target.value }))} options={optionsFrom(levels)} />
              <div className="flex justify-end">
                <Button type="submit">Add Arm</Button>
              </div>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {arms.map((arm) => (
                <li key={arm._id} className="flex items-center justify-between rounded-lg bg-milk px-3 py-2">
                  <span>
                    {arm.name} • {arm.levelId?.name || 'No level'}
                  </span>
                  <button onClick={() => deleteArm(arm)} className="text-xs text-rose-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="School Sessions">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createSession}>
            <Input label="Name" name="name" value={sessionForm.name} onChange={(e) => setSessionForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <Input type="date" label="Start Date" name="startDate" value={sessionForm.startDate} onChange={(e) => setSessionForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            <Input type="date" label="End Date" name="endDate" value={sessionForm.endDate} onChange={(e) => setSessionForm((prev) => ({ ...prev, endDate: e.target.value }))} />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Add Session</Button>
            </div>
          </form>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {sessions.map((session) => (
              <li key={session._id} className="rounded-lg bg-milk px-3 py-2">
                {session.name} • {session.status}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="School Terms">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createTerm}>
            <Input label="Name" name="name" value={termForm.name} onChange={(e) => setTermForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <Select
              label="Session"
              name="sessionId"
              value={termForm.sessionId}
              onChange={(e) => setTermForm((prev) => ({ ...prev, sessionId: e.target.value }))}
              options={optionsFrom(sessions)}
            />
            <Input type="date" label="Start Date" name="startDate" value={termForm.startDate} onChange={(e) => setTermForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            <Input type="date" label="End Date" name="endDate" value={termForm.endDate} onChange={(e) => setTermForm((prev) => ({ ...prev, endDate: e.target.value }))} />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Add Term</Button>
            </div>
          </form>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {terms.map((term) => (
              <li key={term._id} className="rounded-lg bg-milk px-3 py-2">
                {term.name} • {term.sessionId?.name || 'No session'}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Classes Overview">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : <Table columns={columns} data={classes} />}
      </Card>

      <Card title="Advance Students">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={runPromotion}>
          <Select
            label="Next Session"
            name="targetSessionId"
            value={promotionForm.targetSessionId}
            onChange={(e) => setPromotionForm((prev) => ({ ...prev, targetSessionId: e.target.value }))}
            options={optionsFrom(sessions)}
          />
          <Select
            label="Next Term"
            name="targetTermId"
            value={promotionForm.targetTermId}
            onChange={(e) => setPromotionForm((prev) => ({ ...prev, targetTermId: e.target.value }))}
            options={optionsFrom(terms)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={promotionForm.dryRun}
              onChange={(e) => setPromotionForm((prev) => ({ ...prev, dryRun: e.target.checked }))}
            />
            Dry run (preview only)
          </label>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit">{promotionForm.dryRun ? 'Preview Promotion' : 'Promote Students'}</Button>
          </div>
        </form>
      </Card>

      <Modal open={assignModal.open} title="Assign Class Teacher" onClose={() => setAssignModal({ open: false, classId: null, teacherId: '' })}>
        <form className="space-y-4" onSubmit={assignTeacher}>
          <Select
            label="Teacher"
            name="teacherId"
            value={assignModal.teacherId}
            onChange={(e) => setAssignModal((prev) => ({ ...prev, teacherId: e.target.value }))}
            options={[{ value: '', label: 'Select teacher' }, ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name }))]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAssignModal({ open: false, classId: null, teacherId: '' })}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAcademicsPage;

