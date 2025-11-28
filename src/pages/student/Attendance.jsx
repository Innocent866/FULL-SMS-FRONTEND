import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import AttendanceList from '../../components/feature/AttendanceList.jsx';
import Button from '../../components/ui/Button.jsx';
import apiClient from '../../services/apiClient.js';

const StudentAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await apiClient.get('/student/attendance');
        setRecords(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load attendance history.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0 }
    );
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <Button variant="secondary" onClick={() => window.print()}>
          Export
        </Button>
      </div>

      <Card title="Summary">
        {loading ? (
          <p className="text-sm text-gray-500">Loading summary...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Present', value: summary.present },
              { label: 'Absent', value: summary.absent },
              { label: 'Late', value: summary.late },
              { label: 'Excused', value: summary.excused }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-softGrey/60 p-4">
                <p className="text-xs uppercase text-gray-500">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Daily Records">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading attendance history...</p>
        ) : (
          <AttendanceList records={records} />
        )}
      </Card>
    </div>
  );
};

export default StudentAttendancePage;

