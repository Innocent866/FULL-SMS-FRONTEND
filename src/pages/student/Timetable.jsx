import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Table from "../../components/ui/Table.jsx";
import apiClient from "../../services/apiClient.js";
import axios from "axios";

const StudentTimetablePage = () => {
  const [classTimetable, setClassTimetable] = useState(null);
  const [examTimetable, setExamTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("smsAccessToken");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await axios.get(
          "http://localhost:5000/api/student/timetable",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        console.log(res.data);

        const data = res.data?.data || {};
        setClassTimetable(data.classTimetable || null);
        setExamTimetable(data.examTimetable || null);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load timetable.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const classColumns = [
    { Header: "Day", accessor: "day" },
    {
      Header: "Time",
      accessor: "timeRange",
      Cell: (row) =>
        row.timeRange ||
        (row.startTime && row.endTime
          ? `${row.startTime} - ${row.endTime}`
          : "—"),
    },
    {
      Header: "Subject",
      accessor: "subject",
      Cell: (row) => row.subject || row.subjectName || "—",
    },
    {
      Header: "Teacher",
      accessor: "teacherName",
      Cell: (row) =>
        row.teacherName || row.teacher?.name || row.teacher?.fullName || "—",
    },
    {
      Header: "Room",
      accessor: "room",
      Cell: (row) => row.room || row.location || "—",
    },
  ];

  const examColumns = [
    {
      Header: "Date",
      accessor: "date",
      Cell: (row) => (row.date ? new Date(row.date).toLocaleDateString() : "—"),
    },
    {
      Header: "Subject",
      accessor: "subjectName",
      Cell: (row) => row.subjectName || row.subject || "—",
    },
    {
      Header: "Start",
      accessor: "startTime",
      Cell: (row) => row.startTime || "—",
    },
    { Header: "End", accessor: "endTime", Cell: (row) => row.endTime || "—" },
    {
      Header: "Venue",
      accessor: "venue",
      Cell: (row) => row.venue || row.location || "—",
    },
  ];

  const classEntries = classTimetable?.entries || [];
  const examEntries = examTimetable?.entries || [];

  return (
    <div className="space-y-6">
      <Card
        title="Class Timetable"
        action={
          classTimetable?.updatedAt && (
            <span className="text-xs text-gray-500">
              Updated {new Date(classTimetable.updatedAt).toLocaleDateString()}
            </span>
          )
        }
      >
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading timetable...</p>
        ) : classEntries.length ? (
          <Table columns={classColumns} data={classEntries} />
        ) : (
          <p className="text-sm text-gray-500">No timetable published yet.</p>
        )}
        {classTimetable?.notes && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {classTimetable.notes}
          </p>
        )}
      </Card>

      <Card
        title="Exam Schedule"
        action={
          examTimetable?.updatedAt && (
            <span className="text-xs text-gray-500">
              Updated {new Date(examTimetable.updatedAt).toLocaleDateString()}
            </span>
          )
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading exam schedule...</p>
        ) : examEntries.length ? (
          <Table columns={examColumns} data={examEntries} />
        ) : (
          <p className="text-sm text-gray-500">
            Exam schedule will appear here once available.
          </p>
        )}
        {examTimetable?.notes && (
          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-800">
            {examTimetable.notes}
          </p>
        )}
      </Card>
    </div>
  );
};

export default StudentTimetablePage;
