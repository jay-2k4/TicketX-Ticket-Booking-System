import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../api/bookingApi';
import { getEventById } from '../api/eventApi';
import { payForBooking } from '../api/paymentApi';
import CountdownTimer from '../components/CountdownTimer';
import Loader from '../components/Loader';
import './Checkout.css';

const METHODS = ['card', 'upi', 'wallet', 'netbanking'];

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

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
        if (!ignore) setError('Could not find this booking.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [bookingId]);

  const handleExpire = async () => {
    setExpired(true);
    try {
      await cancelBooking(bookingId);
    } catch {
      // booking may already be swept server-side; nothing else to do here
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    try {
      const payload = {
        bookingId,
        amount: booking.totalAmount,
        method,
        details: method === 'card' ? { cardNumber } : {},
      };
      await payForBooking(payload);
      navigate(`/bookings/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader label="Loading your booking" />;
  if (!booking || !event) return <div className="page container"><div className="error-banner">{error || 'Booking not found.'}</div></div>;

  if (expired || booking.status !== 'pending') {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h3>This hold has expired</h3>
            <p>Your seats were released. Head back to the event to pick again.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate(`/events/${event._id}`)}>
              Back to {event.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="checkout-header">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Complete your payment</h1>
          </div>
          <CountdownTimer expiresAt={booking.lockExpiry} onExpire={handleExpire} />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="checkout-layout">
          <div>
            <p style={{ color: 'var(--slate)', maxWidth: 480 }}>
              {event.title} · {event.venue} · Seats {booking.seatNumbers.join(', ')}
            </p>
          </div>

          <div className="pay-panel">
            <h4>Pay with</h4>
            <div className="method-grid">
              {METHODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`method-option ${method === m ? 'active' : ''}`}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <form onSubmit={handlePay}>
              {method === 'card' && (
                <div className="field">
                  <label htmlFor="cardNumber">Card number</label>
                  <input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
              )}

              <div className="checkout-summary">
                <span>Seats ({booking.seatNumbers.length})</span>
                <span>{booking.seatNumbers.join(', ')}</span>
              </div>
              <div className="checkout-total">
                <span>Total due</span>
                <strong>₹{booking.totalAmount}</strong>
              </div>

              <button className="btn btn-primary btn-block" disabled={paying}>
                {paying ? 'Processing…' : `Pay ₹${booking.totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
