import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Chart from '../../components/ui/Chart.jsx';
import AssignmentCard from '../../components/feature/AssignmentCard.jsx';
import AnnouncementCard from '../../components/feature/AnnouncementCard.jsx';
import PaymentHistory from '../../components/feature/PaymentHistory.jsx';
import AttendanceList from '../../components/feature/AttendanceList.jsx';
import ScoreTable from '../../components/feature/ScoreTable.jsx';
import apiClient from '../../services/apiClient.js';

const ParentDashboard = () => {
  const [data, setData] = useState({
    children: [],
    pendingFees: [],
    announcements: [],
    attendanceSummary: [],
    assignments: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const [dashboardRes, assignmentsRes] = await Promise.all([
        apiClient.get('/parent/dashboard'),
        apiClient.get('/assignments')
      ]);
      setData({ ...dashboardRes.data.data, assignments: assignmentsRes.data.data });
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Children">
          <p className="text-3xl font-bold">{data.children.length}</p>
        </Card>
        <Card title="Pending Fees">
          <p className="text-3xl font-bold">₦{data.pendingFees.reduce((sum, fee) => sum + fee.totalDue, 0).toLocaleString()}</p>
        </Card>
        <Card
          title="Announcements"
          action={
            <Link to="/parent/announcements" className="text-sm font-semibold text-sidebar hover:underline">
              View all
            </Link>
          }
        >
          <p className="text-3xl font-bold">{data.announcements.length}</p>
        </Card>
        <Card title="Attendance Records">
          <p className="text-3xl font-bold">{data.attendanceSummary}</p>
        </Card>
      </div>

      <Card title="Performance Overview">
        <Chart data={data.children[0]?.performance || []} dataKey="score" labelKey="subject" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent Assignments">
          <div className="space-y-4">
            {data.assignments.slice(0, 3).map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        </Card>
        <Card title="Announcements">
          <div className="space-y-4">
            {data.announcements.slice(0, 3).map((announcement) => (
              <AnnouncementCard key={announcement._id} announcement={announcement} />
            ))}
          </div>
        </Card>
      </div>

      <Card title="Attendance">
        <AttendanceList records={data.children[0]?.attendance || []} />
      </Card>

      <Card title="Scores">
        <ScoreTable scores={data.children[0]?.scores || []} />
      </Card>

      <Card title="Payment History">
        <PaymentHistory payments={data.payments || []} />
      </Card>
    </div>
  );
};

export default ParentDashboard;
