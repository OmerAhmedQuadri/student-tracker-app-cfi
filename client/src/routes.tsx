import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import Learning from './pages/Learning';
import Skills from './pages/Skills';
import Activities from './pages/Activities';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MentorAttendance from './pages/MentorAttendance';
import MentorStudents from './pages/MentorStudents';
import AttendanceHistory from './pages/AttendanceHistory';
import UsersManagement from './pages/admin/Users';
import AdminSessions from './pages/admin/Sessions';
import AdminAttendance from './pages/admin/Attendance';
import AdminCreateUsers from './pages/admin/CreateUsers';
import BatchManagement from './pages/admin/BatchManagement';
import MentorExternalActivities from './pages/mentor/ExternalActivities';
import Notifications from './pages/Notifications';
import ExternalActivitiesPage from './pages/ExternalActivities';
import Leaderboard from './pages/Leaderboard';
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

