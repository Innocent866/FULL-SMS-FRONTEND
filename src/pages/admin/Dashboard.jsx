import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Chart from '../../components/ui/Chart.jsx';
import Table from '../../components/ui/Table.jsx';
import apiClient from '../../services/apiClient.js';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ users: 0, classes: 0, fees: 0, payments: [] });

  useEffect(() => {
    const fetchMetrics = async () => {
      const payments = await apiClient.get('/admin/payments');
      const classes = await apiClient.get('/admin/classes');
      const users = await apiClient.get('/auth/users');
      console.log(payments);
      console.log(classes);
      console.log(users.data);
      
      
      
      setMetrics({ users: users.data.data.length, classes: classes.data.data.length, fees: 5400000, payments: payments.data.data });
    };
    fetchMetrics();
  }, []);

  const paymentColumns = [
    { Header: 'Reference', accessor: 'reference' },
    { Header: 'Amount', accessor: 'amount', Cell: (row) => `₦${row.amount?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Date', accessor: 'createdAt' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Active Users">
          <p className="text-3xl font-bold">{metrics.users}</p>
        </Card>
        <Card title="Classes">
          <p className="text-3xl font-bold">{metrics.classes}</p>
        </Card>
        <Card title="Fees Collected">
          <p className="text-3xl font-bold">₦{metrics.fees.toLocaleString()}</p>
        </Card>
        <Card title="Transactions">
          <p className="text-3xl font-bold">{metrics.payments.length}</p>
        </Card>
      </div>

      <Card title="Fee Collection Trend">
        <Chart data={metrics.payments.map((payment) => ({ label: payment.createdAt, value: payment.amount }))} />
      </Card>

      <Card title="Recent Paystack Transactions">
        <Table columns={paymentColumns} data={metrics.payments.slice(0, 5)} />
      </Card>
    </div>
  );
};

export default AdminDashboard;
