import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Table from "../../components/ui/Table.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Notification from "../../components/ui/Notification.jsx";
import apiClient from "../../services/apiClient.js";
import Select from "../../components/ui/Select.jsx";

const entryColumns = [
  { Header: "Day", accessor: "day" },
  { Header: "Period", accessor: "period" },
  { Header: "Subject", accessor: "subject" },
  { Header: "Teacher", accessor: "teacherName" },
];

const initialForm = {
  className: "",
  term: "",
  day: "",
  period: "",
  subject: "",
  teacherName: "",
  teacherId: null
};

const AdminTimetablePage = () => {
  const [timetables, setTimetables] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  /* -------------------- Fetch Helpers -------------------- */

  const safeGet = async (url, onSuccess, errorMessage) => {
    try {
      const { data } = await apiClient.get(url);
      onSuccess(data?.data ?? []);
      console.log(data);
    } catch (error) {
      console.error(errorMessage, error);
      setNotification({ type: "error", message: errorMessage });
    }
  };

  const fetchTimetables = () =>
    safeGet("/admin/timetables", setTimetables, "Unable to load timetables");

  const fetchTeachers = () =>
    safeGet("/admin/teachers", setTeachers, "Unable to load teachers");

  const fetchSubjects = () =>
    safeGet("/admin/subjects", setSubjects, "Unable to load subjects");

  /* -------------------- Initial Load -------------------- */

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTimetables(), fetchTeachers(), fetchSubjects()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  /* -------------------- Form Logic -------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    console.log(form);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      await apiClient.post("/admin/timetables", {
        className: form.className,
        term: form.term,
        entries: [
          {
            day: form.day,
            period: form.period,
            subject: form.subject,
            teacherName: form.teacherName,
            teacherId: form.teacherId,
          },
        ],
      });

      setNotification({
        type: "success",
        message: "Timetable entry added successfully",
      });

      setForm(initialForm);
      await fetchTimetables();
    } catch (error) {
      console.error("Add timetable error:", error);
      const message =
        error.response?.data?.error?.message || "Failed to add timetable entry";
      setNotification({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- Utility -------------------- */

  const optionsFrom = (items, labelKey = "name") => [
    { value: "", label: "Select option" },
    ...items.map((item) => ({
      value: item.name,
      label: item[labelKey],
    })),
  ];

  /* -------------------- Render -------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">Operations</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Master Timetable
        </h1>
      </div>

      {/* --- Add Entry Form --- */}
      <Card title="Add Timetable Entry">
        {notification && (
          <Notification type={notification.type}>
            {notification.message}
          </Notification>
        )}

        <form
          className="mt-4 grid gap-4 md:grid-cols-3"
          onSubmit={handleSubmit}
        >
          <Input
            label="Class Name"
            name="className"
            value={form.className}
            onChange={handleChange}
            required
          />

          <Input
            label="Term"
            name="term"
            value={form.term}
            onChange={handleChange}
            required
          />

          <Input
            label="Day"
            name="day"
            value={form.day}
            onChange={handleChange}
            required
          />

          <Input
            label="Period"
            name="period"
            value={form.period}
            onChange={handleChange}
            required
          />

          <Select
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            options={optionsFrom(subjects)}
          />
          <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Teacher Id</span>
          <select name="teacherId" className="rounded-lg border border-softGrey bg-white px-4 py-2 focus:border-sidebar focus:outline-none" onChange={handleChange}>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          </label>
          <Select
            label="Teacher"
            name="teacherName"
            value={form.teacherName}
            onChange={handleChange}
            options={optionsFrom(teachers)}
          />

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </Card>

      {/* --- Timetable List --- */}
      {loading ? (
        <Card title="Timetables">
          <p className="text-sm text-gray-500">Loading...</p>
        </Card>
      ) : timetables.length === 0 ? (
        <Card title="Timetables">
          <p className="text-sm text-gray-500">No timetable entries found.</p>
        </Card>
      ) : (
        timetables.map((timetable) => (
          <Card
            key={timetable._id}
            title={`${timetable.className} • ${timetable.term}`}
          >
            <Table columns={entryColumns} data={timetable.entries || []} />
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminTimetablePage;
