import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar.jsx';
import Navbar from '../ui/Navbar.jsx';

const DashboardLayout = () => (
  <div className="flex h-screen bg-milk text-gray-900">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
