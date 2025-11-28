import Card from '../ui/Card.jsx';

const StudentProfileCard = ({ student }) => (
  <Card>
    <div className="flex items-center gap-4">
      <img src={student?.avatarUrl || 'https://i.pravatar.cc/80'} alt={student?.name} className="h-16 w-16 rounded-full" />
      <div>
        <h4 className="text-lg font-semibold">{student?.name}</h4>
        <p className="text-sm text-gray-600">Class: {student?.className}</p>
        <p className="text-sm text-gray-600">Teacher: {student?.teacher}</p>
      </div>
    </div>
  </Card>
);

export default StudentProfileCard;
