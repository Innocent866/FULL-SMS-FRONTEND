import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import AttendanceList from '../../components/feature/AttendanceList.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import apiClient from '../../services/apiClient.js';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAttendance = async (childId) => {
    setLoading(true);
    setError('');
    try {
      const params = childId ? { childId } : {};
      const res = await apiClient.get('/parent/attendance', { params });
      const data = res.data?.data || {};
      setChildren(data.children || []);
      setRecords(data.records || []);
      if (!childId && !selectedChildId && (data.children?.length ?? 0) > 0) {
        setSelectedChildId(data.children[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load attendance records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedChildId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const childOptions =
    children.map((child) => {
      const first = child.userId?.firstName ?? '';
      const last = child.userId?.lastName ?? '';
      const label = `${first} ${last}`.trim() || child.admissionNumber || 'Child';
      return { value: child._id, label };
    }) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Button variant="secondary">Export CSV</Button>
      </div>
      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Select
            label="Select Child"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            options={[
              { value: '', label: children.length ? 'All children' : 'No child linked' },
              ...childOptions
            ]}
            disabled={!children.length}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading attendance records...</p>
        ) : (
          <AttendanceList records={records} />
        )}
      </Card>
    </div>
  );
};

export default AttendancePage;
