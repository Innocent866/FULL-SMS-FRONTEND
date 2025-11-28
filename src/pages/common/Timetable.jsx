import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const slots = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm"];

const TimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const token = localStorage.getItem("smsAccessToken");

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/teacher/timetable",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setEntries(res.data?.data || []);
      } catch (error) {
        console.error("Failed to load timetable:", error);
      }
    };

    loadTimetable();
  }, [token]);

  // Extract subject based on day + slot

  const getSubject = (day, slot) => {
    for (let timetable of entries) {
      const found = timetable.entries.find(
        (e) => e.day === day && e.period === slot
      );
      if (found) return found.subject; // or found.subjectName if you store that
    }
    return "";
  };

  const sub = getSubject("Tuesday", "9am");
  console.log(sub);

  return (
    <Card title="Weekly Timetable">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="border border-softGrey bg-milk p-2"></th>
              {days.map((day) => (
                <th key={day} className="border border-softGrey bg-milk p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {slots.map((slot) => (
              <tr key={slot}>
                <td className="border border-softGrey bg-milk p-2 font-semibold">
                  {slot}
                </td>
                {days.map((day) => (
                  <td key={day} className="border border-softGrey p-2">
                    <span className="rounded-lg bg-softGrey/60 px-2 py-1 text-xs font-semibold text-sidebar">
                      {getSubject(day, slot)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TimetablePage;
