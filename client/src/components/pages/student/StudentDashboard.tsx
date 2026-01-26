import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";

import { BookOpen, Clock, CalendarCheck, TrendingUp, CheckCircle2, FileText, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";



import api from '@/lib/api';

interface DashboardStats {
    assignmentsPending: number;
    learningHours: number;
    attendanceCount: number;
    totalPoints: number;
}

interface Activity {
    id: string | number;
    type: 'submission' | 'attendance' | 'learning' | 'other';
    title: string;
    time: string;
    description?: string;
    metadata?: any;
}

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        assignmentsPending: 0,
        learningHours: 0,
        attendanceCount: 0,
        totalPoints: 0
    });
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [showAbsenteeAlert, setShowAbsenteeAlert] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Dashboard Data (Profile, Recent Assignments)
                const dashboardRes = await api.get('/dashboard/student');
                const { profile, recentAssignments, consecutiveAbsences } = dashboardRes.data;

                if (consecutiveAbsences) {
                    setShowAbsenteeAlert(true);
                }

                // 2. Fetch Assignments Data for "Pending" count
                const [allAssignmentsRes, myAssignmentsRes] = await Promise.all([
                    api.get('/assignments'),
                    api.get('/assignments/my')
                ]);
                const totalAssignments = allAssignmentsRes.data.length || 0;
                const submittedAssignmentsCount = myAssignmentsRes.data.length || 0;
                const pendingCount = Math.max(0, totalAssignments - submittedAssignmentsCount);

                // 3. Fetch Learning Sessions for "Learning Hours"
                const learningRes = await api.get('/sessions/learning/my');
                const learningSessions = learningRes.data || [];
                const totalMinutes = learningSessions.reduce((acc: number, curr: any) => acc + (curr.minutesSpent || 0), 0);
                const totalHours = Math.round(totalMinutes / 60);

                // 4. Fetch Attendance for "Attendance" count
                const attendanceRes = await api.get('/attendance/my');
                const attendanceRecords = attendanceRes.data || [];
                // ONLY count records where finalStatus is 'present'
                const attendanceCount = attendanceRecords.filter((a: any) => a.finalStatus === 'present').length;

                // Update Stats
                setStats({
                    assignmentsPending: pendingCount,
                    learningHours: totalHours,
                    attendanceCount: attendanceCount,
                    totalPoints: profile.totalPoints || 0
                });

                // Merge and Format Activity Feed
                const activities: Activity[] = [];

                // Add Recent Assignments (Submissions)
                recentAssignments.forEach((assignment: any) => {
                    activities.push({
                        id: `sub-${assignment._id}`,
                        type: 'submission',
                        title: `Submitted Assignment`,
                        description: assignment.assignmentId?.title || 'Unknown Assignment',
                        time: new Date(assignment.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    });
                });

                // Add Recent Learning
                learningSessions.slice(0, 3).forEach((session: any) => {
                    activities.push({
                        id: `learn-${session._id}`,
                        type: 'learning',
                        title: `Learning Session`,
                        description: `${Math.round(session.minutesSpent / 60)} hours logged`,
                        time: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    });
                });

                // Add Recent Attendance
                attendanceRecords.slice(0, 3).forEach((att: any) => {
                    let sessionDate = att.date; // fallback
                    if (att.sessionId && typeof att.sessionId === 'object') {
                        // Prefer session date/scheduledAt
                        if (att.sessionId.date) sessionDate = att.sessionId.date;
                        else if (att.sessionId.scheduledAt) sessionDate = att.sessionId.scheduledAt;
                    }

                    activities.push({
                        id: `att-${att._id}`,
                        type: 'attendance',
                        title: 'Attendance Marked',
                        description: new Date(sessionDate).toLocaleDateString(undefined, { weekday: 'long' }),
                        time: new Date(sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    });
                });

                // Sort by date (mock sort as we are mixing strings/dates, ideally use efficient real timestamps)
                // For this display, we just push them. In real app, we'd sort by actual timestamp.
                setRecentActivities(activities.slice(0, 10));

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white border-b py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2">
                            <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
                            <div className="h-4 w-96 bg-gray-200 rounded mx-auto"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'submission': return <FileText className="w-4 h-4 text-blue-600" />;
            case 'learning': return <Clock className="w-4 h-4 text-purple-600" />;
            case 'attendance': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            default: return <ArrowUpRight className="w-4 h-4 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'submission': return 'bg-blue-50';
            case 'learning': return 'bg-purple-50';
            case 'attendance': return 'bg-green-50';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header Section */}
            <div className="bg-white border-b py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
                            <p className="text-gray-500 mt-2 max-w-2xl text-lg mx-auto">
                                Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>. Here's an overview of your progress.
                            </p>
                        </div>

                        {showAbsenteeAlert && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Attendance Warning</AlertTitle>
                                <AlertDescription>
                                    You have missed the last 3 consecutive sessions. Please contact your mentor immediately to discuss your attendance.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-blue-100/50 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Assignments</p>
                                        <p className="text-2xl font-bold text-blue-700">{stats.assignmentsPending}</p>
                                        <p className="text-xs text-blue-600/80">Pending</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-purple-50/50 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-purple-100/50 rounded-lg">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">Learning</p>
                                        <p className="text-2xl font-bold text-purple-700">{stats.learningHours}h</p>
                                        <p className="text-xs text-purple-600/80">Total Hours</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50/50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-green-100/50 rounded-lg">
                                        <CalendarCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Attendance</p>
                                        <p className="text-2xl font-bold text-green-700">{stats.attendanceCount}</p>
                                        <p className="text-xs text-green-600/80">Days Present</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-orange-50/50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-orange-100/50 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-orange-900">Points</p>
                                        <p className="text-2xl font-bold text-orange-700">{stats.totalPoints}</p>
                                        <p className="text-xs text-orange-600/80">Total Earning</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 rounded-md">
                                <ArrowUpRight className="w-4 h-4 text-gray-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                        </div>


                        <div className="space-y-4">
                            {recentActivities.length === 0 ? (
                                <Card className="border-dashed shadow-sm">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No recent activity</p>
                                        <p className="text-sm text-gray-400">Your activities will appear here</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                recentActivities.map((activity) => (
                                    <Card key={activity.id} className="hover:shadow-md transition-all duration-200 group border-gray-100">
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-xl transition-colors ${getBgColor(activity.type)}`}>
                                                {getIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                                    <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
                                                </div>
                                                {activity.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Side Panel (Optional - Quick Actions or other widgets could go here) */}
                    <div className="space-y-6">
                        {/* Placeholder for future widgets or kept empty to focus clean design */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                            <h3 className="text-lg font-bold mb-2">Ready to learn?</h3>
                            <p className="text-indigo-100 text-sm mb-6">
                                Check out your latest assignments or log a new learning session.
                            </p>
                            <button
                                onClick={() => window.location.href = '/assignments'}
                                className="w-full bg-white text-indigo-600 font-medium py-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                            >
                                View Assignments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
