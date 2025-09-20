import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">What's New</Link>
        <Link to="/">Feed</Link>
        {user && <Link to="/editor">Write</Link>}
      </div>
      <div className="nav-right">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-accent">Sign Up</Link>
          </>
        ) : (
          <div className="user-menu">
            <img src={user.avatarUrl || 'https://placehold.co/32x32'} alt="avatar" className="avatar" />
            <Link to="/profile">My Profile</Link>
            <button onClick={onLogout} className="btn-link">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
