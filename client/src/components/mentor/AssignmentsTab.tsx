import { useState, useEffect } from "react";
import {
  Plus,
  Trash,
  ChevronRight,
  Search,
  FileCode,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import * as mentorApi from "@/api/mentorApis";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  description?: string;
}

interface Submission {
  _id: string;
  userId: { _id: string; name: string; email: string };
  status: string;
  submittedAt: string;
  timeTakenMinutes?: number;
  assignmentLink?: string;
}

interface Batch {
  _id?: string;
  id?: string;
  name?: string;
}

export const AssignmentsTab = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null
  );

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    batchId: "",
  });

  // Score input state for each submission row
  // const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadAssignments();
    }
  }, [selectedBatch]);

  const loadBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await api.get("/mentor/batches");
      const batchData = response.data.map((id: string) => ({ id }));
      setBatches(batchData);
      if (batchData.length > 0) {
        setSelectedBatch(batchData[0].id);
      }
    } catch (error) {
      console.error("Failed to load batches", error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadAssignments = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const data = await mentorApi.getAllAssignments();
      const filtered = data.filter((a: any) => a.batchId === selectedBatch);
      setAssignments(filtered);
      if (filtered.length > 0 && !selectedAssignment) {
        // Optionally select the first one, or wait for user interaction
        // setSelectedAssignment(filtered[0]);
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
      await mentorApi.createAssignment({
        ...formData,
        batchId: selectedBatch,
      });
      setIsCreating(false);
      setFormData({ title: "", dueDate: "", batchId: "" });
      loadAssignments();
    } catch (error) {
      console.error("Failed to create assignment", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAssignmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    try {
      await mentorApi.deleteAssignment(assignmentToDelete);
      if (selectedAssignment?._id === assignmentToDelete)
        setSelectedAssignment(null);
      loadAssignments();
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    } catch (error) {
      console.error("Failed to delete assignment", error);
    }
  };

  const handleSelectAssignment = async (assignment: Assignment) => {
    // Toggle: if clicking the same assignment, close it
    if (selectedAssignment?._id === assignment._id) {
      setSelectedAssignment(null);
      setSubmissions([]);
      return;
    }

    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const data = await mentorApi.getSubmissionsForAssignment(assignment._id);
      setSubmissions(data);
      // Reset score inputs

    } catch (error) {
      console.error("Failed to load submissions", error);
    } finally {
      setLoadingSubmissions(false);
    }
  };



  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-4">
      {/* Batch Selector */}
      {loadingBatches ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-4 bg-card border border-border/50 rounded-xl shadow-sm">
            <Label
              htmlFor="assignmentBatchSelect"
              className="text-sm font-semibold text-foreground"
            >
              Batch:
            </Label>
            <select
              id="assignmentBatchSelect"
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSelectedAssignment(null);
              }}
              className="w-full sm:w-auto sm:flex-1 sm:max-w-xs h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name || batch.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-240px)] lg:min-h-[500px]">
          {/* Left Sidebar: List of Assignments */}
          <Card className="lg:col-span-4 h-[600px] lg:h-full flex flex-col border-border/50 shadow-md overflow-hidden bg-card">
            <div className="p-4 sm:p-5 border-b border-border/50 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background">
              <div className="flex justify-between items-center gap-2 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <FileCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="font-bold text-lg sm:text-xl text-foreground">
                    Assignments
                  </h2>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCreating(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-sm h-9 px-3 sm:h-10 sm:px-4 text-sm"
                >
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 h-10 text-sm bg-background border-border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-2.5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Loading assignments...
                    </p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>No assignments found.</p>
                    {assignments.length === 0 && (
                      <p className="text-xs mt-1">Create one to get started.</p>
                    )}
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      onClick={() => handleSelectAssignment(assignment)}
                      className={`group flex items-start justify-between p-3 sm:p-4 rounded-lg cursor-pointer border transition-all duration-200 ${selectedAssignment?._id === assignment._id
                        ? "bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-300 shadow-md dark:from-indigo-900/30 dark:to-indigo-900/20 dark:border-indigo-700"
                        : "bg-card border-border/30 hover:bg-muted/50 hover:border-indigo-200 hover:shadow-sm"
                        }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-sm sm:text-base leading-tight truncate ${selectedAssignment?._id === assignment._id
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-foreground"
                            }`}
                        >
                          {assignment.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-background/60 rounded border border-border/50">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs">
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ml-1.5 sm:ml-2 ${selectedAssignment?._id === assignment._id
                          ? "text-indigo-600 rotate-90 dark:text-indigo-400"
                          : "text-muted-foreground group-hover:text-foreground"
                          }`}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Right Side: Details or Create Form */}
          <div className="lg:col-span-8 h-auto lg:h-full flex flex-col">
            {isCreating ? (
              <Card className="flex-1 border-border/50 shadow-lg animate-in fade-in overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-b border-border/50 p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Create New Assignment
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Define the task details for your students.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form
                    onSubmit={handleCreate}
                    className="space-y-5 sm:space-y-6 max-w-2xl"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold">
                        Assignment Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., React Component Lifecycle"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="dueDate"
                          className="text-sm font-semibold"
                        >
                          Due Date & Time
                        </Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          required
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dueDate: e.target.value,
                            })
                          }
                          className="h-10 sm:h-11 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-border/50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                        className="w-full sm:w-auto h-10 sm:h-11"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-sm h-10 sm:h-11"
                      >
                        Create Assignment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : selectedAssignment ? (
              <Card className="flex-1 border-border/50 shadow-lg flex flex-col overflow-hidden animate-in fade-in">
                <div className="p-4 sm:p-6 border-b border-border/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                        {selectedAssignment.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">
                            Due{" "}
                            {new Date(
                              selectedAssignment.dueDate
                            ).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(selectedAssignment._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <Trash className="w-4 h-4 mr-1 sm:mr-2" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground flex items-center gap-2">
                      <span>Submissions</span>
                      <Badge variant="secondary" className="text-sm">
                        {submissions.length}
                      </Badge>
                    </h3>
                  </div>

                  {loadingSubmissions ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                      <p className="text-sm text-muted-foreground">
                        Loading submissions...
                      </p>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10">
                      <div className="mx-auto w-fit p-4 bg-muted/50 rounded-full mb-4">
                        <FileCode className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <p className="text-base font-medium text-muted-foreground">
                        No submissions yet
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Students haven't submitted this assignment yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time Taken</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Submitted</TableHead>

                            {/* <TableHead className="text-right">Grade</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((sub) => (
                            <TableRow key={sub._id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{sub.userId?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {sub.userId?.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {sub.status === "graded" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Graded
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {sub.timeTakenMinutes
                                  ? `${sub.timeTakenMinutes}m`
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {sub.assignmentLink ? (
                                  <a
                                    href={sub.assignmentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:underline flex items-center gap-1"
                                  >
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(sub.submittedAt).toLocaleDateString()}
                              </TableCell>
                              {/*
                              <TableCell className="text-right">
                                {sub.status === "graded" ? (
                                  <div className="flex items-center justify-end gap-2 group/edit">
                                    <span className="font-bold text-green-700">
                                      {sub.score}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      / {selectedAssignment.maxScore}
                                    </span>
                                     ...
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                     ...
                                  </div>
                                )}
                              </TableCell>
                              */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 border-2 border-dashed border-border/50 rounded-xl sm:rounded-2xl bg-gradient-to-br from-muted/20 to-background">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-950/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-sm">
                  <FileCode className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Select an Assignment
                </h3>
                <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed px-4">
                  Choose an assignment from the list to view submissions, grade
                  students, or manage details.
                </p>
                <Button
                  className="mt-6 sm:mt-8 bg-indigo-600 hover:bg-indigo-700 shadow-md h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-base"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Assignment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This will
              permanently delete the assignment and all student submissions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAssignmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
