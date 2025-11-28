import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import apiClient from '../../services/apiClient.js';

const StudentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await apiClient.get('/student/profile');
        setProfile(res.data?.data?.student || null);
        setTeachers(res.data?.data?.teachers || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teacherColumns = [
    { Header: 'Subject', accessor: 'subject', Cell: (row) => row.subject?.name || row.subject || '—' },
    {
      Header: 'Teacher',
      accessor: 'teacher',
      Cell: (row) => `${row.teacher?.firstName ?? ''} ${row.teacher?.lastName ?? ''}`.trim() || '—'
    },
    { Header: 'Email', accessor: 'email', Cell: (row) => row.teacher?.email || row.teacher?.user?.email || '—' }
  ];

  return (
    <div className="space-y-6">
      <Card title="My Profile">
        {loading ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : profile ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <img
                src={profile.userId?.avatarUrl || 'https://i.pravatar.cc/120'}
                alt={profile.userId?.firstName || 'Student avatar'}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {`${profile.userId?.firstName ?? ''} ${profile.userId?.lastName ?? ''}`.trim()}
                </p>
                <p className="text-sm text-gray-600">Admission No: {profile.admissionNumber || 'Not set'}</p>
                <p className="text-sm text-gray-600">Email: {profile.userId?.email || '—'}</p>
                <p className="text-sm text-gray-600">Phone: {profile.userId?.phone || '—'}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-softGrey/70 p-4">
              <p className="text-xs uppercase text-gray-500">Class Details</p>
              <p className="text-lg font-semibold">{profile.classId?.name || 'Not assigned'}</p>
              <p className="text-sm text-gray-600">
                Session: {profile.classId?.session || '—'} · Term: {profile.classId?.term || '—'}
              </p>
              <p className="text-sm text-gray-600">Arm: {profile.classId?.arm || '—'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Profile not available.</p>
        )}
      </Card>

      <Card title="Assigned Teachers">
        {loading ? (
          <p className="text-sm text-gray-500">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-sm text-gray-500">Teachers will appear here once assigned.</p>
        ) : (
          <Table columns={teacherColumns} data={teachers} />
        )}
      </Card>
    </div>
  );
};

export default StudentProfilePage;

