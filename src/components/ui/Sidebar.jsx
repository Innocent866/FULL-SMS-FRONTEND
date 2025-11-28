import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const navConfig = {
  parent: [
    { label: 'Dashboard', path: '/parent/dashboard' },
    { label: 'Children', path: '/children' },
    { label: 'Announcements', path: '/parent/announcements' },
    { label: 'Fees', path: '/fees' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Assignments', path: '/assignments' }
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher/dashboard' },
    { label: 'Workspace', path: '/teacher/workspace' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Schedule', path: '/timetable' }
  ],
  student: [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'Profile', path: '/student/profile' },
    { label: 'Academics', path: '/student/academics' },
    { label: 'Results', path: '/student/results' },
    { label: 'Attendance', path: '/student/attendance' },
    { label: 'Timetable', path: '/student/timetable' },
    { label: 'Assignments', path: '/student/assignments' },
    { label: 'Fees', path: '/student/fees' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Teachers', path: '/admin/teachers' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Academics', path: '/admin/academics' },
    { label: 'Subjects', path: '/admin/subjects' },
    { label: 'Assessments', path: '/admin/assessments' },
    { label: 'Accounts', path: '/admin/accounts' },
    { label: 'Announcements', path: '/admin/announcements' },
    { label: 'Timetable', path: '/admin/timetable' }
  ]
};

const Sidebar = () => {
  const { user } = useAuth();
  const items = navConfig[user?.role] || [];
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Guest User';

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-sidebar px-6 py-8 text-milk">
      <div className="mb-8 text-2xl font-bold">Full SMS</div>
      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          <img src={user?.avatarUrl || 'https://i.pravatar.cc/60'} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold">{fullName || 'Guest User'}</p>
            <p className="text-xs uppercase text-white/70">{user?.role || 'visitor'}</p>
          </div>
        </div>
        <div className="rounded-xl bg-sidebar/30 px-4 py-2 text-xs text-white/80">
          Manage your {user?.role || 'account'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
