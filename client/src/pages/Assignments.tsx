import { useEffect, useState } from 'react';
import { Loader2, Link as LinkIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
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
}

const Assignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Submission Form State
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [timeTaken, setTimeTaken] = useState('');

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'; // Using Tailwind classes directly if "default" variants aren't set up
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
                timeTakenMinutes: parseInt(timeTaken)
            });
            toast.success("Assignment submitted successfully!");
            setTimeTaken('');
            setSelectedAssignment(null);
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Manage and track your coursework.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <CardTitle className="text-lg font-medium self-center">Current Tasks</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="Search assignments..." className="pl-9" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => {
                                const status = getSubmissionStatus(assignment._id);
                                return (
                                <TableRow key={assignment._id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>{assignment.subject || 'General'}</TableCell>
                                    <TableCell>
                                       {assignment.url && (
                                            <a href={assignment.url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                <LinkIcon className="w-3 h-3 mr-1" /> Resource
                                            </a>
                                       )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(status)} variant="outline">{status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {status === 'Pending' ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => setSelectedAssignment(assignment)}
                                                    >
                                                        Submit
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Submit: {assignment.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleSubmit} className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Time Taken (minutes)</Label>
                                                            <Input 
                                                                type="number" 
                                                                required
                                                                min="1"
                                                                value={timeTaken} 
                                                                onChange={(e) => setTimeTaken(e.target.value)} 
                                                                placeholder="e.g. 45"
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                             <Button type="submit" disabled={submitting}>
                                                                {submitting ? 'Submitting...' : 'Submit Assignment'}
                                                             </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <Button variant="ghost" size="sm" disabled>Submitted</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Assignments;
