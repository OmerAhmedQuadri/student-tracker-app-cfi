import { useEffect, useState } from 'react';
import { Users, Loader2, Mail, Activity, AlertCircle, TrendingUp, Clock, Filter, Search, MoreVertical, UserPlus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Student {
    _id: string;
    name: string;
    email: string;
    batchId?: string;
    status: 'pending' | 'active' | 'suspended';
    createdAt: string;
}

const MentorStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterBatch, setFilterBatch] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        let filtered = students;
        
        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(s => s.status === filterStatus);
        }
        
        // Filter by batch
        if (filterBatch !== 'all') {
            filtered = filtered.filter(s => s.batchId === filterBatch);
        }
        
        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filterStatus, filterBatch, searchQuery, students]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mentor/students');
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: 'pending' | 'active' | 'suspended') => {
        const variants = {
            active: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            suspended: 'bg-red-100 text-red-700 border-red-200'
        };
        return (
            <Badge variant="outline" className={`${variants[status]} px-3 py-1 text-xs font-medium`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const uniqueBatches = Array.from(new Set(students.map(s => s.batchId).filter(Boolean)));

    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        pending: students.filter(s => s.status === 'pending').length,
        suspended: students.filter(s => s.status === 'suspended').length,
    };

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleApplyFilters = () => {
        toast.success('Filters applied');
    };

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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
                <p className="text-gray-600">Manage your batch, track progress, and monitor status.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-2 border-blue-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL STUDENTS</p>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</p>
                                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    +12% this month
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ACTIVE NOW</p>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{stats.active}</p>
                                <p className="text-sm text-gray-500">Currently enrolled</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PENDING</p>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{stats.pending}</p>
                                <p className="text-sm text-orange-600 font-medium">Awaiting approval</p>
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
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SUSPENDED</p>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{stats.suspended}</p>
                                <p className="text-sm text-red-600 font-medium">Action required</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Filters and Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Filters Card */}
                    <Card className="bg-white">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Filter className="w-4 h-4" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Batch ID</label>
                                <Select value={filterBatch} onValueChange={setFilterBatch}>
                                    <SelectTrigger className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {uniqueBatches.map(batch => (
                                            <SelectItem key={batch} value={batch || ''}>{batch}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button 
                                onClick={handleApplyFilters}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Apply Filters
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                            <p className="text-sm text-indigo-100 mb-6">Send announcements or review pending requests.</p>
                            <div className="space-y-3">
                                <Button 
                                    variant="secondary" 
                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={() => toast.success('Message all functionality')}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Message All
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="w-full bg-white hover:bg-gray-50 text-indigo-600 border-0"
                                    onClick={() => toast.success('Add student functionality')}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Student
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Main Content - Student List */}
                <div className="lg:col-span-3">
                    <Card className="bg-white">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle className="text-xl font-bold">Student List</CardTitle>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {paginatedStudents.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No students found</p>
                                    <p className="text-sm mt-1">
                                        {filterStatus === 'all' && filterBatch === 'all' && !searchQuery
                                            ? 'No students assigned to your batch yet'
                                            : 'No students match your current filters'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 border-b border-gray-100">
                                                    <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Student</TableHead>
                                                    <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Batch</TableHead>
                                                    <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                                                    <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Joined</TableHead>
                                                    <TableHead className="font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedStudents.map((student, index) => (
                                                    <TableRow key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className={`w-10 h-10 ${getAvatarColor(index)}`}>
                                                                    <AvatarFallback className="bg-transparent text-white font-semibold">
                                                                        {getInitials(student.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{student.name}</p>
                                                                    <p className="text-sm text-gray-500">{student.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 font-medium">
                                                            {student.batchId || <span className="text-gray-400 italic">Unassigned</span>}
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                                                        <TableCell className="text-gray-600">
                                                            {new Date(student.createdAt).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric' 
                                                            })}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => toast.success('View details')}>
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => toast.success('Send message')}>
                                                                        Send Message
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => toast.success('View progress')}>
                                                                        View Progress
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
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
                                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                                                <span className="font-medium">{filteredStudents.length}</span> results
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
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : "text-gray-600"}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
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
            </div>
        </div>
    );
};

export default MentorStudents;
