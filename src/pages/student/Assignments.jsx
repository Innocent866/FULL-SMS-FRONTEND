import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import AssignmentCard from '../../components/feature/AssignmentCard.jsx';
import apiClient from '../../services/apiClient.js';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get('/student/assignments', { params: { status: statusFilter } });
        console.log(res);
        
        setAssignments(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load assignments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionModalOpen(true);
    setSubmissionNote('');
    setSubmissionFile(null);
  };

  const closeSubmissionModal = () => {
    if (submitting) return;
    setSubmissionModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleSubmitAssignment = async (event) => {
    event.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('note', submissionNote);
      if (submissionFile) formData.append('file', submissionFile);
      await apiClient.post(`/student/assignments/${selectedAssignment._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      closeSubmissionModal();
      setStatusFilter('submitted');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = useMemo(() => assignments || [], [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'graded', label: 'Graded' }
          ]}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <Card>
          <p className="text-sm text-gray-500">Loading assignments...</p>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No assignments for this status.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <AssignmentCard assignment={assignment} />
              <div className="flex flex-wrap gap-2">
                {assignment.resources?.map((resource) => (
                  <Button
                    key={resource._id || resource.url}
                    variant="secondary"
                    size="md"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    Download {resource.name || 'File'}
                  </Button>
                ))}
                {assignment.canSubmit !== false && (
                  <Button size="md" onClick={() => openSubmissionModal(assignment)}>
                    {assignment.submission?.status === 'submitted' ? 'Update submission' : 'Submit assignment'}
                  </Button>
                )}
              </div>
              {assignment.submission?.feedback && (
                <p className="text-sm text-emerald-700">
                  Feedback: <span className="font-medium">{assignment.submission.feedback}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={submissionModalOpen} onClose={closeSubmissionModal} title="Submit Assignment" placement="bottom-right">
        {selectedAssignment ? (
          <form className="space-y-4" onSubmit={handleSubmitAssignment}>
            <div className="rounded-2xl border border-softGrey/60 p-4">
              <p className="text-sm font-semibold text-gray-900">{selectedAssignment.title}</p>
              <p className="text-xs text-gray-500">
                Due {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString() : '—'}
              </p>
            </div>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span>Upload File</span>
              <input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                className="rounded-lg border border-dashed border-softGrey/80 p-3 text-sm"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span>Submission Note</span>
              <textarea
                rows={4}
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className="rounded-lg border border-softGrey bg-white p-3 focus:border-sidebar focus:outline-none focus:ring-1 focus:ring-sidebar"
              />
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">Select an assignment to submit.</p>
        )}
      </Modal>
    </div>
  );
};

export default StudentAssignmentsPage;

