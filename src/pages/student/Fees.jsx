import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import PaymentHistory from '../../components/feature/PaymentHistory.jsx';
import apiClient from '../../services/apiClient.js';

const StudentFeesPage = () => {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const [feesRes, paymentsRes] = await Promise.all([
          apiClient.get('/student/fees'),
          apiClient.get('/student/fees/history')
        ]);
        setFees(feesRes.data?.data || []);
        setPayments(paymentsRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load fee information.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    { Header: 'Term', accessor: 'term' },
    { Header: 'Session', accessor: 'session' },
    {
      Header: 'Amount Due',
      accessor: 'totalDue',
      Cell: (row) => `₦${row.totalDue?.toLocaleString() || 0}`
    },
    { Header: 'Status', accessor: 'status' }
  ];

  const outstanding = fees.filter((fee) => fee.status !== 'paid').reduce((sum, fee) => sum + (fee.totalDue || 0), 0);

  return (
    <div className="space-y-6">
      <Card title="Fees Overview">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-softGrey/60 p-4">
            <p className="text-xs uppercase text-gray-500">Outstanding</p>
            <p className="text-2xl font-semibold text-gray-900">₦{outstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-softGrey/60 p-4">
            <p className="text-xs uppercase text-gray-500">Pending Items</p>
            <p className="text-2xl font-semibold text-gray-900">{fees.filter((fee) => fee.status !== 'paid').length}</p>
          </div>
          <div className="rounded-2xl border border-softGrey/60 p-4">
            <p className="text-xs uppercase text-gray-500">Payments Made</p>
            <p className="text-2xl font-semibold text-gray-900">{payments.length}</p>
          </div>
        </div>
      </Card>

      <Card title="Fee Breakdown">
        {loading ? (
          <p className="text-sm text-gray-500">Loading fees...</p>
        ) : (
          <Table columns={columns} data={fees} />
        )}
      </Card>

      <Card title="Payment History">
        <PaymentHistory payments={payments} />
      </Card>
    </div>
  );
};

export default StudentFeesPage;

