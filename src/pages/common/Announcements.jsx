import { useEffect, useState } from 'react';
import AnnouncementCard from '../../components/feature/AnnouncementCard.jsx';
import Button from '../../components/ui/Button.jsx';
import apiClient from '../../services/apiClient.js';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get('/announcements', {
          params: { audience: filter },
        });

        console.log(res.data);
        
        setAnnouncements(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setError('Unable to load announcements');
        setAnnouncements([]); // prevent map crash
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'parent', 'teacher', 'student'].map((aud) => (
            <Button
              key={aud}
              variant={filter === aud ? 'primary' : 'secondary'}
              onClick={() => setFilter(aud)}
            >
              {aud.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading && <p className="text-gray-500 text-sm">Loading announcements...</p>}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && announcements.length === 0 && !error && (
          <p className="text-gray-500 text-sm">No announcements yet.</p>
        )}

        {!loading &&
          announcements.length > 0 &&
          announcements.map((a) => (
            <AnnouncementCard key={a._id} announcement={a} />
          ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
