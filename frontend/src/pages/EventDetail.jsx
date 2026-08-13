import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, getEventSeats } from '../api/eventApi';
import { createBooking } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import Loader from '../components/Loader';
import './EventDetail.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([getEventById(id), getEventSeats(id)])
      .then(([eventData, seatData]) => {
        if (ignore) return;
        setEvent(eventData.event);
        setSeats(seatData.seats || []);
      })
      .catch(() => {
        if (!ignore) setError('Could not load this event.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const toggleSeat = (seatNumber) => {
    setSelected((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const total = useMemo(() => (event ? selected.length * event.price : 0), [selected, event]);

  const handleReserve = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setError('');
    setReserving(true);
    try {
      const data = await createBooking({
        userId: user.id,
        eventId: id,
        seatNumbers: selected,
        pricePerSeat: event.price,
      });
      navigate(`/checkout/${data.booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Those seats just got taken — try different ones.');
      // Refresh seat map so stale selections clear
      const seatData = await getEventSeats(id);
      setSeats(seatData.seats || []);
      setSelected([]);
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <Loader label="Loading event" />;
  if (!event) return <div className="page container"><div className="error-banner">Event not found.</div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="event-detail-header">
          <span className="eyebrow">{event.category || 'general'}</span>
          <h1>{event.title}</h1>
          <div className="event-detail-meta">
            <span>{event.venue}</span>
            <span>{formatDate(event.date)}</span>
            <span>₹{event.price} / seat</span>
            <span>{event.availableSeats} of {event.totalSeats} seats left</span>
          </div>
          {event.description && <p className="event-detail-desc">{event.description}</p>}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="event-detail-layout">
          <SeatMap seats={seats} selected={selected} onToggle={toggleSeat} />

          <div className="booking-panel">
            <h4>Your selection</h4>
            <div className="booking-seat-list">
              {selected.length === 0 && <span style={{ color: 'var(--slate)', fontSize: '0.85rem' }}>Tap seats to select them</span>}
              {selected.map((s) => (
                <span key={s} className="booking-seat-chip">{s}</span>
              ))}
            </div>
            <div className="booking-total">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={selected.length === 0 || reserving}
              onClick={handleReserve}
            >
              {reserving ? 'Holding seats…' : `Hold ${selected.length || ''} seat${selected.length === 1 ? '' : 's'}`}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '12px' }}>
              Seats are held for 10 minutes while you pay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
