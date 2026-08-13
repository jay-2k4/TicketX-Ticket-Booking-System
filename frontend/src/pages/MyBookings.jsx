import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import { getEventById } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import TicketStub from '../components/TicketStub';
import Loader from '../components/Loader';
import './MyBookings.css';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // [{ booking, event }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getMyBookings(user.id)
      .then(async (data) => {
        const bookings = data.bookings || [];
        const withEvents = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const eventData = await getEventById(booking.eventId);
              return { booking, event: eventData.event };
            } catch {
              return { booking, event: null };
            }
          })
        );
        setItems(withEvents);
      })
      .catch(() => setError('Could not load your bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleCancel = async (bookingId) => {
    await cancelBooking(bookingId);
    load();
  };

  if (loading) return <Loader label="Loading your bookings" />;

  return (
    <div className="page">
      <div className="container">
        <span className="eyebrow">Your account</span>
        <h1 style={{ fontSize: '2.2rem', margin: '8px 0 32px' }}>My bookings</h1>

        {error && <div className="error-banner">{error}</div>}

        {!error && items.length === 0 && (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Once you reserve seats, they'll show up here.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/events')}>
              Browse events
            </button>
          </div>
        )}

        <div className="bookings-list">
          {items.map(({ booking, event }) => (
            <div key={booking._id}>
              <TicketStub booking={booking} event={event}>
                <div className="booking-item-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/checkout/${booking._id}`)}
                      >
                        Pay now
                      </button>
                      <button className="btn btn-danger" onClick={() => handleCancel(booking._id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </TicketStub>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
