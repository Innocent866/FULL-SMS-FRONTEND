import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Notification from '../../components/ui/Notification.jsx';
import apiClient from '../../services/apiClient.js';

const defaultWeights = {
  CA1: 15,
  CA2: 15,
  project: 10,
  exam: 60
};

const AdminAssessmentsPage = () => {
  const [weights, setWeights] = useState(defaultWeights);
  const [grades, setGrades] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/assessments/grading');
      setWeights(data.data?.weights ?? defaultWeights);
      setGrades(data.data?.grades ?? []);
    } catch (error) {
      setNotification({ type: 'error', message: 'Unable to load grading profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleWeightChange = (event) => {
    const { name, value } = event.target;
    setWeights((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleGradeChange = (index, field, value) => {
    setGrades((prev) => prev.map((grade, idx) => (idx === index ? { ...grade, [field]: field.includes('Score') ? Number(value) : value } : grade)));
  };

  const addGradeRow = () => {
    setGrades((prev) => [...prev, { label: '', minScore: 0, maxScore: 0, remark: '' }]);
  };

  const removeGradeRow = (index) => {
    setGrades((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotification(null);
    try {
      await apiClient.put('/admin/assessments/grading', { weights, grades });
      setNotification({ type: 'success', message: 'Assessment settings updated' });
      await fetchProfile();
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update assessments';
      setNotification({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((sum, val) => sum + Number(val || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Assessments</p>
          <h1 className="text-2xl font-semibold text-gray-900">Grading Scheme & Score Weights</h1>
        </div>
      </div>

      {notification && <Notification type={notification.type}>{notification.message}</Notification>}

      <Card title="Score Weight Distribution">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
          {Object.entries(weights).map(([key, value]) => (
            <Input
              key={key}
              type="number"
              label={`${key.toUpperCase()} (%)`}
              name={key}
              value={value}
              min={0}
              max={100}
              onChange={handleWeightChange}
              required
            />
          ))}
          <div className="md:col-span-4 text-sm text-gray-600">
            Total Weight: <span className={totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}>{totalWeight}%</span> (must equal 100%)
          </div>
          <div className="md:col-span-4">
            <h3 className="text-base font-semibold text-gray-900">Grading Bands</h3>
            <div className="mt-3 space-y-3">
              {grades.map((grade, index) => (
                <div key={`grade-${index}`} className="grid gap-3 rounded-xl border border-softGrey p-4 md:grid-cols-5">
                  <Input label="Label" value={grade.label} onChange={(e) => handleGradeChange(index, 'label', e.target.value)} required />
                  <Input
                    type="number"
                    label="Min Score"
                    value={grade.minScore}
                    onChange={(e) => handleGradeChange(index, 'minScore', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    label="Max Score"
                    value={grade.maxScore}
                    onChange={(e) => handleGradeChange(index, 'maxScore', e.target.value)}
                    required
                  />
                  <Input label="Remark" value={grade.remark} onChange={(e) => handleGradeChange(index, 'remark', e.target.value)} />
                  <div className="flex items-end justify-end">
                    <Button type="button" variant="secondary" onClick={() => removeGradeRow(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addGradeRow}>
                Add Grade Band
              </Button>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" disabled={saving || totalWeight !== 100}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
        {loading && <p className="mt-4 text-sm text-gray-500">Loading current configuration...</p>}
      </Card>
    </div>
  );
};

export default AdminAssessmentsPage;

