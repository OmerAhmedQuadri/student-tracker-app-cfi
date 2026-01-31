import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Root from './components/layout/Root';

// Lazy load components
const Assignments = lazy(() => import('./components/pages/shared/Assignments'));
const Attendance = lazy(() => import('./components/pages/shared/Attendance'));
const Learning = lazy(() => import('./components/pages/shared/Learning'));
const Profile = lazy(() => import('./components/pages/shared/Profile'));
const Login = lazy(() => import('./components/pages/shared/Login'));
const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));
const StudentDashboard = lazy(() => import('./components/pages/student/StudentDashboard'));
const MentorDashboard = lazy(() => import('./components/pages/mentor/MentorDashboard'));
const MentorAttendance = lazy(() => import('./components/pages/mentor/MentorAttendance'));
const MentorStudents = lazy(() => import('./components/pages/mentor/MentorStudents'));
const MentorBatches = lazy(() => import('./components/pages/mentor/MentorBatches'));
const AttendanceHistory = lazy(() => import('./components/pages/mentor/AttendanceHistory'));
const UsersManagement = lazy(() => import('./components/pages/admin/Users'));
const AdminSessions = lazy(() => import('./components/pages/admin/Sessions'));
const AdminAttendance = lazy(() => import('./components/pages/admin/Attendance'));
const AdminCreateUsers = lazy(() => import('./components/pages/admin/CreateUsers'));
const BatchManagement = lazy(() => import('./components/pages/admin/BatchManagement'));
const BatchDetails = lazy(() => import('./components/pages/admin/BatchDetails'));
const MentorExternalActivities = lazy(() => import('./components/pages/mentor/ExternalActivities'));
const DailyProgress = lazy(() => import('./components/pages/mentor/DailyProgress'));
const Notifications = lazy(() => import('./components/pages/shared/Notifications'));
const ExternalActivitiesPage = lazy(() => import('./components/pages/shared/ExternalActivities'));
const Leaderboard = lazy(() => import('./components/pages/shared/Leaderboard'));

// Loading Fallback
const PageLoader = () => (
    <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
);

const Loadable = (Component: React.ComponentType<any>) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: 'login',
                element: Loadable(Login),
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
                                element: Loadable(AdminDashboard),
                            },
                            {
                                path: 'users',
                                element: Loadable(UsersManagement),
                            },
                            {
                                path: 'create-users',
                                element: Loadable(AdminCreateUsers),
                            },
                            {
                                path: 'batches',
                                element: Loadable(BatchManagement),
                            },
                            {
                                path: 'batch/:batchId',
                                element: Loadable(BatchDetails),
                            },
                            {
                                path: 'sessions',
                                element: Loadable(AdminSessions),
                            },
                            {
                                path: 'attendance',
                                element: Loadable(AdminAttendance),
                            },
                            {
                                path: 'profile',
                                element: Loadable(Profile),
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
                                element: Loadable(StudentDashboard),
                            },
                            {
                                path: 'external-activities',
                                element: Loadable(ExternalActivitiesPage),
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
                                element: Loadable(MentorDashboard),
                            },
                            {
                                path: 'students',
                                element: Loadable(MentorStudents),
                            },
                            {
                                path: 'batches',
                                element: Loadable(MentorBatches),
                            },
                            {
                                path: 'assignments',
                                element: Loadable(MentorDashboard),
                            },
                            {
                                path: 'attendance',
                                element: Loadable(MentorAttendance),
                            },
                            {
                                path: 'attendance/history',
                                element: Loadable(AttendanceHistory),
                            },
                            {
                                path: 'sessions',
                                element: Loadable(MentorDashboard),
                            },
                            {
                                path: 'external-activities',
                                element: Loadable(MentorExternalActivities),
                            },
                            {
                                path: 'daily-progress',
                                element: Loadable(DailyProgress),
                            },
                            {
                                path: 'profile',
                                element: Loadable(Profile),
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
                                element: Loadable(Assignments),
                            },
                            {
                                path: 'attendance',
                                element: Loadable(Attendance),
                            },
                            {
                                path: 'learning',
                                element: Loadable(Learning),
                            },

                            {
                                path: 'profile',
                                element: Loadable(Profile),
                            },
                            {
                                path: 'leaderboard',
                                element: Loadable(Leaderboard),
                            },
                            {
                                path: 'notifications',
                                element: Loadable(Notifications),
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

