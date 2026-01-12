import { useEffect, useState } from 'react';
import { Layers, Users, GraduationCap, School, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface BatchDetail {
    batchId: string;
    studentCount: number;
    mentorCount: number;
    students: Array<{
        _id: string;
        name: string;
        email: string;
        isActive: boolean;
    }>;
    mentors: Array<{
        _id: string;
        name: string;
        email: string;
        isActive: boolean;
    }>;
}

const BatchManagement = () => {
    const [batches, setBatches] = useState<BatchDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/batches');
            setBatches(response.data);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const toggleBatchExpansion = (batchId: string) => {
        setExpandedBatches(prev => ({
            ...prev,
            [batchId]: !prev[batchId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">Loading batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
                            <p className="mt-1 text-sm text-gray-500">Overview of all batches and user assignments</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Layers className="w-4 h-4 mr-2" />
                                Create New Batch
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Batches</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{batches.length}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {batches.reduce((sum, batch) => sum + batch.studentCount, 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Mentors</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {batches.reduce((sum, batch) => sum + batch.mentorCount, 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <School className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Batch Cards */}
                {batches.length === 0 ? (
                    <Card className="shadow-sm border border-gray-200">
                        <CardContent className="p-12 text-center">
                            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Layers className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 text-lg font-medium">No batches created yet</p>
                            <p className="text-gray-500 text-sm mt-2">Assign batches to users in Manage Users</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map((batch) => (
                            <Card key={batch.batchId} className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
                                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-base px-3 py-1">
                                            {batch.batchId}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white">
                                            {batch.studentCount + batch.mentorCount} users
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    {/* Mentors Section */}
                                    <div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer mb-3"
                                            onClick={() => toggleBatchExpansion(`mentors-${batch.batchId}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <School className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase">Mentors</p>
                                                    <p className="text-sm font-bold text-gray-900">{batch.mentorCount} assigned</p>
                                                </div>
                                            </div>
                                            {expandedBatches[`mentors-${batch.batchId}`] ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className={`space-y-2 pl-2 ${expandedBatches[`mentors-${batch.batchId}`] ? 'block' : 'hidden'}`}>
                                            {batch.mentors.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic py-2">No mentors assigned</p>
                                            ) : (
                                                batch.mentors.map(mentor => (
                                                    <div key={mentor._id} className="flex items-center justify-between py-1.5 px-2 bg-purple-50/50 rounded hover:bg-purple-50 transition-colors">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{mentor.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{mentor.email}</p>
                                                        </div>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={mentor.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500'}
                                                        >
                                                            {mentor.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {!expandedBatches[`mentors-${batch.batchId}`] && batch.mentors.length > 0 && (
                                            <p className="text-xs text-gray-400 pl-2">
                                                {batch.mentors.length === 1 
                                                    ? '1 mentor' 
                                                    : `${batch.mentors.length} mentors`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Students Section */}
                                    <div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer mb-3"
                                            onClick={() => toggleBatchExpansion(`students-${batch.batchId}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase">Students</p>
                                                    <p className="text-sm font-bold text-gray-900">{batch.studentCount} enrolled</p>
                                                </div>
                                            </div>
                                            {expandedBatches[`students-${batch.batchId}`] ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className={`space-y-2 pl-2 ${expandedBatches[`students-${batch.batchId}`] ? 'block' : 'hidden'}`}>
                                            {batch.students.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic py-2">No students enrolled</p>
                                            ) : (
                                                batch.students.map(student => (
                                                    <div key={student._id} className="flex items-center justify-between py-1.5 px-2 bg-blue-50/50 rounded hover:bg-blue-50 transition-colors">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                                        </div>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={student.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500'}
                                                        >
                                                            {student.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {!expandedBatches[`students-${batch.batchId}`] && batch.students.length > 0 && (
                                            <p className="text-xs text-gray-400 pl-2">
                                                {batch.students.length === 1 
                                                    ? '1 student' 
                                                    : `${batch.students.length} students`}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchManagement;