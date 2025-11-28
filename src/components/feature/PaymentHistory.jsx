import Table from '../ui/Table.jsx';

const PaymentHistory = ({ payments = [] }) => {
  const columns = [
    { Header: 'Reference', accessor: 'reference' },
    { Header: 'Amount', accessor: 'amount', Cell: (row) => `₦${row.amount?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Paid At', accessor: 'paidAt' }
  ];
  return <Table columns={columns} data={payments} />;
};

export default PaymentHistory;
