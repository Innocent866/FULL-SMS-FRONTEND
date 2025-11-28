import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex items-center justify-between border-b border-softGrey bg-milk px-8 py-4">
      <div>
        <p className="text-sm text-gray-500">Welcome back</p>
        <h2 className="text-xl font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* <span className="rounded-full bg-sidebar/10 px-3 py-1 text-xs font-semibold text-sidebar">{user?.role}</span> */}
        {/* <img src={user?.avatarUrl || 'https://i.pravatar.cc/60'} alt="avatar" className="h-10 w-10 rounded-full object-cover" /> */}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-sidebar/20 bg-white px-4 py-2 text-sm font-semibold text-sidebar transition hover:bg-sidebar hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
