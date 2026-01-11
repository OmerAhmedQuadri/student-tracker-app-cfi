import { useEffect, useState } from 'react';
import { Calendar, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllStudents, getAllSessions } from '@/api/mentorApis';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Student {
    _id: string;
    name: string;
    email: string;
    batchId?: string;
}

interface Session {
    _id: string;
    topic: string;
    date: string;
    status: 'scheduled' | 'cancelled' | 'completed';
}

interface AttendanceStatus {
    studentId: string;
    status?: 'present' | 'absent' | 'late';
}

const MentorAttendance = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, sessionsData] = await Promise.all([
                getAllStudents(),
                getAllSessions()
            ]);
            
            console.log('Students:', studentsData);
            console.log('Sessions:', sessionsData);
            
            setStudents(studentsData);
            
            // Filter scheduled sessions
            const scheduledSessions = Array.isArray(sessionsData) 
                ? sessionsData.filter((s: Session) => s.status === 'scheduled')
                : [];
            
            setSessions(scheduledSessions);
            
            // Initialize attendance without default status
            if (studentsData.length > 0) {
                setAttendance(studentsData.map((student: Student) => ({
                    studentId: student._id,
                    status: undefined
                })));
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch data';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setAttendance(prev =>
            prev.map(a =>
                a.studentId === studentId ? { ...a, status } : a
            )
        );
    };

    const handleSubmit = async () => {
        if (!selectedSession) {
            toast.error('Please select a session');
            return;
        }

        // Check if all students have a status selected
        const unselectedStudents = attendance.filter(a => !a.status);
        if (unselectedStudents.length > 0) {
            toast.error('Please mark attendance for all students');
            return;
        }

        setSubmitting(true);
        try {
            console.log('Submitting attendance for session:', selectedSession);
            console.log('Attendance data:', attendance);
            
            // Submit attendance for each student
            const promises = attendance.map(a => {
                console.log('Marking attendance:', {
                    sessionId: selectedSession,
                    studentId: a.studentId,
                    status: a.status
                });
                return api.post('/mentor/attendance/mark', {
                    sessionId: selectedSession,
                    studentId: a.studentId,
                    status: a.status
                });
            });
            
            await Promise.all(promises);
            
            toast.success('Attendance marked successfully');
            
            // Reset to no status for all
            setAttendance(students.map(student => ({
                studentId: student._id,
                status: undefined
            })));
            setSelectedSession('');
        } catch (error: any) {
            console.error('Attendance submission error:', error);
            console.error('Error response:', error?.response?.data);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mark attendance';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
        const variants = {
            present: { color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle },
            absent: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
            late: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', icon: Clock }
        };
        const config = variants[status];
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const stats = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Mark Attendance</h1>
                        <p className="text-purple-100">Record student attendance for sessions</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <Calendar className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-green-100 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Present</p>
                                <p className="text-3xl font-bold text-green-700">{stats.present}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-100 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Late</p>
                                <p className="text-3xl font-bold text-yellow-700">{stats.late}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-100 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Absent</p>
                                <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Session Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Session</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No scheduled sessions available</p>
                            <p className="text-sm mt-1">Create a session first to mark attendance</p>
                        </div>
                    ) : (
                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a session" />
                            </SelectTrigger>
                            <SelectContent>
                                {sessions.map(session => (
                                    <SelectItem key={session._id} value={session._id}>
                                        {session.topic} - {new Date(session.date).toLocaleDateString()} {new Date(session.date).toLocaleTimeString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => {
                                const attendanceRecord = attendance.find(a => a.studentId === student._id);
                                const currentStatus = attendanceRecord?.status;
                                
                                return (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-gray-600">{student.email}</TableCell>
                                        <TableCell>
                                            {student.batchId ? (
                                                <Badge variant="outline">{student.batchId}</Badge>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {currentStatus ? (
                                                getStatusBadge(currentStatus)
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                                    Not marked
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={currentStatus === 'present' ? 'default' : 'outline'}
                                                    onClick={() => handleStatusChange(student._id, 'present')}
                                                    className={currentStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={currentStatus === 'late' ? 'default' : 'outline'}
                                                    onClick={() => handleStatusChange(student._id, 'late')}
                                                    className={currentStatus === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                                >
                                                    Late
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={currentStatus === 'absent' ? 'default' : 'outline'}
                                                    onClick={() => handleStatusChange(student._id, 'absent')}
                                                    className={currentStatus === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                >
                                                    Absent
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedSession || submitting}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Attendance'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MentorAttendance;
