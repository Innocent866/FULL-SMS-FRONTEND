import { useMemo } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/Login.jsx';
import ParentSignup from '../pages/parent/Signup.jsx';
import ParentDashboard from '../pages/parent/Dashboard.jsx';
import ParentChildrenPage from '../pages/parent/Children.jsx';
import ParentAnnouncementsPage from '../pages/parent/Announcements.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';
import StudentProfilePage from '../pages/student/Profile.jsx';
import StudentAcademicsPage from '../pages/student/Academics.jsx';
import StudentResultsPage from '../pages/student/Results.jsx';
import StudentAttendancePage from '../pages/student/Attendance.jsx';
import StudentTimetablePage from '../pages/student/Timetable.jsx';
import StudentAssignmentsPage from '../pages/student/Assignments.jsx';
import StudentFeesPage from '../pages/student/Fees.jsx';
import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import TeacherWorkspace from '../pages/teacher/Workspace.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminTeachersPage from '../pages/admin/Teachers.jsx';
import AdminStudentsPage from '../pages/admin/Students.jsx';
import AdminAnnouncementsPage from '../pages/admin/Announcements.jsx';
import AdminTimetablePage from '../pages/admin/Timetable.jsx';
import AdminAccountsPage from '../pages/admin/Accounts.jsx';
import AdminAcademicsPage from '../pages/admin/Academics.jsx';
import AdminSubjectsPage from '../pages/admin/Subjects.jsx';
import AdminAssessmentsPage from '../pages/admin/Assessments.jsx';
import FeesPage from '../pages/common/Fees.jsx';
import AttendancePage from '../pages/common/Attendance.jsx';
import AssignmentsPage from '../pages/common/Assignments.jsx';
import AnnouncementsPage from '../pages/common/Announcements.jsx';
import TimetablePage from '../pages/common/Timetable.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const AppRoutes = () => {
  const { user } = useAuth();
  const routes = useMemo(
    () => [
      {
        element: <AuthLayout />,
        children: [
          { path: '/', element: <Navigate to="/login" replace /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/parent/signup', element: <ParentSignup /> }
        ]
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: '/parent/dashboard', element: <ParentDashboard />, roles: ['parent'] },
          { path: '/children', element: <ParentChildrenPage />, roles: ['parent'] },
          { path: '/parent/announcements', element: <ParentAnnouncementsPage />, roles: ['parent'] },
          { path: '/student/dashboard', element: <StudentDashboard />, roles: ['student'] },
          { path: '/student/profile', element: <StudentProfilePage />, roles: ['student'] },
          { path: '/student/academics', element: <StudentAcademicsPage />, roles: ['student'] },
          { path: '/student/results', element: <StudentResultsPage />, roles: ['student'] },
          { path: '/student/attendance', element: <StudentAttendancePage />, roles: ['student'] },
          { path: '/student/timetable', element: <StudentTimetablePage />, roles: ['student'] },
          { path: '/student/assignments', element: <StudentAssignmentsPage />, roles: ['student'] },
          { path: '/student/fees', element: <StudentFeesPage />, roles: ['student'] },
          { path: '/teacher/dashboard', element: <TeacherDashboard />, roles: ['teacher'] },
          { path: '/teacher/workspace', element: <TeacherWorkspace />, roles: ['teacher'] },
          { path: '/admin/dashboard', element: <AdminDashboard />, roles: ['admin'] },
          { path: '/admin/teachers', element: <AdminTeachersPage />, roles: ['admin'] },
          { path: '/admin/students', element: <AdminStudentsPage />, roles: ['admin'] },
          { path: '/admin/announcements', element: <AdminAnnouncementsPage />, roles: ['admin'] },
          { path: '/admin/timetable', element: <AdminTimetablePage />, roles: ['admin'] },
          { path: '/admin/accounts', element: <AdminAccountsPage />, roles: ['admin'] },
          { path: '/admin/academics', element: <AdminAcademicsPage />, roles: ['admin'] },
          { path: '/admin/subjects', element: <AdminSubjectsPage />, roles: ['admin'] },
          { path: '/admin/assessments', element: <AdminAssessmentsPage />, roles: ['admin'] },
          { path: '/fees', element: <FeesPage />, roles: ['parent', 'admin'] },
          { path: '/attendance', element: <AttendancePage />, roles: ['parent', 'teacher', 'admin', 'student'] },
          { path: '/assignments', element: <AssignmentsPage />, roles: ['parent', 'teacher', 'student'] },
          { path: '/announcements', element: <AnnouncementsPage />, roles: ['parent', 'teacher', 'student', 'admin'] },
          { path: '/timetable', element: <TimetablePage />, roles: ['parent', 'teacher', 'student'] }
        ].map((route) => ({
          path: route.path,
          element: route.roles && user && !route.roles.includes(user.role)
            ? <Navigate to={`/${user.role}/dashboard`} replace />
            : route.element
        }))
      },
      { path: '*', element: <Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace /> }
    ],
    [user]
  );

  return useRoutes(routes);
};

export default AppRoutes;
