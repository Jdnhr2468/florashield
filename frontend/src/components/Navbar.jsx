import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = (path) =>
    `text-sm font-medium ${
      location.pathname === path ? 'text-primary' : 'text-gray-500'
    } hover:text-primary`;

  return (
    <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">
          🌱
        </div>
        <span className="font-bold text-gray-900">FloraShield</span>
      </div>

      <div className="flex items-center gap-8">
        <Link to="/dashboard" className={linkClass('/dashboard')}>Home</Link>
        <Link to="/devices" className={linkClass('/devices')}>Devices</Link>
        <Link to="/history" className={linkClass('/history')}>History</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-primary text-xs font-bold">
            U
          </div>
          <span className="text-sm text-gray-600">user</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;