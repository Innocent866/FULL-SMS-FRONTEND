import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Chart from '../../components/ui/Chart.jsx';
import AssignmentCard from '../../components/feature/AssignmentCard.jsx';
import ScoreTable from '../../components/feature/ScoreTable.jsx';
import AttendanceList from '../../components/feature/AttendanceList.jsx';
import apiClient from '../../services/apiClient.js';

const StudentDashboard = () => {
  const [data, setData] = useState({ assignments: [], scores: [], attendance: [] });

  useEffect(() => {
    const load = async () => {
      const [assignments, scores, attendance] = await Promise.all([
        apiClient.get('/assignments'),
        apiClient.get('/student/dashboard'),
        apiClient.get('/student/attendance')
      ]);
      setData({
        assignments: assignments.data.data,
        scores: scores.data.data.latestScores,
        attendance: attendance.data.data
      });
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Assignments">
          <p className="text-3xl font-bold">{data.assignments.length}</p>
        </Card>
        <Card title="Average Score">
          <p className="text-3xl font-bold">
            {data.scores.length ?
              Math.round(
                data.scores.reduce((sum, score) => sum + (score.total || 0), 0) / data.scores.length
              ) :
              '--'}
          </p>
        </Card>
        <Card title="Attendance Records">
          <p className="text-3xl font-bold">{data.attendance.length}</p>
        </Card>
      </div>

      <Card title="Score Trend">
        <Chart data={data.scores.map((score) => ({ subject: score.subjectId?.name || 'Subject', score: score.total }))} />
      </Card>

      <Card title="Assignments">
        <div className="grid gap-4 md:grid-cols-2">
          {data.assignments.slice(0, 4).map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      </Card>

      <Card title="Scores">
        <ScoreTable scores={data.scores} />
      </Card>

      <Card title="Attendance">
        <AttendanceList records={data.attendance} />
      </Card>
    </div>
  );
};

export default StudentDashboard;
