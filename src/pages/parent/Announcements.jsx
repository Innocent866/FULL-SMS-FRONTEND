import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import AnnouncementCard from "../../components/feature/AnnouncementCard.jsx";
import apiClient from "../../services/apiClient.js";

const audienceFilters = [
  { label: "For Parents", value: "parent" },
  { label: "All Updates", value: "all" },
];

const ParentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audience, setAudience] = useState("parent");

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (audience !== "all") params.audience = audience;
        const response = await apiClient.get("/announcements", { params });
        setAnnouncements(response.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load announcements");
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [audience]);

  return (
    <div className="space-y-6">
      <Card title="Announcements Center">
        <p className="text-sm text-gray-600">
          Stay updated with everything happening at school. Filter by update
          type or search for a specific announcement.
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-3">
          {audienceFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={audience === filter.value ? "primary" : "secondary"}
              onClick={() => setAudience(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {loading && (
          <Card>
            <p className="text-sm text-gray-500">Loading announcements...</p>
          </Card>
        )}

        {error && (
          <Card>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {!loading && !error && announcements.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">
              No announcements match your current filters.
            </p>
          </Card>
        )}

        {!loading &&
          !error &&
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
            />
          ))}
      </div>
    </div>
  );
};

export default ParentAnnouncementsPage;

