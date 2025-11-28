import Table from '../ui/Table.jsx';

const AttendanceList = ({ records = [] }) => {
  const columns = [
    { Header: 'Date', accessor: 'date' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Remarks', accessor: 'remarks' }
  ];
  return <Table columns={columns} data={records} />;
};

export default AttendanceList;
