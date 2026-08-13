import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page container">
      <div className="empty-state">
        <h3>404 — page not found</h3>
        <p>That page doesn't exist. Let's get you back on track.</p>
        <Link to="/events" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Browse events
        </Link>
      </div>
    </div>
  );
}
