import { useEffect, useState } from 'react';
import AssignmentCard from '../../components/feature/AssignmentCard.jsx';
import Button from '../../components/ui/Button.jsx';
import apiClient from '../../services/apiClient.js';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get('/assignments', { params: { filter } });
      setAssignments(res.data.data || []);
    };
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-white p-1 text-sm">
          {['upcoming', 'past', 'submitted'].map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? 'primary' : 'secondary'}
              className="mr-2"
              onClick={() => setFilter(tab)}
            >
              {tab.toUpperCase()}
            </Button>
          ))}
        </div>
        <Button variant="primary">New Assignment</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment._id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
