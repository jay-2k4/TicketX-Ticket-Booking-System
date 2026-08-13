import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookingById } from '../api/bookingApi';
import { getEventById } from '../api/eventApi';
import TicketStub from '../components/TicketStub';
import Loader from '../components/Loader';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getBookingById(bookingId)
      .then(async (data) => {
        if (ignore) return;
        setBooking(data.booking);
        const eventData = await getEventById(data.booking.eventId);
        if (!ignore) setEvent(eventData.event);
      })
      .catch(() => {
        if (!ignore) setError('Could not load this booking.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [bookingId]);

  if (loading) return <Loader label="Loading your ticket" />;
  if (error || !booking) return <div className="page container"><div className="error-banner">{error}</div></div>;

  return (
    <div className="page">
      <div className="container confirmation-wrap">
        <span className="eyebrow">
          {booking.status === 'confirmed' ? "You're going" : 'Booking status'}
        </span>
        <h1>
          {booking.status === 'confirmed'
            ? 'Your ticket is confirmed'
            : `Booking ${booking.status}`}
        </h1>

        <TicketStub booking={booking} event={event} />

        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn btn-outline">View all bookings</Link>
          <Link to="/events" className="btn btn-primary">Browse more events</Link>
        </div>
      </div>
    </div>
  );
}
