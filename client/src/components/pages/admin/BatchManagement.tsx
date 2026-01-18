import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Users,
  GraduationCap,
  School,
  Loader2,
  Calendar,
  Edit2,
  Trash2,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface BatchDetail {
  batchId: string;
  studentCount: number;
  mentorCount: number;
  startDate?: string;
  endDate?: string;
  description?: string;
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
    batchIds?: string[]; // For multiple batches
  }>;
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  batchIds?: string[];
}

const BatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatchId, setNewBatchId] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<{
    id: string;
    studentCount: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/batches");
      setBatches(response.data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    setLoadingMentors(true);
    try {
      const response = await api.get("/admin/mentors");
      setMentors(response.data);
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
      toast.error("Failed to load mentors");
    } finally {
      setLoadingMentors(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    fetchMentors();
  };

  const handleCreateBatch = async () => {
    if (!newBatchId.trim()) {
      toast.error("Please enter a batch ID");
      return;
    }

    if (selectedMentorIds.length === 0) {
      toast.error("Please select at least one mentor");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/batches", {
        batchId: newBatchId.trim(),
        description: description.trim(),
        mentorIds: selectedMentorIds,
        startDate,
        endDate,
      });

      toast.success("Batch created successfully");
      setShowCreateModal(false);
      setNewBatchId("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setSelectedMentorIds([]);
      fetchBatches();
    } catch (error: any) {
      console.error("Failed to create batch:", error);
      toast.error(error.response?.data?.message || "Failed to create batch");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // e.g. "Jan 1"
  };

  const formatMonthYear = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g. "Jan 2025"
  };

  const getDuration = (start?: string, end?: string) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return `${diffWeeks} Weeks`;
  };

  const handleDeleteBatch = (batchId: string, studentCount: number) => {
    console.log("Delete batch called:", { batchId, studentCount }); // Debug log

    if (studentCount > 0) {
      toast.error(
        `Cannot delete batch with ${studentCount} enrolled students. Please reassign students first.`,
        {
          duration: 5000,
        }
      );
      return;
    }

    setBatchToDelete({ id: batchId, studentCount });
    setShowDeleteDialog(true);
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/batches/${batchToDelete.id}`);
      toast.success("Batch deleted successfully");
      setShowDeleteDialog(false);
      setBatchToDelete(null);
      fetchBatches();
    } catch (error: any) {
      console.error("Failed to delete batch:", error);
      toast.error(error.response?.data?.message || "Failed to delete batch");
    } finally {
      setDeleting(false);
    }
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Batch Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of all batches and user assignments
            </p>
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Batches
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {batches.length}
                  </p>
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {batches.reduce(
                      (sum, batch) => sum + batch.studentCount,
                      0
                    )}
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Mentors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(() => {
                      const uniqueMentors = new Set();
                      batches.forEach((batch) => {
                        batch.mentors.forEach((mentor) =>
                          uniqueMentors.add(mentor._id)
                        );
                      });
                      return uniqueMentors.size;
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Cards - Redesigned for Better UX */}
        {batches.length === 0 ? (
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 text-lg font-medium">
                No batches created yet
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Assign batches to users in Manage Users
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card
                key={batch.batchId}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white cursor-pointer"
                onClick={() => navigate(`/admin/batch/${batch.batchId}`)}
              >
                {/* Header Section */}
                <CardHeader className="pb-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {batch.batchId}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      batch.endDate && new Date(batch.endDate) < new Date()
                        ? "bg-gray-100 text-gray-700 border-gray-300 px-2 py-0.5 text-xs font-semibold"
                        : "bg-green-100 text-green-700 border-green-300 px-2 py-0.5 text-xs font-semibold"
                    }
                  >
                    ●{" "}
                    {batch.endDate && new Date(batch.endDate) < new Date()
                      ? "COMPLETED"
                      : "ACTIVE"}
                  </Badge>
                  {batch.description && (
                    <CardDescription className="text-sm text-gray-600 mt-2 line-clamp-1">
                      {batch.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {/* Content */}
                <CardContent className="p-5 space-y-4">
                  {/* Start Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      Started:{" "}
                      {batch.startDate
                        ? formatMonthYear(batch.startDate)
                        : "TBD"}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center justify-between py-2.5 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Instructor
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {batch.mentors.length > 0
                        ? batch.mentors[0].name
                        : "Not Assigned"}
                    </span>
                  </div>

                  {/* Students */}
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Enrolled Students
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {batch.studentCount}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        / 30 capacity
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (batch.studentCount / 30) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </CardContent>

                {/* Action Footer */}
                <div className="px-4 pb-4 pt-2 space-y-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/batch/${batch.batchId}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      View Full Details
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBatch(batch.batchId, batch.studentCount);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Batch
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Batch
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBatchId("");
                  setDescription("");
                  setStartDate("");
                  setEndDate("");
                  setSelectedMentorIds([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-5">
                <Label
                  htmlFor="batchId"
                  className="text-sm font-medium text-gray-700"
                >
                  Batch ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="batchId"
                  placeholder="Enter batch ID (e.g., A26, B27)"
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="mt-1.5 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                  disabled={creating}
                />
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Batch description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={creating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5"
                    disabled={creating}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="endDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5"
                    disabled={creating}
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign Mentors <span className="text-red-500">*</span>
                </Label>
                {loadingMentors ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading mentors...
                    </span>
                  </div>
                ) : mentors.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
                    No mentors available. Create mentors first.
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {mentors.map((mentor) => (
                      <label
                        key={mentor._id}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMentorIds.includes(mentor._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMentorIds([
                                ...selectedMentorIds,
                                mentor._id,
                              ]);
                            } else {
                              setSelectedMentorIds(
                                selectedMentorIds.filter(
                                  (id) => id !== mentor._id
                                )
                              );
                            }
                          }}
                          disabled={creating}
                          className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {mentor.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {mentor.email}
                          </p>
                          {mentor.batchIds && mentor.batchIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mentor.batchIds.map((batchId) => (
                                <Badge
                                  key={batchId}
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-600 border-purple-200"
                                >
                                  {batchId}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {selectedMentorIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedMentorIds.length} mentor(s) selected
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBatchId("");
                    setDescription("");
                    setStartDate("");
                    setEndDate("");
                    setSelectedMentorIds([]);
                  }}
                  disabled={creating}
                  className="transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBatch}
                  disabled={
                    creating ||
                    !newBatchId.trim() ||
                    !startDate ||
                    !endDate ||
                    selectedMentorIds.length === 0
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Batch"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete Batch</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                Batch {batchToDelete?.id}
              </span>
              ? This action cannot be undone and will remove all batch
              information.
              {batchToDelete && batchToDelete.studentCount > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This batch has {batchToDelete.studentCount} enrolled
                    student{batchToDelete.studentCount > 1 ? "s" : ""}. Please
                    reassign students before deleting.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setBatchToDelete(null);
              }}
              disabled={deleting}
              className="transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteBatch}
              disabled={
                deleting ||
                (batchToDelete ? batchToDelete.studentCount > 0 : false)
              }
              className="bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Batch
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchManagement;
