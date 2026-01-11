import { useEffect, useState } from 'react';
import { Zap, CheckCircle, XCircle, Clock, ExternalLink, Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface ExternalActivity {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    title: string;
    platform: string;
    description: string;
    url: string;
    points: number;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
}

interface Student {
    _id: string;
    name: string;
    email: string;
}

const AdminExternalActivities = () => {
    const [activities, setActivities] = useState<ExternalActivity[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchActivitiesByUser(selectedUserId);
        } else {
            setActivities([]);
            setLoading(false);
        }
    }, [selectedUserId]);

    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/mentor/students/all', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                const studentUsers = data.filter((user: any) => user.role === 'student');
                setStudents(studentUsers);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const fetchActivitiesByUser = async (userId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/mentor/external-activities/${userId}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateActivityStatus = async (activityId: string, status: 'approved' | 'rejected', points?: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/mentor/external-activities/${activityId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status, points: points || 10 })
            });

            if (res.ok) {
                setActivities(prev =>
                    prev.map(a => a._id === activityId ? { ...a, status, points: points || a.points } : a)
                );
                toast.success(`Activity ${status}`);
            }
        } catch (error) {
            console.error('Failed to update activity:', error);
            toast.error('Failed to update activity');
        }
    };

    const filteredActivities = activities
        .filter(activity => filter === 'all' || activity.status === filter)
        .filter(activity =>
            activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const stats = {
        total: activities.length,
        pending: activities.filter(a => a.status === 'pending').length,
        approved: activities.filter(a => a.status === 'approved').length,
        rejected: activities.filter(a => a.status === 'rejected').length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-yellow-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">External Activities</h1>
                            <p className="text-indigo-100 text-sm mt-1">Review and approve student external work</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.pending}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Approved</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.approved}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Rejected</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{stats.rejected}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activities List */}
                <Card className="border-none shadow-xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-bold">Activity Submissions</CardTitle>
                                <CardDescription className="text-xs">Review and manage external activities</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilter(status)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                filter === status
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-9 h-9 text-sm w-48"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading activities...</p>
                            </div>
                        ) : !selectedUserId ? (
                            <div className="p-12 text-center">
                                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Select a student</p>
                                <p className="text-gray-400 text-sm mt-2">Search and select a student by name</p>
                                <div className="mt-6 max-w-md mx-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search student by name..."
                                            value={studentSearchQuery}
                                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {studentSearchQuery && (
                                        <div className="mt-2 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                                            {students
                                                .filter(student => 
                                                    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                                    student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
                                                )
                                                .map(student => (
                                                    <button
                                                        key={student._id}
                                                        onClick={() => {
                                                            setSelectedUserId(student._id);
                                                            setStudentSearchQuery('');
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <p className="font-medium text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                    </button>
                                                ))
                                            }
                                            {students.filter(student => 
                                                student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                                student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
                                            ).length === 0 && (
                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                    No students found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="p-12 text-center">
                                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No activities found</p>
                                <p className="text-gray-400 text-sm mt-2">No external activities match your criteria</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredActivities.map((activity) => (
                                    <div key={activity._id} className="p-6 hover:bg-gray-50 transition-all">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-gray-900">{activity.title}</h3>
                                                    <Badge className="shrink-0">
                                                        {activity.platform}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(activity.status)}
                                                        <Badge className={getStatusColor(activity.status)}>
                                                            {activity.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {activity.userId.name}
                                                    </div>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(activity.submittedAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    {activity.status === 'approved' && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge className="bg-green-600 hover:bg-green-700 text-xs px-2 py-0">
                                                                +{activity.points} pts
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={activity.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                                {activity.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateActivityStatus(activity._id, 'approved', 15)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => updateActivityStatus(activity._id, 'rejected')}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminExternalActivities;
