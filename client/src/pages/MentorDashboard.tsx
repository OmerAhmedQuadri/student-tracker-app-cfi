import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileCheck, Calendar, Activity, LayoutDashboard, Presentation, GraduationCap, Clock, ChevronRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { AssignmentsTab } from '@/components/mentor/AssignmentsTab';
import { AttendanceTab } from '@/components/mentor/AttendanceTab';
import { SessionsTab } from '@/components/mentor/SessionsTab';
import * as mentorApi from '@/api/mentorApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab from path
    const getTabFromPath = () => {
        const path = location.pathname.split('/').pop();
        if (path === 'assignments') return 'assignments';
        if (path === 'attendance') return 'attendance';
        if (path === 'sessions') return 'sessions';
        return 'overview';
    };

    const activeTab = getTabFromPath();

    const [stats, setStats] = useState({
        assignmentsCount: 0,
        sessionsCount: 0,
        activeStudents: 0
    });

    useEffect(() => {
        // Fetch quick stats for overview
        const fetchStats = async () => {
            try {
                const [assignments, sessions] = await Promise.all([
                    mentorApi.getAllAssignments(),
                    mentorApi.getMentorshipSessions()
                ]);
                setStats({
                    assignmentsCount: assignments.length,
                    sessionsCount: sessions.length,
                    activeStudents: 12 // Placeholder as we don't have this API yet
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'assignments', label: 'Assignments', icon: FileCheck },
        { id: 'attendance', label: 'Attendance', icon: Users },
        { id: 'sessions', label: 'Sessions', icon: Calendar }
    ];

    const handleTabChange = (tabId: string) => {
        if (tabId === 'overview') navigate('/mentor/dashboard');
        else navigate(`/mentor/${tabId}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Mentor Dashboard</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Welcome back, {user?.name}. Manage your cohort effectively.</p>
                </div>
                
                <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50 backdrop-blur-sm relative">
                     {/* Tab Background Pill Animation could go here */}
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === tab.id
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-600' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Active Students"
                                value={stats.activeStudents.toString()}
                                icon={Users}
                                iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                trend={{ value: 0, label: "active in current batch", positive: true }}
                            />
                            <StatCard
                                title="Total Assignments"
                                value={stats.assignmentsCount.toString()}
                                icon={FileCheck}
                                iconClassName="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            />
                            <StatCard
                                title="Scheduled Sessions"
                                value={stats.sessionsCount.toString()}
                                icon={Calendar}
                                iconClassName="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            />
                            <StatCard
                                title="Avg Attendance"
                                value="85%" // Placeholder
                                icon={Activity}
                                iconClassName="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                trend={{ value: 2, label: "vs last month", positive: true }}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative group">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                                
                                <CardHeader className="relative z-10 pb-2">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Presentation className="w-5 h-5 text-indigo-200" />
                                        Cohort Overview
                                    </CardTitle>
                                    <CardDescription className="text-indigo-100">
                                        Manage your curriculum delivery and student engagement.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10 pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleTabChange('assignments')}
                                            className="group/btn bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-5 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover/btn:bg-white/30 transition-colors">
                                                <FileCheck className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="font-semibold text-lg">Grade Assignments</p>
                                            <p className="text-sm text-indigo-100/70 mt-1">Review pending submissions and provide feedback.</p>
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('sessions')}
                                            className="group/btn bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-5 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover/btn:bg-white/30 transition-colors">
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="font-semibold text-lg">Schedule Session</p>
                                            <p className="text-sm text-indigo-100/70 mt-1">Plan upcoming mentorship classes.</p>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 shadow-md h-full">
                                <CardHeader className="pb-4 border-b border-border/40">
                                    <CardTitle className="text-lg text-foreground">Action Items</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">3 Pending Approvals</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Attendance requests waiting</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto self-center" />
                                    </div>
                                    
                                    <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">Upcoming Session</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">React Patterns • Today, 4:00 PM</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto self-center" />
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/40">
                                        <Button variant="outline" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => handleTabChange('attendance')}>
                                            View All Activity
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                <div className={activeTab === 'overview' ? 'hidden' : 'block'}>
                    {activeTab === 'assignments' && <AssignmentsTab />}
                    {activeTab === 'attendance' && <AttendanceTab />}
                    {activeTab === 'sessions' && <SessionsTab />}
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;

