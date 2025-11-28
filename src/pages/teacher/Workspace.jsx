import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Notification from '../../components/ui/Notification.jsx';
import apiClient from '../../services/apiClient.js';

const attendanceOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' }
];

const initialNoteForm = {
  title: '',
  classId: '',
  subjectId: '',
  week: '',
  objectives: '',
  content: '',
  fileUrl: ''
};

const initialMaterialForm = {
  title: '',
  description: '',
  fileUrl: '',
  fileType: '',
  classId: '',
  subjectId: ''
};

const initialNotificationForm = {
  title: '',
  body: '',
  classId: '',
  category: 'class-notice'
};

const TeacherWorkspace = () => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [scheduleUpdates, setScheduleUpdates] = useState([]);
  const [lessonNotes, setLessonNotes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [teachingTimetable, setTeachingTimetable] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceEntries, setAttendanceEntries] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceEdits, setAttendanceEdits] = useState({});
  const [scoreEntries, setScoreEntries] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [performance, setPerformance] = useState([]);
  const [noteForm, setNoteForm] = useState(initialNoteForm);
  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm);
  const [workspaceMessage, setWorkspaceMessage] = useState(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const classOptions = useMemo(
    () => [{ value: '', label: 'Select class' }, ...classes.map((cls) => ({ value: cls._id, label: cls.name || cls.className }))],
    [classes]
  );

  const subjectOptions = useMemo(
    () => [{ value: '', label: 'Select subject' }, ...subjects.map((subject) => ({ value: subject._id, label: subject.name }))],
    [subjects]
  );

  const fetchWorkspace = async () => {
    try {
      setLoadingWorkspace(true);
      setWorkspaceMessage(null);
      const [
        profileRes,
        classRes,
        subjectRes,
        announcementsRes,
        updatesRes,
        notesRes,
        materialsRes,
        timetableRes,
        examTimetableRes
      ] = await Promise.all([
        apiClient.get('/teacher/profile'),
        apiClient.get('/teacher/classes'),
        apiClient.get('/teacher/subjects'),
        apiClient.get('/teacher/announcements'),
        apiClient.get('/teacher/schedule/updates'),
        apiClient.get('/teacher/lesson-notes'),
        apiClient.get('/teacher/materials'),
        apiClient.get('/teacher/timetable'),
        apiClient.get('/teacher/timetable/exams')
      ]);

      setProfile(profileRes.data.data);
      setProfileForm({
        firstName: profileRes.data.data?.user?.firstName || '',
        lastName: profileRes.data.data?.user?.lastName || '',
        phone: profileRes.data.data?.user?.phone || '',
        avatarUrl: profileRes.data.data?.user?.avatarUrl || ''
      });
      setClasses(classRes.data.data ?? []);
      setSubjects(subjectRes.data.data ?? []);
      setAnnouncements(announcementsRes.data.data ?? []);
      setScheduleUpdates(updatesRes.data.data ?? []);
      setLessonNotes(notesRes.data.data ?? []);
      setMaterials(materialsRes.data.data ?? []);
      setTeachingTimetable(timetableRes.data.data ?? []);
      setExamTimetable(examTimetableRes.data.data ?? []);

      const initialClass = classRes.data.data?.[0]?._id;
      if (initialClass) {
        setSelectedClassId(initialClass);
        setNoteForm((prev) => ({ ...prev, classId: initialClass }));
        setMaterialForm((prev) => ({ ...prev, classId: initialClass }));
        setNotificationForm((prev) => ({ ...prev, classId: initialClass }));
        await fetchClassSpecificData(initialClass);
      }
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: 'Unable to load workspace data.' });
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const fetchClassSpecificData = async (classId) => {
    if (!classId) return;
    try {
      const [studentsRes, attendanceRes, performanceRes] = await Promise.all([
        apiClient.get(`/teacher/classes/${classId}/students`),
        apiClient.get('/teacher/attendance/history', { params: { classId } }),
        apiClient.get('/teacher/performance', { params: { classId } })
      ]);
      const roster = studentsRes.data.data ?? [];
      setStudents(roster);
      setAttendanceHistory(attendanceRes.data.data ?? []);
      const historyDefaults = {};
      (attendanceRes.data.data ?? []).forEach((record) => {
        historyDefaults[record._id] = record.status;
      });
      setAttendanceEdits(historyDefaults);
      setPerformance(performanceRes.data.data ?? []);

      const defaultAttendance = {};
      const defaultScores = {};
      roster.forEach((student) => {
        defaultAttendance[student.id] = 'present';
        defaultScores[student.id] = { CA1: 0, CA2: 0, assignment: 0, project: 0, exam: 0, teacherComment: '' };
      });
      setAttendanceEntries(defaultAttendance);
      setScoreEntries(defaultScores);
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: 'Unable to load class details.' });
    }
  };

  const updateAttendanceRecord = async (attendanceId) => {
    try {
      await apiClient.patch(`/teacher/attendance/${attendanceId}`, { status: attendanceEdits[attendanceId] });
      setWorkspaceMessage({ type: 'success', message: 'Attendance updated.' });
      await fetchClassSpecificData(selectedClassId);
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to update attendance record.' });
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassSpecificData(selectedClassId);
      setNoteForm((prev) => ({ ...prev, classId: selectedClassId }));
      setMaterialForm((prev) => ({ ...prev, classId: selectedClassId }));
      setNotificationForm((prev) => ({ ...prev, classId: selectedClassId }));
    }
  }, [selectedClassId]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiClient.patch('/teacher/profile', profileForm);
      setWorkspaceMessage({ type: 'success', message: 'Profile updated successfully.' });
      await fetchWorkspace();
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to update profile.' });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setWorkspaceMessage({ type: 'error', message: 'Enter both current and new passwords.' });
      return;
    }
    try {
      await apiClient.patch('/teacher/profile/password', passwordForm);
      setWorkspaceMessage({ type: 'success', message: 'Password updated.' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to update password.' });
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceEntries((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedClassId) return;
    const entries = Object.entries(attendanceEntries).map(([studentId, status]) => ({
      studentId,
      status,
      remarks: ''
    }));
    try {
      setSubmitting(true);
      await apiClient.post('/teacher/attendance', {
        classId: selectedClassId,
        date: attendanceDate,
        entries
      });
      setWorkspaceMessage({ type: 'success', message: 'Attendance saved.' });
      await fetchClassSpecificData(selectedClassId);
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to save attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreChange = (studentId, field, value) => {
    setScoreEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: field === 'teacherComment' ? value : Number(value) }
    }));
  };

  const submitScores = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      setWorkspaceMessage({ type: 'error', message: 'Select a class and subject.' });
      return;
    }
    const scores = Object.entries(scoreEntries).map(([studentId, scores]) => ({
      studentId,
      ...scores
    }));
    try {
      setSubmitting(true);
      await apiClient.post('/teacher/scores', {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        term: 'First',
        session: '2024/2025',
        scores
      });
      setWorkspaceMessage({ type: 'success', message: 'Scores uploaded.' });
      await fetchClassSpecificData(selectedClassId);
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to upload scores.' });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadResults = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      setWorkspaceMessage({ type: 'error', message: 'Select class and subject to download results.' });
      return;
    }
    try {
      const response = await apiClient.get('/teacher/scores/export', {
        params: {
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          term: 'First',
          session: '2024/2025'
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${selectedClassId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: 'Unable to download result sheet.' });
    }
  };

  const handleNoteChange = (event) => {
    const { name, value } = event.target;
    setNoteForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitLessonNote = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/teacher/lesson-notes', noteForm);
      setWorkspaceMessage({ type: 'success', message: 'Lesson note submitted for approval.' });
      setNoteForm({ ...initialNoteForm, classId: selectedClassId || '' });
      await fetchWorkspace();
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to upload lesson note.' });
    }
  };

  const handleMaterialChange = (event) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitMaterial = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/teacher/materials', materialForm);
      setWorkspaceMessage({ type: 'success', message: 'Class material uploaded.' });
      setMaterialForm({ ...initialMaterialForm, classId: selectedClassId || '' });
      await fetchWorkspace();
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to upload material.' });
    }
  };

  const handleNotificationChange = (event) => {
    const { name, value } = event.target;
    setNotificationForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitNotification = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('/teacher/classes/notify', notificationForm);
      setWorkspaceMessage({ type: 'success', message: 'Class notified successfully.' });
      setNotificationForm({ ...initialNotificationForm, classId: selectedClassId || '' });
      await fetchWorkspace();
    } catch (error) {
      setWorkspaceMessage({ type: 'error', message: error.response?.data?.error || 'Unable to notify class.' });
    }
  };

  if (loadingWorkspace) {
    return <p className="text-sm text-gray-500">Loading workspace...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Teacher Center</p>
          <h1 className="text-2xl font-semibold text-gray-900">Professional Workspace</h1>
        </div>
        <Select label="" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} options={classOptions} />
      </div>

      {workspaceMessage && <Notification type={workspaceMessage.type}>{workspaceMessage.message}</Notification>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Update Profile">
          <form className="grid gap-4" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First Name" name="firstName" value={profileForm.firstName || ''} onChange={handleProfileChange} required />
              <Input label="Last Name" name="lastName" value={profileForm.lastName || ''} onChange={handleProfileChange} required />
              <Input label="Phone" name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} />
              <Input label="Avatar URL" name="avatarUrl" value={profileForm.avatarUrl || ''} onChange={handleProfileChange} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </Card>

        <Card title="Change Password">
          <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
            <Input
              type="password"
              label="Current Password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              type="password"
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card title="Class Students & Attendance">
        <div className="grid gap-4 md:grid-cols-4">
          <Input type="date" label="Attendance Date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
        </div>
        <div className="mt-4 space-y-3">
          {students.map((student) => (
            <div key={student.id} className="grid gap-4 rounded-xl border border-softGrey px-4 py-3 md:grid-cols-3">
              <div>
                <p className="font-semibold text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-500">
                  {student.gender || '—'} • {student.parents?.[0]?.phone || 'No guardian listed'}
                </p>
              </div>
              <Select
                label="Status"
                value={attendanceEntries[student.id] || 'present'}
                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                options={attendanceOptions}
              />
              <div className="text-sm text-gray-500">
                DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}
                <br />
                Admission: {student.admissionNumber || '—'}
              </div>
            </div>
          ))}
          {!students.length && <p className="text-sm text-gray-500">No students available for the selected class.</p>}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={submitAttendance} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </Card>

      <Card title="Scores & Performance">
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Subject" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} options={subjectOptions} />
        </div>
        <div className="mt-4 space-y-4">
          {students.map((student) => (
            <div key={`scores-${student.id}`} className="grid gap-3 rounded-xl border border-softGrey px-4 py-3 md:grid-cols-6">
              <p className="text-sm font-semibold md:col-span-2">{student.name}</p>
              {['CA1', 'CA2', 'assignment', 'project', 'exam'].map((field) => (
                <Input
                  key={`${student.id}-${field}`}
                  type="number"
                  label={field.toUpperCase()}
                  value={scoreEntries[student.id]?.[field] ?? 0}
                  onChange={(e) => handleScoreChange(student.id, field, e.target.value)}
                />
              ))}
              <Input
                label="Remark"
                value={scoreEntries[student.id]?.teacherComment ?? ''}
                onChange={(e) => handleScoreChange(student.id, 'teacherComment', e.target.value)}
                containerClassName="md:col-span-6"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={submitScores} disabled={submitting}>
            {submitting ? 'Saving...' : 'Upload Scores'}
          </Button>
          <Button variant="secondary" onClick={downloadResults}>
            Download Result Sheet
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Performance Tracker</h3>
          <Table
            columns={[
              { Header: 'Student', accessor: 'name' },
              { Header: 'Average', accessor: 'average' },
              { Header: 'Gender', accessor: 'gender' }
            ]}
            data={performance}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Lesson Notes">
          <form className="space-y-3" onSubmit={submitLessonNote}>
            <Input label="Title" name="title" value={noteForm.title} onChange={handleNoteChange} required />
            <Select label="Class" name="classId" value={noteForm.classId} onChange={handleNoteChange} options={classOptions} required />
            <Select label="Subject" name="subjectId" value={noteForm.subjectId} onChange={handleNoteChange} options={subjectOptions} required />
            <Input label="Week" name="week" value={noteForm.week} onChange={handleNoteChange} />
            <Input label="Objectives" name="objectives" value={noteForm.objectives} onChange={handleNoteChange} />
            <Input label="Lesson Content" name="content" value={noteForm.content} onChange={handleNoteChange} />
            <Input label="File URL" name="fileUrl" value={noteForm.fileUrl} onChange={handleNoteChange} placeholder="Link to PDF or document" />
            <div className="flex justify-end">
              <Button type="submit">Submit Note</Button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {lessonNotes.map((note) => (
              <div key={note._id} className="rounded-xl border border-softGrey px-4 py-3">
                <p className="font-semibold">{note.title}</p>
                <p className="text-sm text-gray-500">
                  {note.classId?.name} • {note.subjectId?.name}
                </p>
                <span className="text-xs uppercase text-gray-600">{note.status}</span>
              </div>
            ))}
            {!lessonNotes.length && <p className="text-sm text-gray-500">No lesson notes uploaded.</p>}
          </div>
        </Card>

        <Card title="Class Materials">
          <form className="space-y-3" onSubmit={submitMaterial}>
            <Input label="Title" name="title" value={materialForm.title} onChange={handleMaterialChange} required />
            <Select label="Class" name="classId" value={materialForm.classId} onChange={handleMaterialChange} options={classOptions} required />
            <Select label="Subject" name="subjectId" value={materialForm.subjectId} onChange={handleMaterialChange} options={subjectOptions} />
            <Input label="Description" name="description" value={materialForm.description} onChange={handleMaterialChange} />
            <Input label="File URL" name="fileUrl" value={materialForm.fileUrl} onChange={handleMaterialChange} required />
            <Input label="File Type" name="fileType" value={materialForm.fileType} onChange={handleMaterialChange} placeholder="PDF, PPT, Video" />
            <div className="flex justify-end">
              <Button type="submit">Upload Material</Button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {materials.map((material) => (
              <div key={material._id} className="rounded-xl border border-softGrey px-4 py-3">
                <p className="font-semibold">{material.title}</p>
                <a href={material.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-sidebar underline">
                  {material.fileType || 'Resource'}
                </a>
              </div>
            ))}
            {!materials.length && <p className="text-sm text-gray-500">No materials uploaded yet.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Timetable">
          {teachingTimetable.map((item) => (
            <div key={item._id} className="mb-3 rounded-xl border border-softGrey px-4 py-3">
              <p className="font-semibold">{item.className}</p>
              <p className="text-sm text-gray-500">{item.term}</p>
              <ul className="mt-2 text-sm text-gray-600">
                {item.entries?.map((entry, index) => (
                  <li key={`${item._id}-${index}`}>
                    {entry.day} • {entry.period} • {entry.subject} ({entry.teacherName || 'You'})
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!teachingTimetable.length && <p className="text-sm text-gray-500">No timetable published.</p>}
        </Card>

        <Card title="Exam Timetable">
          {examTimetable.map((item) => (
            <div key={item._id} className="mb-3 rounded-xl border border-softGrey px-4 py-3">
              <p className="font-semibold">{item.title}</p>
              <ul className="mt-2 text-sm text-gray-600">
                {item.entries?.map((entry, index) => (
                  <li key={`${item._id}-exam-${index}`}>
                    {entry.subjectName} • {entry.date ? new Date(entry.date).toLocaleDateString() : 'TBD'} • {entry.startTime} - {entry.endTime}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!examTimetable.length && <p className="text-sm text-gray-500">No exam timetable available.</p>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Class Notifications">
          <form className="space-y-3" onSubmit={submitNotification}>
            <Select label="Class" name="classId" value={notificationForm.classId} onChange={handleNotificationChange} options={classOptions} required />
            <Input label="Title" name="title" value={notificationForm.title} onChange={handleNotificationChange} required />
            <Input label="Message" name="body" value={notificationForm.body} onChange={handleNotificationChange} required />
            <div className="flex justify-end">
              <Button type="submit">Send Notice</Button>
            </div>
          </form>
        </Card>

        <Card title="Announcements & Updates">
          <h4 className="text-sm font-semibold uppercase text-gray-500">Announcements</h4>
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="rounded-xl border border-softGrey px-4 py-3">
                <p className="font-semibold">{announcement.title}</p>
                <p className="text-sm text-gray-500">{announcement.body}</p>
              </div>
            ))}
            {!announcements.length && <p className="text-sm text-gray-500">No announcements yet.</p>}
          </div>
          <h4 className="mt-4 text-sm font-semibold uppercase text-gray-500">Schedule Updates</h4>
          <div className="space-y-2">
            {scheduleUpdates.map((update) => (
              <div key={update._id} className="rounded-xl border border-dashed border-softGrey px-4 py-3">
                <p className="font-semibold">{update.title}</p>
                <p className="text-sm text-gray-500">{update.body}</p>
              </div>
            ))}
            {!scheduleUpdates.length && <p className="text-sm text-gray-500">No schedule changes.</p>}
          </div>
        </Card>
      </div>

      <Card title="Attendance History & Edits">
        <div className="space-y-3">
          {attendanceHistory.map((record) => (
            <div key={record._id} className="grid gap-3 rounded-xl border border-softGrey px-4 py-3 md:grid-cols-4">
              <div>
                <p className="font-semibold">
                  {record.studentId?.userId
                    ? `${record.studentId.userId.firstName ?? ''} ${record.studentId.userId.lastName ?? ''}`.trim()
                    : record.studentId?.admissionNumber || 'Student'}
                </p>
                <p className="text-sm text-gray-500">{record.date ? new Date(record.date).toLocaleDateString() : '—'}</p>
              </div>
              <Select
                label="Status"
                value={attendanceEdits[record._id] || record.status}
                onChange={(e) => setAttendanceEdits((prev) => ({ ...prev, [record._id]: e.target.value }))}
                options={attendanceOptions}
              />
              <div className="flex items-end">
                <Button type="button" variant="secondary" onClick={() => updateAttendanceRecord(record._id)}>
                  Save
                </Button>
              </div>
            </div>
          ))}
          {!attendanceHistory.length && <p className="text-sm text-gray-500">No attendance history for this class.</p>}
        </div>
      </Card>
    </div>
  );
};

export default TeacherWorkspace;

