import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          Ticket<span>X</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/events">Events</Link>
          {user && <Link to="/my-bookings">My bookings</Link>}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="navbar-user">{user.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
