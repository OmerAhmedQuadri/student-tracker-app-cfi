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
                                path: 'assignments',
                                element: <MentorDashboard />,
                            },
                            {
                                path: 'attendance',
                                element: <MentorDashboard />,
                            },
                            {
                                path: 'sessions',
                                element: <MentorDashboard />,
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

