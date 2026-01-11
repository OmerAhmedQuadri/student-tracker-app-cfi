import { useEffect, useState } from 'react';
import { History, Loader2, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AttendanceRecord {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        batchId?: string;
    };
    sessionId: {
        _id: string;
        topic: string;
        date: string;
    };
    date: string;
    finalStatus: 'present' | 'absent' | 'late';
    approvedByMentor: boolean;
}

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [mentorBatches, setMentorBatches] = useState<string[]>([]);
    const [batchFilter, setBatchFilter] = useState<string>('all');

    useEffect(() => {
        fetchAttendance();
        fetchMentorBatches();
    }, []);

    useEffect(() => {
        let filtered = attendance;
        
        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(a => a.finalStatus === filterStatus);
        }
        
        // Filter by batch
        if (batchFilter !== 'all') {
            filtered = filtered.filter(a => a.userId?.batchId === batchFilter);
        }
        
        setFilteredAttendance(filtered);
    }, [filterStatus, batchFilter, attendance]);

    const fetchMentorBatches = async () => {
        try {
            const response = await api.get('/mentor/batches');
            setMentorBatches(response.data);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mentor/attendance/history');
            setAttendance(response.data);
            setFilteredAttendance(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch attendance history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: 'present' | 'absent' | 'late' | undefined) => {
        const variants = {
            present: { color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle },
            absent: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
            late: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', icon: Clock }
        };
        
        // Default to absent if status is undefined or invalid
        const safeStatus = status && status in variants ? status : 'absent';
        const config = variants[safeStatus];
        const Icon = config.icon;
        
        return (
            <Badge variant="outline" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
            </Badge>
        );
    };

    const stats = {
        total: filteredAttendance.length,
        present: filteredAttendance.filter(a => a.finalStatus === 'present').length,
        absent: filteredAttendance.filter(a => a.finalStatus === 'absent').length,
        late: filteredAttendance.filter(a => a.finalStatus === 'late').length,
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Attendance History</h1>
                        <p className="text-purple-100">View all attendance records for your batch</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <History className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-blue-100 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Records</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
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

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Filter by Batch</label>
                            <Select value={batchFilter} onValueChange={setBatchFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem>
                                    {mentorBatches.map(batch => (
                                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredAttendance.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No attendance records found</p>
                            <p className="text-sm mt-1">
                                {filterStatus === 'all' 
                                    ? 'Start marking attendance to see records here'
                                    : `No ${filterStatus} records available`}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Approved</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAttendance.map(record => (
                                    <TableRow key={record._id}>
                                        <TableCell className="font-medium">
                                            {record.userId?.name || 'Unknown'}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {record.userId?.email || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {record.sessionId?.topic || 'Unknown Session'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(record.finalStatus)}</TableCell>
                                        <TableCell>
                                            {record.approvedByMentor ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Approved
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceHistory;
