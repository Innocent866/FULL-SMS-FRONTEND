import Table from '../ui/Table.jsx';

const ScoreTable = ({ scores = [] }) => {
  const columns = [
    { Header: 'Subject', accessor: 'subject' },
    { Header: 'CA1', accessor: 'CA1' },
    { Header: 'CA2', accessor: 'CA2' },
    { Header: 'Project', accessor: 'project' },
    { Header: 'Exam', accessor: 'exam' },
    { Header: 'Total', accessor: 'total' },
    { Header: 'Position', accessor: 'position' }
  ];
  return <Table columns={columns} data={scores} />;
};

export default ScoreTable;
