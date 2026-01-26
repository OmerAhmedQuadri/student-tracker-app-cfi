import { useState, useEffect } from 'react';
import { Check, X, Users, Calendar, Search, Loader2 } from 'lucide-react';
import * as mentorApi from '@/api/mentorApis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Session {
    _id: string;
    topic: string;
    date: string;
    batchId: string;
}

interface AttendanceRecord {
    _id: string;
    userId: { _id: string; name: string; email: string };
    markedByStudent: boolean;
    approvedByMentor: boolean;
    finalStatus: string;
}

export const AttendanceTab = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setLoadingSessions(true);
        try {
            const data = await mentorApi.getMentorshipSessions();
            setSessions(data);
            if (data.length > 0 && !selectedSession) {
                // Optional: Pre-select first session
                // handleViewAttendance(data[0]); 
            }
        } catch (error) {
            console.error("Failed to load sessions", error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleViewAttendance = async (session: Session) => {
        setSelectedSession(session);
        setLoadingAttendance(true);
        try {
            const data = await mentorApi.getSessionAttendance(session._id);
            setAttendance(data);
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleApprove = async (id: string, approved: boolean) => {
        try {
            const updated = await mentorApi.approveAttendance(id, {
                approved,
                finalStatus: approved ? 'present' : 'absent'
            });
            setAttendance(prev => prev.map(rec => rec._id === id ? { ...rec, approvedByMentor: updated.approvedByMentor, finalStatus: updated.finalStatus } : rec));
        } catch (error) {
            console.error("Failed to update attendance", error);
        }
    };

    // Filter students
    const filteredAttendance = attendance.filter(record =>
        record.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const counts = {
        present: attendance.filter(a => a.finalStatus === 'present').length,
        absent: attendance.filter(a => a.finalStatus === 'absent').length,
        pending: attendance.filter(a => !a.finalStatus || a.finalStatus === 'pending').length
    };

    if (loadingSessions) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Sessions List */}
            <Card className="lg:col-span-4 h-full flex flex-col border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Sessions History
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Select a session to manage attendance.</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    <div className="space-y-2">
                        {sessions.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">No sessions found.</p>
                        ) : (
                            sessions.map(session => (
                                <div
                                    key={session._id}
                                    onClick={() => handleViewAttendance(session)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border duration-200 group ${selectedSession?._id === session._id
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm dark:bg-indigo-900/20 dark:border-indigo-800'
                                        : 'hover:bg-muted/50 border-transparent hover:border-border/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-medium text-sm ${selectedSession?._id === session._id ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'}`}>
                                            {session.topic}
                                        </h4>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                            {session.batchId}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        {new Date(session.date).toLocaleDateString()}
                                        <span className="text-muted-foreground/50">•</span>
                                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card>

            {/* Attendance List */}
            <div className="lg:col-span-8 h-full flex flex-col">
                {selectedSession ? (
                    <Card className="flex-1 flex flex-col shadow-md border-border/50 overflow-hidden animate-in fade-in">
                        <div className="p-4 border-b border-border/50 bg-card">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">{selectedSession.topic}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                                            {counts.present} Present
                                        </Badge>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">
                                            {counts.absent} Absent
                                        </Badge>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                                            {counts.pending} Pending
                                        </Badge>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search student..."
                                        className="pl-9 h-9 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-muted/5 p-4 overflow-y-auto custom-scrollbar">
                            {loadingAttendance ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : attendance.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No attendance records found.</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Attendance records are created when students join the session.</p>
                                </div>
                            ) : filteredAttendance.length === 0 ? (
                                <p className="text-center p-8 text-muted-foreground">No matching students found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAttendance.map(record => (
                                        <div key={record._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-card rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                                <div className="h-10 w-10 border border-border/50 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                                                    {record.userId?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{record.userId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground">{record.userId?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${record.finalStatus === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    record.finalStatus === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${record.finalStatus === 'present' ? 'bg-green-500' :
                                                        record.finalStatus === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`} />
                                                    {record.finalStatus ? record.finalStatus.charAt(0).toUpperCase() + record.finalStatus.slice(1) : 'Pending'}
                                                </div>

                                                <div className="h-6 w-px bg-border/50 hidden sm:block"></div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={record.approvedByMentor && record.finalStatus === 'present' ? "default" : "outline"}
                                                        className={`h-8 w-8 p-0 rounded-full ${record.approvedByMentor && record.finalStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`}
                                                        onClick={() => handleApprove(record._id, true)}
                                                        disabled={record.approvedByMentor && record.finalStatus === 'present'}
                                                        title="Mark Present"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={!record.approvedByMentor && record.finalStatus === 'absent' ? "destructive" : "outline"}
                                                        className={`h-8 w-8 p-0 rounded-full ${!record.approvedByMentor && record.finalStatus === 'absent' ? '' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                                                        onClick={() => handleApprove(record._id, false)}
                                                        disabled={!record.approvedByMentor && record.finalStatus === 'absent'}
                                                        title="Mark Absent"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/10 m-4 lg:m-0">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Select a Session</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Choose a mentorship session from the sidebar to view and manage student attendance.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
