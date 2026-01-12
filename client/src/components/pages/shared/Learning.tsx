import React, { useEffect, useState } from 'react';
import { Clock, Loader2, BookOpen, Calendar, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface LearningSession {
    _id: string;
    date: string;
    minutesSpent: number;
    tasksCompleted: string[];
    createdAt: string;
}

const Learning = () => {
    const [sessions, setSessions] = useState<LearningSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [duration, setDuration] = useState('');
    const [tasks, setTasks] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions/learning/my');
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleLogSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/sessions/learning', {
                minutesSpent: parseInt(duration),
                date: new Date(sessionDate).toISOString(),
                tasksCompleted: tasks.split('\n').filter(t => t.trim().length > 0)
            });
            toast.success("Learning session logged!");
            setDuration('');
            setTasks('');
            fetchSessions();
        } catch (error) {
            console.error(error);
            toast.error("Failed to log session");
        } finally {
            setSubmitting(false);
        }
    };

    const totalHours = sessions.reduce((acc, curr) => acc + curr.minutesSpent, 0) / 60;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Premium Header Banner */}
            <div className="relative h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Learning Journey</h1>
                            <p className="text-indigo-100 text-base mt-1">Track your progress and celebrate growth 🚀</p>
                        </div>
                    </div>
                    
                    {/* Inline Stats */}
                    <div className="flex gap-4">
                        <div className="backdrop-blur-md bg-white/10 rounded-xl px-5 py-3 border border-white/20 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Total Time</p>
                                    <p className="text-2xl font-black text-white">{totalHours.toFixed(1)}<span className="text-sm font-normal text-white/80 ml-1">hrs</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="backdrop-blur-md bg-white/10 rounded-xl px-5 py-3 border border-white/20 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Sessions</p>
                                    <p className="text-2xl font-black text-white">{sessions.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 pb-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Log Session Form - Premium Sidebar */}
                    <div>
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Plus className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Log Session</CardTitle>
                                        <CardDescription className="text-xs">Record your learning activity</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                            <form onSubmit={handleLogSession} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="date" className="text-xs font-semibold text-gray-700">Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="date"
                                            type="date"
                                            className="pl-9 h-9 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            value={sessionDate}
                                            onChange={(e) => setSessionDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="duration" className="text-xs font-semibold text-gray-700">Duration (minutes)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <Input
                                            id="duration"
                                            type="number"
                                            placeholder="60"
                                            className="pl-9 h-9 text-sm border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tasks" className="text-xs font-semibold text-gray-700">Tasks Completed</Label>
                                    <Textarea
                                        id="tasks"
                                        placeholder="- Mastered React Hooks&#10;- Setup PostgreSQL database&#10;- Completed algorithm challenges"
                                        className="min-h-[100px] resize-none text-sm border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={tasks}
                                        onChange={(e) => setTasks(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-gray-500">One item per line</p>
                                </div>

                                <Button className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 w-4 h-4" />
                                            Logging...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Log Session
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Timeline / Feed */}
                    <div>
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Activity Timeline
                                </CardTitle>
                                <CardDescription className="text-xs">Your learning sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">

                                {sessions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                            <BookOpen className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">Start Your Journey</h3>
                                        <p className="text-sm text-gray-500 max-w-xs">Log your first session to track your progress!</p>
                                    </div>
                                )}

                                <div className="space-y-4 relative border-l-2 border-gray-200 ml-3 pl-6">
                                    {sessions.map((session) => (
                                        <div key={session._id} className="relative group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[27px] top-3 w-5 h-5 rounded-full border-3 border-white bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform shadow-md" />

                                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 group-hover:border-indigo-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                                                        <Clock className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                                                {session.minutesSpent} mins
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 bg-white rounded-lg p-3 border border-gray-100">
                                                    {session.tasksCompleted.map((task, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <p className="text-gray-700 text-xs leading-relaxed">{task}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learning;
