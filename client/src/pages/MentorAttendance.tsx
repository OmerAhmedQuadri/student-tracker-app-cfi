import { useEffect, useState } from 'react';
import { Calendar, Loader2, CheckCircle, XCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';
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
            present: { color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors', icon: CheckCircle },
            absent: { color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200 transition-colors', icon: XCircle },
            late: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 transition-colors', icon: Clock }
        };
        const config = variants[status];
        const Icon = config.icon;
        return (
            <Badge 
                variant="outline" 
                className={config.color}
                aria-label={`Status: ${status}`}
            >
                <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
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
            <div 
                className="flex items-center justify-center h-96"
                role="status"
                aria-label="Loading attendance data"
            >
                <Loader2 className="w-10 h-10 animate-spin text-slate-400" aria-hidden="true" />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
                    <p className="text-gray-600">Record student attendance for scheduled sessions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <HelpCircle className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Calendar className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card className="border-2 border-green-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PRESENT</p>
                                <p className="text-5xl font-bold text-gray-900 mb-2">{stats.present}</p>
                                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    On time
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">LATE</p>
                                <p className="text-5xl font-bold text-gray-900 mb-2">{stats.late}</p>
                                <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    After start time
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-red-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ABSENT</p>
                                <p className="text-5xl font-bold text-gray-900 mb-2">{stats.absent}</p>
                                <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    Did not attend
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Session Selection */}
            <Card className="border border-gray-200 bg-white mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Select Session</h2>
                    </div>
                    
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                                <Calendar className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No scheduled sessions</p>
                            <p className="text-sm mt-1 text-gray-500">
                                Create a session first to mark attendance
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Choose a scheduled session
                            </label>
                            <Select 
                                value={selectedSession} 
                                onValueChange={setSelectedSession}
                            >
                                <SelectTrigger className="w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                                    <SelectValue placeholder="Select a session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map(session => (
                                        <SelectItem key={session._id} value={session._id}>
                                            {session.topic} - {new Date(session.date).toLocaleDateString()} {new Date(session.date).toLocaleTimeString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Table - Only show if session is selected */}
            {selectedSession && (
                <Card className="border border-gray-200 bg-white">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Student Attendance
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                {attendance.filter(a => a.status).length} of {students.length} students marked
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 border-b border-gray-100">
                                        <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                            Name
                                        </TableHead>
                                        <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                            Email
                                        </TableHead>
                                        <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                            Batch
                                        </TableHead>
                                        <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                            Mark Attendance
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => {
                                        const attendanceRecord = attendance.find(a => a.studentId === student._id);
                                        const currentStatus = attendanceRecord?.status;
                                        
                                        return (
                                            <TableRow 
                                                key={student._id} 
                                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {student.name}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {student.email}
                                                </TableCell>
                                                <TableCell>
                                                    {student.batchId ? (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="bg-gray-100 text-gray-700 border-gray-200"
                                                        >
                                                            {student.batchId}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {currentStatus ? (
                                                        getStatusBadge(currentStatus)
                                                    ) : (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="bg-gray-100 text-gray-500 border-gray-200"
                                                        >
                                                            Not marked
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={currentStatus === 'present' ? 'default' : 'outline'}
                                                            onClick={() => handleStatusChange(student._id, 'present')}
                                                            className={`transition-all ${
                                                                currentStatus === 'present' 
                                                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                                    : 'text-green-600 hover:bg-green-50 border-green-200'
                                                            }`}
                                                        >
                                                            Present
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={currentStatus === 'late' ? 'default' : 'outline'}
                                                            onClick={() => handleStatusChange(student._id, 'late')}
                                                            className={`transition-all ${
                                                                currentStatus === 'late' 
                                                                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                                                    : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                                            }`}
                                                        >
                                                            Late
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={currentStatus === 'absent' ? 'default' : 'outline'}
                                                            onClick={() => handleStatusChange(student._id, 'absent')}
                                                            className={`transition-all ${
                                                                currentStatus === 'absent' 
                                                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                                    : 'text-red-600 hover:bg-red-50 border-red-200'
                                                            }`}
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
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500">
                                Mark attendance for all students before submitting
                            </p>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedSession || submitting}
                                className="bg-gray-900 hover:bg-gray-800 text-white transition-all"
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
            )}
        </div>
    );
};

export default MentorAttendance;