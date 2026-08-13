import './TicketStub.css';

const STATUS_LABEL = {
  pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// The signature element: a ticket rendered like a physical stub, torn
// between the event details and the booking reference.
export default function TicketStub({ booking, event, children }) {
  return (
    <div className="ticket">
      <div className="ticket-main">
        <span className="eyebrow">{event?.category || 'event'}</span>
        <h3>{event?.title || 'Event'}</h3>
        <p className="ticket-venue">{event?.venue}</p>
        <p className="ticket-date">{formatDate(event?.date)}</p>

        <div className="ticket-seats">
          {booking.seatNumbers.map((seat) => (
            <span key={seat} className="ticket-seat">
              {seat}
            </span>
          ))}
        </div>
      </div>

      <div className="ticket-perforation">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="ticket-stub">
        <span className={`badge badge-${booking.status}`}>
          {STATUS_LABEL[booking.status] || booking.status}
        </span>
        <div className="ticket-ref">
          <span className="ticket-ref-label">Booking ref</span>
          <span className="ticket-ref-value">{booking._id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="ticket-amount">₹{booking.totalAmount}</div>
        {children}
      </div>
    </div>
  );
}
