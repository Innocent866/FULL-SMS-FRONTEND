import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const AssignmentCard = ({ assignment }) => (
  <Card
    title={assignment.title}
    action={
      <Button variant="secondary">
        {assignment.status === 'submitted' ? 'View Submission' : 'Submit'}
      </Button>
    }
  >
    <p className="mb-2 text-sm text-gray-600">Due {assignment.dueDate}</p>
    <p className="text-sm text-gray-700">{assignment.description}</p>
  </Card>
);

export default AssignmentCard;
