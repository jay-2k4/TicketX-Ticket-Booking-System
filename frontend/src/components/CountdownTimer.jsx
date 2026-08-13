import { useEffect, useRef, useState } from 'react';
import './CountdownTimer.css';

// Renders the remaining time on a booking's lockExpiry (set by
// event-service when seats are locked — see eventController.lockSeats).
export default function CountdownTimer({ expiresAt, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt) - new Date());
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      setRemainingMs(diff);
      if (diff <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const clamped = Math.max(0, remainingMs);
  const minutes = Math.floor(clamped / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const isUrgent = clamped < 60000;

  return (
    <div className={`countdown ${isUrgent ? 'countdown-urgent' : ''}`}>
      <span className="countdown-label">Seats held for</span>
      <span className="countdown-clock">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
