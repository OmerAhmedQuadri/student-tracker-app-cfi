import { useEffect, useState } from 'react';
import { Users, Loader2, Mail, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (filterStatus === 'all') {
            setFilteredStudents(students);
        } else {
            setFilteredStudents(students.filter(s => s.status === filterStatus));
        }
    }, [filterStatus, students]);

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
            active: 'bg-green-50 text-green-600 border-green-100',
            pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            suspended: 'bg-red-50 text-red-600 border-red-100'
        };
        return (
            <Badge variant="outline" className={variants[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        pending: students.filter(s => s.status === 'pending').length,
        suspended: students.filter(s => s.status === 'suspended').length,
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
                        <h1 className="text-3xl font-bold mb-2">My Students</h1>
                        <p className="text-purple-100">View and manage students in your batch</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <Users className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-blue-100 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Students</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-100 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Active</p>
                                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
                            </div>
                            <Award className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-100 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                            </div>
                            <Mail className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-100 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Suspended</p>
                                <p className="text-3xl font-bold text-red-700">{stats.suspended}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-sm mt-1">
                                {filterStatus === 'all' 
                                    ? 'No students assigned to your batch yet'
                                    : `No ${filterStatus} students in your batch`}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map(student => (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {student.email}
                                        </TableCell>
                                        <TableCell>
                                            {student.batchId ? (
                                                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                                                    {student.batchId}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No batch</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                                        <TableCell className="text-gray-600">
                                            {new Date(student.createdAt).toLocaleDateString()}
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

export default MentorStudents;
