import { useEffect, useState, useMemo } from 'react';
import { Loader2, Link as LinkIcon, Search, Calendar, Clock, CheckCircle2, AlertCircle, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Assignment {
    _id: string;
    title: string;
    subject?: string;
    dueDate?: string;
    type?: string;
    description?: string;
    url?: string;
}

interface Submission {
    _id: string;
    assignmentId: string | Assignment;
    submittedAt: string;
    timeTakenMinutes?: number;
    assignmentLink?: string;
}

type FilterType = 'all' | 'pending' | 'submitted';
type SortType = 'dueDate' | 'title' | 'subject';

const Assignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Filters and Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('dueDate');
    
    // Submission Form State
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [timeTaken, setTimeTaken] = useState('');
    const [assignmentLink, setAssignmentLink] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allRes, myRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/assignments/my')
            ]);
            setAssignments(allRes.data);
            setMySubmissions(myRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getSubmissionStatus = (assignmentId: string) => {
        const submission = mySubmissions.find(s => 
            (typeof s.assignmentId === 'string' ? s.assignmentId : s.assignmentId._id) === assignmentId
        );
        if (submission) return 'Submitted';
        return 'Pending';
    };

    const getSubmission = (assignmentId: string) => {
        return mySubmissions.find(s => 
            (typeof s.assignmentId === 'string' ? s.assignmentId : s.assignmentId._id) === assignmentId
        );
    };

    const getDaysUntilDue = (dueDate?: string) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUrgencyStatus = (assignment: Assignment) => {
        const status = getSubmissionStatus(assignment._id);
        if (status === 'Submitted') return 'completed';
        
        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
        if (daysUntilDue === null) return 'no-deadline';
        if (daysUntilDue < 0) return 'overdue';
        if (daysUntilDue <= 2) return 'urgent';
        if (daysUntilDue <= 7) return 'upcoming';
        return 'normal';
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'urgent': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'upcoming': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getUrgencyLabel = (urgency: string, daysUntilDue: number | null) => {
        switch (urgency) {
            case 'completed': return 'Completed';
            case 'overdue': return `Overdue (${Math.abs(daysUntilDue || 0)}d ago)`;
            case 'urgent': return `Due in ${daysUntilDue}d`;
            case 'upcoming': return `${daysUntilDue} days left`;
            case 'normal': return `${daysUntilDue} days left`;
            default: return 'No deadline';
        }
    };

    // Filtered and sorted assignments
    const filteredAssignments = useMemo(() => {
        let filtered = assignments.filter(assignment => {
            // Search filter
            const matchesSearch = 
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (assignment.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (assignment.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            
            // Status filter
            const status = getSubmissionStatus(assignment._id);
            const matchesStatus = 
                statusFilter === 'all' ||
                (statusFilter === 'pending' && status === 'Pending') ||
                (statusFilter === 'submitted' && status === 'Submitted');
            
            return matchesSearch && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'subject':
                    return (a.subject || '').localeCompare(b.subject || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [assignments, searchQuery, statusFilter, sortBy, mySubmissions]);

    // Stats
    const stats = useMemo(() => {
        const total = assignments.length;
        const submitted = mySubmissions.length;
        const pending = total - submitted;
        const overdue = assignments.filter(a => {
            const daysUntilDue = getDaysUntilDue(a.dueDate);
            return daysUntilDue !== null && daysUntilDue < 0 && getSubmissionStatus(a._id) === 'Pending';
        }).length;

        return { total, submitted, pending, overdue };
    }, [assignments, mySubmissions]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
            default: return 'secondary';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        setSubmitting(true);
        try {
            await api.post('/assignments/submit', {
                assignmentId: selectedAssignment._id,
                timeTakenMinutes: parseInt(timeTaken),
                assignmentLink: assignmentLink
            });
            toast.success("Assignment submitted successfully!");
            setTimeTaken('');
            setAssignmentLink('');
            setSelectedAssignment(null);
            setDialogOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments</h1>
                    <p className="text-sm text-gray-600 mt-1">Track and submit your coursework</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.submitted}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.overdue}</p>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-semibold">Assignment List</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                {filteredAssignments.length} of {assignments.length} assignments
                            </CardDescription>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input 
                                    placeholder="Search assignments..." 
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
                                <SelectTrigger className="w-full sm:w-40 h-9">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort By */}
                            <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
                                <SelectTrigger className="w-full sm:w-40 h-9">
                                    <ArrowUpDown className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dueDate">Due Date</SelectItem>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="subject">Subject</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-200">
                                    <TableHead className="font-semibold text-gray-700">Assignment</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No assignments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssignments.map((assignment) => {
                                        const status = getSubmissionStatus(assignment._id);
                                        const urgency = getUrgencyStatus(assignment);
                                        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                                        const submission = getSubmission(assignment._id);

                                        return (
                                            <TableRow key={assignment._id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-gray-900">{assignment.title}</span>
                                                        {assignment.description && (
                                                            <span className="text-xs text-gray-500 line-clamp-1">
                                                                {assignment.description}
                                                            </span>
                                                        )}
                                                        {assignment.url && (
                                                            <a 
                                                                href={assignment.url} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline w-fit"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                View Resource
                                                            </a>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {assignment.subject || 'General'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-gray-900">{formatDate(assignment.dueDate)}</span>
                                                        <Badge className={`${getUrgencyColor(urgency)} text-xs font-medium w-fit`}>
                                                            {getUrgencyLabel(urgency, daysUntilDue)}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(status)} variant="outline">
                                                        {status}
                                                    </Badge>
                                                    {submission?.submittedAt && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {status === 'Pending' ? (
                                                        <Dialog open={dialogOpen && selectedAssignment?._id === assignment._id} onOpenChange={(open) => {
                                                            setDialogOpen(open);
                                                            if (!open) setSelectedAssignment(null);
                                                        }}>
                                                            <DialogTrigger asChild>
                                                                <Button 
                                                                    size="sm"
                                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                                    onClick={() => {
                                                                        setSelectedAssignment(assignment);
                                                                        setDialogOpen(true);
                                                                    }}
                                                                >
                                                                    Submit
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-xl font-bold">Submit Assignment</DialogTitle>
                                                                    <DialogDescription className="text-sm text-gray-600">
                                                                        {assignment.title}
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="link" className="text-sm font-medium">
                                                                            Assignment Link <span className="text-red-500">*</span>
                                                                        </Label>
                                                                        <Input 
                                                                            id="link"
                                                                            type="url" 
                                                                            required
                                                                            value={assignmentLink} 
                                                                            onChange={(e) => setAssignmentLink(e.target.value)} 
                                                                            placeholder="https://github.com/username/repo"
                                                                            className="h-10"
                                                                        />
                                                                        <p className="text-xs text-gray-500 flex items-start gap-1">
                                                                            <LinkIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                            <span>GitHub, LinkedIn, Medium, or portfolio link</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="time" className="text-sm font-medium">
                                                                            Time Taken (minutes) <span className="text-red-500">*</span>
                                                                        </Label>
                                                                        <Input 
                                                                            id="time"
                                                                            type="number" 
                                                                            required
                                                                            min="1"
                                                                            value={timeTaken} 
                                                                            onChange={(e) => setTimeTaken(e.target.value)} 
                                                                            placeholder="e.g. 120"
                                                                            className="h-10"
                                                                        />
                                                                        <p className="text-xs text-gray-500 flex items-start gap-1">
                                                                            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                            <span>Estimate total time spent on this assignment</span>
                                                                        </p>
                                                                    </div>
                                                                    <DialogFooter className="gap-2 sm:gap-0">
                                                                        <Button 
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setDialogOpen(false);
                                                                                setSelectedAssignment(null);
                                                                                setAssignmentLink('');
                                                                                setTimeTaken('');
                                                                            }}
                                                                            disabled={submitting}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button 
                                                                            type="submit" 
                                                                            disabled={submitting}
                                                                            className="bg-indigo-600 hover:bg-indigo-700"
                                                                        >
                                                                            {submitting ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                    Submitting...
                                                                                </>
                                                                            ) : 'Submit Assignment'}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                    ) : (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Button variant="ghost" size="sm" disabled className="text-green-600">
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Submitted
                                                            </Button>
                                                            {submission?.assignmentLink && (
                                                                <a 
                                                                    href={submission.assignmentLink} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    View submission
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {filteredAssignments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No assignments found
                            </div>
                        ) : (
                            filteredAssignments.map((assignment) => {
                                const status = getSubmissionStatus(assignment._id);
                                const urgency = getUrgencyStatus(assignment);
                                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                                const submission = getSubmission(assignment._id);

                                return (
                                    <Card key={assignment._id} className="border border-gray-200 hover:border-indigo-300 transition-colors">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                                                    <Badge variant="outline" className="mt-1 font-normal text-xs">
                                                        {assignment.subject || 'General'}
                                                    </Badge>
                                                </div>
                                                <Badge className={getStatusColor(status)} variant="outline">
                                                    {status}
                                                </Badge>
                                            </div>

                                            {assignment.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {assignment.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(assignment.dueDate)}</span>
                                                </div>
                                                <Badge className={`${getUrgencyColor(urgency)} text-xs`}>
                                                    {getUrgencyLabel(urgency, daysUntilDue)}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                {assignment.url && (
                                                    <a 
                                                        href={assignment.url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Resource
                                                    </a>
                                                )}
                                                <div className="flex-1"></div>
                                                {status === 'Pending' ? (
                                                    <Dialog open={dialogOpen && selectedAssignment?._id === assignment._id} onOpenChange={(open) => {
                                                        setDialogOpen(open);
                                                        if (!open) setSelectedAssignment(null);
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                size="sm"
                                                                className="bg-indigo-600 hover:bg-indigo-700"
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setDialogOpen(true);
                                                                }}
                                                            >
                                                                Submit
                                                            </Button>
                                                        </DialogTrigger>
                                                    </Dialog>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Submitted
                                                        </span>
                                                        {submission?.assignmentLink && (
                                                            <a 
                                                                href={submission.assignmentLink} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                View
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Assignments;
