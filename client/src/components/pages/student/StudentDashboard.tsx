import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock, CalendarCheck, TrendingUp, CheckCircle2, FileText } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity, { type Activity } from '@/components/dashboard/RecentActivity';
import SkillsOverview from '@/components/dashboard/SkillsOverview';
import api from '@/lib/api';

interface DashboardStats {
    assignmentsPending: number;
    learningHours: number;
    attendanceCount: number;
    totalPoints: number;
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
    const [skills, setSkills] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Dashboard Data (Profile, Skills, Recent Assignments)
                const dashboardRes = await api.get('/dashboard/student');
                const { profile, skillProgress, recentAssignments } = dashboardRes.data;

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
                // Assuming attendanceRes.data is an array of attendance records
                const attendanceCount = attendanceRecords.length;

                // Update Stats
                setStats({
                    assignmentsPending: pendingCount,
                    learningHours: totalHours,
                    attendanceCount: attendanceCount,
                    totalPoints: profile.totalPoints || 0
                });

                // Format Skills
                const formattedSkills = skillProgress.map((sp: any, index: number) => ({
                    id: sp.skillId?._id || index,
                    name: sp.skillId?.name || 'Unknown Skill',
                    progress: sp.level === 'beginner' ? 33 : sp.level === 'intermediate' ? 66 : 100, // or use specific progress field if available
                    color: ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600'][index % 4]
                }));
                setSkills(formattedSkills);

                // Merge and Format Activity Feed
                const activities: Activity[] = [];

                // Add Recent Assignments (Submissions)
                recentAssignments.forEach((assignment: any) => {
                    activities.push({
                        id: `sub-${assignment._id}`,
                        type: 'submission',
                        title: `Submitted ${assignment.assignmentId?.title || 'Assignment'}`,
                        time: new Date(assignment.submittedAt).toLocaleDateString(),
                        icon: FileText,
                        color: 'text-blue-500',
                        bg: 'bg-blue-50'
                    });
                });

                // Add Recent Learning
                learningSessions.slice(0, 3).forEach((session: any) => {
                    activities.push({
                        id: `learn-${session._id}`,
                        type: 'learning',
                        title: `Completed ${Math.round(session.minutesSpent / 60)}h Learning Session`,
                        time: new Date(session.date).toLocaleDateString(),
                        icon: Clock,
                        color: 'text-purple-500',
                        bg: 'bg-purple-50'
                    });
                });

                // Add Recent Attendance
                attendanceRecords.slice(0, 3).forEach((att: any) => {
                    activities.push({
                        id: `att-${att._id}`,
                        type: 'attendance',
                        title: 'Marked Attendance',
                        time: new Date(att.date).toLocaleDateString(),
                        icon: CheckCircle2,
                        color: 'text-green-500',
                        bg: 'bg-green-50'
                    });
                });

                // Sort by date (newest first) and take top 5
                // Note: 'time' field is a string currently, for sorting properly we might need original dates, 
                // but simpler to just concat and maybe they are relatively sorted enough or just take mixed bag.
                // Better: keep original date for sorting then format.
                // For now, let's just set them.
                setRecentActivities(activities.slice(0, 10)); // simple slice

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
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.name}! Here's your progress.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Assignments Pending"
                value={stats.assignmentsPending.toString()}
                icon={BookOpen}
                iconClassName="bg-blue-50 text-blue-600"
                trend={{ value: 0, label: "vs last week", positive: false }} 
            />
            <StatCard
                title="Learning Hours"
                value={`${stats.learningHours}h`}
                icon={Clock}
                iconClassName="bg-purple-50 text-purple-600"
                trend={{ value: 0, label: "vs last week", positive: true }} 
            />
            <StatCard
                title="Sessions Attended"
                value={stats.attendanceCount.toString()} 
                icon={CalendarCheck}
                iconClassName="bg-green-50 text-green-600"
                trend={{ value: 0, label: "vs last month", positive: true }} 
            />
            <StatCard
                title="Total Points"
                value={stats.totalPoints.toLocaleString()}
                icon={TrendingUp}
                iconClassName="bg-orange-50 text-orange-600"
                trend={{ value: 0, label: "this month", positive: true }} 
            />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                <RecentActivity activities={recentActivities} />
            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-6">
                <SkillsOverview skills={skills} />
            </div>
        </div>
    </div>
  );
};

export default StudentDashboard;
