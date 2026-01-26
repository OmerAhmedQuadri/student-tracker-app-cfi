import { useEffect, useState, useMemo } from 'react';
import {
  Loader2,
  Link as LinkIcon,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="space-y-6 animate-pulse p-6">
        {/* Header Skeleton */}
        <div className="bg-white border-b py-8 -mx-6 -mt-6 mb-6 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments</h1>
              <p className="text-gray-500 mt-2 max-w-2xl text-lg mx-auto">
                Keep track of your coursework and submit your projects.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                    <p className="text-xs text-blue-600/80">Assignments</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50/50 border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-yellow-100/50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                    <p className="text-xs text-yellow-600/80">To Complete</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50/50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Submitted</p>
                    <p className="text-2xl font-bold text-green-700">{stats.submitted}</p>
                    <p className="text-xs text-green-600/80">Completed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50/50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-red-100/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Overdue</p>
                    <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                    <p className="text-xs text-red-600/80">Needs Attention</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">


        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value: FilterType) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-40 h-9 bg-gray-50 border-gray-200">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(value: SortType) => setSortBy(value)}
              >
                <SelectTrigger className="w-full sm:w-40 h-9 bg-gray-50 border-gray-200">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-gray-500" />
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
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Assignment
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Subject
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                        <p>No assignments found matching your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const status = getSubmissionStatus(assignment._id);
                    const urgency = getUrgencyStatus(assignment);
                    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                    const submission = getSubmission(assignment._id);

                    return (
                      <TableRow
                        key={assignment._id}
                        className="hover:bg-gray-50/50 transition-colors border-gray-100"
                      >
                        <TableCell className="align-top py-4 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="font-medium text-gray-900">
                              {assignment.title}
                            </span>
                            {assignment.description && (
                              <span className="text-xs text-gray-500 line-clamp-1 max-w-md">
                                {assignment.description}
                              </span>
                            )}
                            {assignment.url && (
                              <a
                                href={assignment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline w-fit mt-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Resource
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-center">
                          <div className="flex justify-center">
                            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700 hover:bg-gray-200">
                              {assignment.subject || "General"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm text-gray-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(assignment.dueDate)}
                            </span>
                            <Badge
                              className={`${getUrgencyColor(urgency)} text-[10px] px-1.5 py-0.5 font-medium w-fit border`}
                            >
                              {getUrgencyLabel(urgency, daysUntilDue)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="flex flex-col gap-1.5">
                            <Badge
                              className={`${getStatusColor(status)} w-fit`}
                              variant="outline"
                            >
                              {status}
                            </Badge>
                            {submission?.submittedAt && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {new Date(
                                  submission.submittedAt,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-center py-4">
                          <div className="flex justify-center flex-col items-center">
                            {status === "Pending" ? (
                              <Dialog
                                open={
                                  dialogOpen &&
                                  selectedAssignment?._id === assignment._id
                                }
                                onOpenChange={(open) => {
                                  setDialogOpen(open);
                                  if (!open) setSelectedAssignment(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 w-fit"
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
                                    <DialogTitle className="text-xl font-bold text-gray-900">
                                      Submit Assignment
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-600">
                                      {assignment.title}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 mt-4"
                                  >
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="link"
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        Assignment Link{" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id="link"
                                        type="url"
                                        required
                                        value={assignmentLink}
                                        onChange={(e) =>
                                          setAssignmentLink(e.target.value)
                                        }
                                        placeholder="https://github.com/username/repo"
                                        className="h-10"
                                      />
                                      <p className="text-xs text-gray-500 flex items-start gap-1">
                                        <LinkIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>
                                          GitHub, LinkedIn, Medium, or portfolio
                                          link
                                        </span>
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor="time"
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        Time Taken (minutes){" "}
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id="time"
                                        type="number"
                                        required
                                        min="1"
                                        value={timeTaken}
                                        onChange={(e) =>
                                          setTimeTaken(e.target.value)
                                        }
                                        placeholder="e.g. 120"
                                        className="h-10"
                                      />
                                      <p className="text-xs text-gray-500 flex items-start gap-1">
                                        <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>
                                          Estimate total time spent on this
                                          assignment
                                        </span>
                                      </p>
                                    </div>
                                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setDialogOpen(false);
                                          setSelectedAssignment(null);
                                          setAssignmentLink("");
                                          setTimeTaken("");
                                        }}
                                        disabled={submitting}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                      >
                                        {submitting ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                          </>
                                        ) : (
                                          "Submit Assignment"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Submitted
                                </Badge>
                                {submission?.assignmentLink && (
                                  <a
                                    href={submission.assignmentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View submission
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p>No assignments found</p>
              </div>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const status = getSubmissionStatus(assignment._id);
              const urgency = getUrgencyStatus(assignment);
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);


              return (
                <Card
                  key={assignment._id}
                  className="border border-gray-200 hover:border-indigo-300 transition-all shadow-sm"
                >
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="font-normal text-[10px] bg-gray-100 text-gray-600"
                          >
                            {assignment.subject || "General"}
                          </Badge>
                          <Badge
                            className={`${getUrgencyColor(urgency)} text-[10px] px-1.5 py-0 border`}
                          >
                            {getUrgencyLabel(urgency, daysUntilDue)}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        className={getStatusColor(status)}
                        variant="outline"
                      >
                        {status}
                      </Badge>
                    </div>

                    {assignment.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {assignment.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-sm pt-2 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{formatDate(assignment.dueDate)}</span>
                      </div>
                      {assignment.url && (
                        <a
                          href={assignment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Resource
                        </a>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      {status === "Pending" ? (
                        <Dialog
                          open={
                            dialogOpen &&
                            selectedAssignment?._id === assignment._id
                          }
                          onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) setSelectedAssignment(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setDialogOpen(true);
                              }}
                            >
                              Submit Assignment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                Submit Assignment
                              </DialogTitle>
                              <DialogDescription className="text-sm text-gray-600">
                                {assignment.title}
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={handleSubmit}
                              className="space-y-4 mt-4"
                            >
                              {/* Form fields same as desktop */}
                              <div className="space-y-2">
                                <Label htmlFor="link-mobile" className="text-sm font-medium">
                                  Assignment Link <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="link-mobile"
                                  type="url"
                                  required
                                  value={assignmentLink}
                                  onChange={(e) => setAssignmentLink(e.target.value)}
                                  placeholder="https://"
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="time-mobile" className="text-sm font-medium">
                                  Time Taken (min) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="time-mobile"
                                  type="number"
                                  required
                                  min="1"
                                  value={timeTaken}
                                  onChange={(e) => setTimeTaken(e.target.value)}
                                  placeholder="e.g. 60"
                                  className="h-10"
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  disabled={submitting}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                  {submitting ? "Submitting..." : "Submit Assignment"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submitted
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
