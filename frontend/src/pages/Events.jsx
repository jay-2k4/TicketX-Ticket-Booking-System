import { useEffect, useMemo, useState } from 'react';
import { getEvents } from '../api/eventApi';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import './Events.css';

const CATEGORIES = ['all', 'music', 'sports', 'theatre', 'comedy', 'general'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getEvents(category === 'all' ? undefined : category)
      .then((data) => {
        if (!ignore) setEvents(data.events || []);
      })
      .catch(() => {
        if (!ignore) setError('Could not load events right now.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [category]);

  const hasEvents = useMemo(() => events.length > 0, [events]);

  return (
    <div className="page">
      <div className="container">
        <div className="events-header">
          <div>
            <span className="eyebrow">Now booking</span>
            <h1>Upcoming events</h1>
          </div>
          <div className="events-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading && <Loader label="Fetching events" />}
        {error && <div className="error-banner">{error}</div>}

        {!loading && !error && !hasEvents && (
          <div className="empty-state">
            <h3>No events here yet</h3>
            <p>Check back soon, or try a different category.</p>
          </div>
        )}

        {!loading && hasEvents && (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
