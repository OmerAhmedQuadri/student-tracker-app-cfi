import { useEffect, useState } from 'react';
import { Calendar as CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface MentorshipSession {
    _id: string;
    topic: string; // Assuming Session schema has topic
    scheduledAt: string; // Date
    mentorName?: string;
    status: 'scheduled' | 'cancelled' | 'completed';
}

interface AttendanceRecord {
    _id: string;
    sessionId: string | MentorshipSession;
    date: string;
    status: 'present' | 'absent';
}

const Attendance = () => {
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [sessions, setSessions] = useState<MentorshipSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, sessRes] = await Promise.all([
                api.get('/attendance/my'),
                api.get('/sessions/mentorship')
            ]);
            setAttendanceHistory(attRes.data);
            setSessions(sessRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch attendance data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMarkAttendance = async (sessionId: string) => {
        setMarking(sessionId);
        try {
            await api.post('/attendance/mark', { sessionId });
            toast.success("Attendance marked!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark attendance. Session might not be active.");
        } finally {
            setMarking(null);
        }
    };

    const isAttended = (sessionId: string) => {
        return attendanceHistory.some(a =>
            (typeof a.sessionId === 'string' ? a.sessionId : a.sessionId._id) === sessionId
        );
    };

    // Calculate stats
    // const totalSessions = attendanceHistory.length; 
    // const presentCount = attendanceHistory.length; 
    // const percentage = totalSessions > 0 ? 100 : 0;

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    // Filter sessions to show "Markable" ones (e.g., today's sessions not yet marked)
    // For simplicity, showing all scheduled sessions that aren't marked
    const upcomingSessions = sessions.filter(s =>
        !isAttended(s._id) && new Date(s.scheduledAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Filter logic: Show future or recent (last 24h)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-500">Track your daily attendance record.</p>
                </div>
            </div>

            {/* Mark Attendance Section for Active Sessions */}
            {upcomingSessions.length > 0 && (
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Mark Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingSessions.map(session => (
                                <div key={session._id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                                    <div>
                                        <p className="font-semibold text-gray-900">{session.topic || 'Mentorship Session'}</p>
                                        <p className="text-sm text-gray-500">{new Date(session.scheduledAt).toLocaleString()}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleMarkAttendance(session._id)}
                                        disabled={!!marking}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {marking === session._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Present'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendanceHistory.length === 0 && <p className="text-gray-500">No attendance history.</p>}
                            {attendanceHistory.map((record) => {
                                const sessionTopic = typeof record.sessionId === 'object' ? record.sessionId.topic : 'Session';
                                return (
                                    <div key={record._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full bg-green-50 text-green-600`}>
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{sessionTopic}</p>
                                                <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()} • {new Date(record.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className='text-green-600 bg-green-50 border-green-100'>
                                            Present
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                            <div className="text-4xl font-bold text-blue-600 mb-1">{attendanceHistory.length}</div>
                            <div className="text-sm font-medium text-gray-600">Sessions Attended</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Attendance;
