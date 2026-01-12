import { useEffect, useState } from 'react';
import { History, Loader2, CheckCircle, XCircle, Clock, Calendar, Download, Filter, TrendingUp, FileText, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
    const [approvalFilter, setApprovalFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

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
        
        // Filter by approval status
        if (approvalFilter !== 'all') {
            if (approvalFilter === 'approved') {
                filtered = filtered.filter(a => a.approvedByMentor === true);
            } else if (approvalFilter === 'pending') {
                filtered = filtered.filter(a => a.approvedByMentor === false);
            }
        }
        
        setFilteredAttendance(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filterStatus, batchFilter, approvalFilter, attendance]);

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
            present: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            absent: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
            late: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock }
        };
        
        // Default to absent if status is undefined or invalid
        const safeStatus = status && status in variants ? status : 'absent';
        const config = variants[safeStatus];
        const Icon = config.icon;
        
        return (
            <Badge variant="outline" className={`${config.color} px-3 py-1`}>
                {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
            </Badge>
        );
    };

    const getAvatarColor = (index: number) => {
        const colors = [
            'bg-blue-500',
            'bg-pink-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-indigo-500',
        ];
        return colors[index % colors.length];
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.finalStatus === 'present').length,
        absent: attendance.filter(a => a.finalStatus === 'absent').length,
        late: attendance.filter(a => a.finalStatus === 'late').length,
    };

    const attendanceRate = stats.total > 0 
        ? Math.round((stats.present / stats.total) * 100) 
        : 0;

    // Pagination
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    const paginatedAttendance = filteredAttendance.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h1>
                    <p className="text-gray-600">View and manage attendance records for your batch</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <Download className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <History className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-2 border-blue-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL RECORDS</p>
                                <p className="text-5xl font-bold text-gray-900 mb-2">{stats.total}</p>
                                <p className="text-sm text-gray-600">All time attendance</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PRESENT</p>
                                <p className="text-5xl font-bold text-gray-900 mb-2">{stats.present}</p>
                                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    {attendanceRate}% attendance
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
                                <p className="text-sm text-orange-600 font-medium">Needs attention</p>
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
                                <p className="text-sm text-red-600 font-medium">Follow up required</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border border-gray-200 bg-white mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Attendance Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full border-gray-200">
                                    <SelectValue placeholder="All Statuses" />
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
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Batch</label>
                            <Select value={batchFilter} onValueChange={setBatchFilter}>
                                <SelectTrigger className="w-full border-gray-200">
                                    <SelectValue placeholder="All Batches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem>
                                    {mentorBatches.map(batch => (
                                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                                <SelectTrigger className="w-full border-gray-200">
                                    <SelectValue placeholder="All Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Approval Status</label>
                            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                <SelectTrigger className="w-full border-gray-200">
                                    <SelectValue placeholder="All Records" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Records</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Records Table */}
            <Card className="border border-gray-200 bg-white">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold">Attendance Records</CardTitle>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() => toast.success('Export functionality')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button 
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => toast.success('Print functionality')}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedAttendance.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No attendance records found</p>
                            <p className="text-sm mt-1">
                                {filterStatus === 'all' && batchFilter === 'all' && approvalFilter === 'all'
                                    ? 'Start marking attendance to see records here'
                                    : 'No records match your current filters'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 border-b border-gray-100">
                                            <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Student</TableHead>
                                            <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Session</TableHead>
                                            <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Date & Time</TableHead>
                                            <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                                            <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Approval</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedAttendance.map((record, index) => (
                                            <TableRow key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className={`w-10 h-10 ${getAvatarColor(index)}`}>
                                                            <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
                                                                {getInitials(record.userId?.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{record.userId?.name || 'Unknown'}</p>
                                                            <p className="text-sm text-gray-500">{record.userId?.email || '-'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{record.sessionId?.topic || 'Unknown Session'}</p>
                                                        <p className="text-sm text-gray-500">{record.userId?.batchId ? `Batch ${record.userId.batchId}` : '-'}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-gray-900">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        <p className="text-sm text-gray-500">{new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(record.finalStatus)}</TableCell>
                                                <TableCell>
                                                    {record.approvedByMentor ? (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                                                            Approved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAttendance.length)}</span> of{' '}
                                        <span className="font-medium">{filteredAttendance.length}</span> records
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="text-gray-600"
                                        >
                                            Previous
                                        </Button>
                                        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                                            let page;
                                            if (totalPages <= 3) {
                                                page = i + 1;
                                            } else if (currentPage === 1) {
                                                page = i + 1;
                                            } else if (currentPage === totalPages) {
                                                page = totalPages - 2 + i;
                                            } else {
                                                page = currentPage - 1 + i;
                                            }
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : "text-gray-600"}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="text-gray-600"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceHistory;
