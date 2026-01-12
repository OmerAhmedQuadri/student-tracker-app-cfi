import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
// import Dashboard from './components/pages/shared/Dashboard';
import Assignments from './components/pages/shared/Assignments';
import Attendance from './components/pages/shared/Attendance';
import Learning from './components/pages/shared/Learning';
import Skills from './components/pages/shared/Skills';
import Activities from './components/pages/shared/Activities';
import Profile from './components/pages/shared/Profile';
import Login from './components/pages/shared/Login';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import StudentDashboard from './components/pages/student/StudentDashboard';
import MentorDashboard from './components/pages/mentor/MentorDashboard';
import MentorAttendance from './components/pages/mentor/MentorAttendance';
import MentorStudents from './components/pages/mentor/MentorStudents';
import AttendanceHistory from './components/pages/mentor/AttendanceHistory';
import UsersManagement from './components/pages/admin/Users';
import AdminSessions from './components/pages/admin/Sessions';
import AdminAttendance from './components/pages/admin/Attendance';
import AdminCreateUsers from './components/pages/admin/CreateUsers';
import BatchManagement from './components/pages/admin/BatchManagement';
import MentorExternalActivities from './components/pages/mentor/ExternalActivities';
import Notifications from './components/pages/shared/Notifications';
import ExternalActivitiesPage from './components/pages/shared/ExternalActivities';
import Leaderboard from './components/pages/shared/Leaderboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Root from './components/layout/Root';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: 'admin',
                element: <ProtectedRoute allowedRoles={['admin']} />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: 'dashboard',
                                element: <AdminDashboard />,
                            },
                            {
                                path: 'users',
                                element: <UsersManagement />,
                            },
                            {
                                path: 'create-users',
                                element: <AdminCreateUsers />,
                            },
                            {
                                path: 'batches',
                                element: <BatchManagement />,
                            },
                            {
                                path: 'sessions',
                                element: <AdminSessions />,
                            },
                            {
                                path: 'attendance',
                                element: <AdminAttendance />,
                            },
                            {
                                path: 'profile',
                                element: <Profile />,
                            }
                        ]
                    }
                ]
            },
            {
                path: 'student',
                element: <ProtectedRoute allowedRoles={['student']} />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: 'dashboard',
                                element: <StudentDashboard />,
                            },
                            {
                                path: 'notifications',
                                element: <Notifications />,
                            },
                            {
                                path: 'external-activities',
                                element: <ExternalActivitiesPage />,
                            }
                        ]
                    }
                ]
            },
            {
                path: 'mentor',
                element: <ProtectedRoute allowedRoles={['mentor']} />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: 'dashboard',
                                element: <MentorDashboard />,
                            },
                            {
                                path: 'students',
                                element: <MentorStudents />,
                            },
                            {
                                path: 'assignments',
                                element: <MentorDashboard />,
                            },
                            {
                                path: 'attendance',
                                element: <MentorAttendance />,
                            },
                            {
                                path: 'attendance/history',
                                element: <AttendanceHistory />,
                            },
                            {
                                path: 'sessions',
                                element: <MentorDashboard />,
                            },
                            {
                                path: 'external-activities',
                                element: <MentorExternalActivities />,
                            },
                            {
                                path: 'profile',
                                element: <Profile />,
                            }
                        ]
                    }
                ]
            },
            {
                path: '',
                element: <ProtectedRoute />, // Basic auth check for shared routes
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="/login" replace />,
                            },
                            {
                                path: 'assignments',
                                element: <Assignments />,
                            },
                            {
                                path: 'attendance',
                                element: <Attendance />,
                            },
                            {
                                path: 'learning',
                                element: <Learning />,
                            },
                            {
                                path: 'skills',
                                element: <Skills />,
                            },
                            {
                                path: 'activities',
                                element: <Activities />,
                            },
                            {
                                path: 'profile',
                                element: <Profile />,
                            },
                            {
                                path: 'leaderboard',
                                element: <Leaderboard />,
                            },
                            {
                                path: 'notifications',
                                element: <Notifications />,
                            },
                        ],
                    },
                ],
            },
            {
                path: '*',
                element: <Navigate to="/login" replace />,
            }
        ]
    }
]);

