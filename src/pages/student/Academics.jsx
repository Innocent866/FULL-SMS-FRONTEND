import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import apiClient from '../../services/apiClient.js';

const StudentAcademicsPage = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await apiClient.get('/student/academics');
        setClassInfo(res.data?.data?.classInfo || null);
        setSubjects(res.data?.data?.subjects || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load academic overview.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectColumns = [
    { Header: 'Subject', accessor: 'name' },
    {
      Header: 'Teacher',
      accessor: 'teacher',
      Cell: (row) => `${row.teacher?.firstName ?? ''} ${row.teacher?.lastName ?? ''}`.trim() || '—'
    },
    { Header: 'Email', accessor: 'email', Cell: (row) => row.teacher?.email || row.teacher?.user?.email || '—' }
  ];

  return (
    <div className="space-y-6">
      <Card title="Class Information">
        {loading ? (
          <p className="text-sm text-gray-500">Loading class information...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : classInfo ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Class</p>
              <p className="text-xl font-semibold text-gray-900">{classInfo.name || '—'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Session</p>
              <p className="text-xl font-semibold text-gray-900">{classInfo.session || '—'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Term</p>
              <p className="text-xl font-semibold text-gray-900">{classInfo.term || '—'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Arm</p>
              <p className="text-xl font-semibold text-gray-900">{classInfo.arm || '—'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Class information not available.</p>
        )}
      </Card>

      <Card title="Subjects & Teachers">
        {loading ? (
          <p className="text-sm text-gray-500">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-gray-500">No subjects assigned yet.</p>
        ) : (
          <Table columns={subjectColumns} data={subjects} />
        )}
      </Card>
    </div>
  );
};

export default StudentAcademicsPage;

