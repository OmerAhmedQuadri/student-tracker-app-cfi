import { useState, useEffect } from 'react';
import { Plus, Trash, ChevronRight, Search, FileCode, Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as mentorApi from '@/api/mentorApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Types
interface Assignment {
    _id: string;
    title: string;
    skillId: { _id: string; name: string } | string;
    dueDate: string;
    description?: string;
    maxScore: number;
}

interface Submission {
    _id: string;
    userId: { _id: string; name: string; email: string };
    status: string;
    submittedAt: string;
    score?: number;
    timeTakenMinutes?: number;
}

export const AssignmentsTab = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        skillId: '',
        dueDate: '',
        maxScore: 100
    });

    // Score input state for each submission row
    const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        setLoading(true);
        try {
            const data = await mentorApi.getAllAssignments();
            setAssignments(data);
            if (data.length > 0 && !selectedAssignment) {
                // Optionally select the first one, or wait for user interaction
                // setSelectedAssignment(data[0]); 
            }
        } catch (error) {
            console.error("Failed to load assignments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mentorApi.createAssignment(formData);
            setIsCreating(false);
            setFormData({ title: '', skillId: '', dueDate: '', maxScore: 100 });
            loadAssignments();
        } catch (error) {
            console.error("Failed to create assignment", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the assignment and all student submissions.")) return;
        try {
            await mentorApi.deleteAssignment(id);
            if (selectedAssignment?._id === id) setSelectedAssignment(null);
            loadAssignments();
        } catch (error) {
            console.error("Failed to delete assignment", error);
        }
    };

    const handleSelectAssignment = async (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setLoadingSubmissions(true);
        try {
            const data = await mentorApi.getSubmissionsForAssignment(assignment._id);
            setSubmissions(data);
            // Reset score inputs
            setScoreInputs({});
        } catch (error) {
            console.error("Failed to load submissions", error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleGrade = async (submissionId: string) => {
        const scoreVal = scoreInputs[submissionId];
        if (!scoreVal) return;
        
        const score = Number(scoreVal);
        if (isNaN(score)) return;

        try {
            await mentorApi.gradeAssignment(submissionId, score);
            setSubmissions(prev => prev.map(sub =>
                sub._id === submissionId ? { ...sub, score, status: 'graded' } : sub
            ));
            // Clear input after success
            setScoreInputs(prev => {
                const newState = { ...prev };
                delete newState[submissionId];
                return newState;
            });
        } catch (error) {
            console.error("Failed to grade", error);
        }
    };

    const filteredAssignments = assignments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Left Sidebar: List of Assignments */}
            <Card className="lg:col-span-4 h-full flex flex-col border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <FileCode className="w-5 h-5 text-indigo-600" />
                            Assignments
                        </h2>
                        <Button size="sm" onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> New
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-background border-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-3 space-y-2">
                        {loading ? (
                             <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading assignments...</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                <p>No assignments found.</p>
                                {assignments.length === 0 && <p className="text-xs mt-1">Create one to get started.</p>}
                            </div>
                        ) : (
                            filteredAssignments.map(assignment => (
                                <div
                                    key={assignment._id}
                                    onClick={() => handleSelectAssignment(assignment)}
                                    className={`group flex items-start justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                                        selectedAssignment?._id === assignment._id
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'bg-card border-transparent hover:bg-muted/50 hover:border-border/50'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <h3 className={`font-medium text-sm ${selectedAssignment?._id === assignment._id ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'}`}>
                                            {assignment.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(assignment.dueDate).toLocaleDateString()}
                                            <span>•</span>
                                            <span>max: {assignment.maxScore}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedAssignment?._id === assignment._id ? 'text-indigo-600 rotate-90' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card>

            {/* Right Side: Details or Create Form */}
            <div className="lg:col-span-8 h-full flex flex-col">
                {isCreating ? (
                    <Card className="flex-1 border-border/50 shadow-md animate-in fade-in slide-in-from-right-4">
                        <CardHeader>
                            <CardTitle>Create New Assignment</CardTitle>
                            <CardDescription>Define the task details for your students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-6 max-w-xl">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., React Component Lifecycle"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="datetime-local"
                                            required
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxScore">Max Score</Label>
                                        <Input
                                            id="maxScore"
                                            type="number"
                                            required
                                            value={formData.maxScore}
                                            onChange={e => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skillId">Associated Skill ID</Label>
                                    <Input
                                        id="skillId"
                                        placeholder="Enter Mongo ID of skill"
                                        value={formData.skillId}
                                        onChange={e => setFormData({ ...formData, skillId: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Future update: will be a dropdown.</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Assignment</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : selectedAssignment ? (
                    <Card className="flex-1 border-border/50 shadow-md flex flex-col overflow-hidden animate-in fade-in">
                        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-background">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">{selectedAssignment.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Due {new Date(selectedAssignment.dueDate).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            {selectedAssignment.maxScore} points
                                        </span>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDelete(selectedAssignment._id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">Submissions ({submissions.length})</h3>
                                {/* Add filter controls or export buttons here if needed */}
                            </div>

                            {loadingSubmissions ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                                    <FileCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground">No students have submitted this assignment yet.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border border-border/50 overflow-hidden">
                                     <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Time Taken</TableHead>
                                                <TableHead>Submitted</TableHead>
                                                <TableHead className="text-right">Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.map((sub) => (
                                                <TableRow key={sub._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{sub.userId?.name}</span>
                                                            <span className="text-xs text-muted-foreground">{sub.userId?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.status === 'graded' ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                Graded
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {sub.timeTakenMinutes ? `${sub.timeTakenMinutes}m` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {sub.status === 'graded' ? (
                                                            <div className="flex items-center justify-end gap-2 group/edit">
                                                                <span className="font-bold text-green-700">{sub.score}</span>
                                                                <span className="text-muted-foreground text-sm">/ {selectedAssignment.maxScore}</span>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 opacity-0 group-hover/edit:opacity-100 transition-opacity"
                                                                    onClick={() => setSubmissions(prev => prev.map(p => p._id === sub._id ? {...p, status: 'pending_regrade'} : p))}
                                                                >
                                                                    <span className="sr-only">Edit</span>
                                                                    <FileCode className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Input 
                                                                    className="w-20 h-8 font-medium text-right" 
                                                                    placeholder="0"
                                                                    type="number"
                                                                    value={scoreInputs[sub._id] || ''}
                                                                    onChange={(e) => setScoreInputs(prev => ({...prev, [sub._id]: e.target.value}))}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleGrade(sub._id)}
                                                                />
                                                                <Button 
                                                                    size="sm" 
                                                                    disabled={!scoreInputs[sub._id]}
                                                                    onClick={() => handleGrade(sub._id)}
                                                                    className='h-8'
                                                                >
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/10 m-4 lg:m-0">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <FileCode className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Select an Assignment</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Choose an assignment from the list to view submissions, grade students, or edit details.
                        </p>
                        <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsCreating(true)}>
                            Create New Assignment
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
