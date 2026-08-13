import { Link } from 'react-router-dom';
import './EventCard.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventCard({ event }) {
  const soldOut = event.availableSeats === 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card-top">
        <span className="eyebrow">{event.category || 'general'}</span>
        {soldOut && <span className="badge badge-cancelled">Sold out</span>}
      </div>
      <h3>{event.title}</h3>
      <p className="event-card-venue">{event.venue}</p>
      <div className="event-card-footer">
        <span className="event-card-date">{formatDate(event.date)}</span>
        <span className="event-card-price">₹{event.price}</span>
      </div>
    </Link>
  );
}
