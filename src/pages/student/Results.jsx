import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Chart from '../../components/ui/Chart.jsx';
import ScoreTable from '../../components/feature/ScoreTable.jsx';
import apiClient from '../../services/apiClient.js';

const StudentResultsPage = () => {
  const [history, setHistory] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [result, setResult] = useState({ subjects: [], remarks: '', summary: {} });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const res = await apiClient.get('/student/results/history');
        const records = res.data?.data || [];
        setHistory(records);
        if (records.length) {
          setSelectedTerm(records[0].termId || records[0]._id || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load result history.');
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (!selectedTerm && history.length === 0) return;
    const termId = selectedTerm || history[0]?.termId || history[0]?._id;
    if (!termId) return;
    const loadResult = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get('/student/results', { params: { termId } });
        setResult(res.data?.data || { subjects: [], remarks: '', summary: {} });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load results.');
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [selectedTerm, history]);

  const performanceData = useMemo(
    () =>
      history
        .map((record) => ({
          term: record.termLabel || record.termName || 'Term',
          score: record.averageScore || record.total || 0
        }))
        .reverse(),
    [history]
  );

  const downloadReport = () => {
    if (!selectedTerm) return;
    const baseUrl = apiClient.defaults.baseURL.replace(/\/$/, '');
    const url = `${baseUrl}/student/results/report?termId=${selectedTerm}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Results & Performance</h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select
            label="Select Term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            options={
              history.map((record) => ({
                label: record.termLabel || `${record.termName} (${record.sessionName})`,
                value: record.termId || record._id
              })) || []
            }
            disabled={historyLoading || history.length === 0}
          />
          <Button variant="secondary" onClick={downloadReport} disabled={!selectedTerm}>
            Download Report
          </Button>
        </div>
      </div>

      {error && <Card><p className="text-sm text-red-600">{error}</p></Card>}

      <Card title="Term Summary">
        {loading ? (
          <p className="text-sm text-gray-500">Loading results...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{result.summary?.average ?? '--'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Class Position</p>
              <p className="text-2xl font-semibold text-gray-900">{result.summary?.position ?? '--'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Best Subject</p>
              <p className="text-2xl font-semibold text-gray-900">{result.summary?.bestSubject || '--'}</p>
            </div>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-xs uppercase text-gray-500">Teacher Remark</p>
              <p className="text-sm text-gray-700">{result.remarks || 'No remark yet.'}</p>
            </div>
          </div>
        )}
      </Card>

      <Card title="Subject Breakdown">
        {loading ? (
          <p className="text-sm text-gray-500">Loading subjects...</p>
        ) : (
          <ScoreTable scores={result.subjects || []} />
        )}
      </Card>

      <Card title="Performance Trend">
        {performanceData.length ? (
          <Chart data={performanceData} dataKey="score" labelKey="term" />
        ) : (
          <p className="text-sm text-gray-500">No performance data yet.</p>
        )}
      </Card>
    </div>
  );
};

export default StudentResultsPage;

