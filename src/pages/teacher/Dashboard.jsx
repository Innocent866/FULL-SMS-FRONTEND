import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Notification from '../../components/ui/Notification.jsx';
// import apiClient from '../../services/apiClient.js';
import axios from 'axios';

const TeacherDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('smsAccessToken')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const { data } = await axios.get(
          'https://full-sms-backend.onrender.com/api/teacher/dashboard',
          { headers: { Authorization: `Bearer ${token}` } },
          // { withCredentials: true } 
          // include cookies for auth
        );
  
        setSummary(data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err.response || err);
        setError('Unable to load dashboard at the moment.');
      } finally {
        setLoading(false);
      }
    };
  
    loadDashboard();
  }, []);
  

  if (loading) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <Notification type="error">{error}</Notification>;
  }

  const rosterColumns = [
    { Header: 'Class', accessor: 'name', Cell: (row) => row.name || row.className },
    { Header: 'Level', accessor: 'level', Cell: (row) => row.levelId?.name || row.level || '—' },
    { Header: 'Session', accessor: 'session', Cell: (row) => row.sessionId?.name || row.session || '—' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Assigned Classes">
          <p className="text-3xl font-bold">{summary?.stats?.classCount ?? 0}</p>
        </Card>
        <Card title="Subjects">
          <p className="text-3xl font-bold">{summary?.stats?.subjectCount ?? 0}</p>
        </Card>
        <Card title="Unread Notices">
          <p className="text-3xl font-bold">{summary?.stats?.announcements ?? 0}</p>
        </Card>
      </div>

      <Card title="Classes Overview">
        <Table columns={rosterColumns} data={summary?.classes ?? []} />
      </Card>

      <Card title="Subjects">
        <div className="grid gap-3 md:grid-cols-2">
          {(summary?.subjects ?? []).map((subject) => (
            <div key={subject._id} className="rounded-xl border border-softGrey px-4 py-3">
              <p className="font-semibold text-gray-900">{subject.name}</p>
              <p className="text-sm text-gray-500">{subject.classLevel || 'All levels'}</p>
            </div>
          ))}
          {!summary?.subjects?.length && <p className="text-sm text-gray-500">No subjects assigned yet.</p>}
        </div>
      </Card>

      <Card
        title="Latest Announcements"
        action={
          <Button variant="secondary" onClick={() => window.location.assign('/teacher/workspace')}>
            Open Workspace
          </Button>
        }
      >
        <div className="space-y-3">
          {(summary?.announcements ?? []).map((announcement) => (
            <div key={announcement._id} className="rounded-xl border border-softGrey px-4 py-3">
              <p className="font-semibold text-gray-900">{announcement.title}</p>
              <p className="text-sm text-gray-600">{announcement.body}</p>
            </div>
          ))}
          {!summary?.announcements?.length && <p className="text-sm text-gray-500">No announcements yet.</p>}
        </div>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
