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
  X
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
import api from "@/lib/api";
import { toast } from "react-hot-toast";

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
  const [creating, setCreating] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

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

    // Check if batch already exists
    if (
      batches.some(
        (b) => b.batchId.toLowerCase() === newBatchId.trim().toLowerCase()
      )
    ) {
      toast.error("Batch ID already exists");
      return;
    }

    setCreating(true);
    try {
      // Assign the batch to each selected mentor
      const assignmentPromises = selectedMentorIds.map((mentorId) =>
        api.patch(`/admin/mentors/${mentorId}/batches`, {
          action: "add",
          batchId: newBatchId.trim(),
        })
      );

      await Promise.all(assignmentPromises);

      toast.success(
        `Batch "${newBatchId}" created and assigned to ${selectedMentorIds.length} mentor(s)!`
      );
      setShowCreateModal(false);
      setNewBatchId("");
      setSelectedMentorIds([]);
      // Refresh batches to show the new batch
      fetchBatches();
    } catch (error) {
      console.error("Failed to create batch:", error);
      toast.error("Failed to create batch");
    } finally {
      setCreating(false);
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Batch Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of all batches and user assignments
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
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

        {/* Batch Cards */}
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
                className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden bg-white"
              >
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-bold text-lg">{batch.batchId}</h3>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mt-1">
                      In Progress
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                     <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                     </button>
                     <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                       <div className="p-2 bg-blue-50 rounded-lg h-fit">
                          <Calendar className="w-5 h-5 text-blue-600" />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-gray-900">Start Date</p>
                          <p className="text-sm text-gray-500">1 Jan 2025</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                       <div className="p-2 bg-green-50 rounded-lg h-fit">
                          <Users className="w-5 h-5 text-green-600" />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-gray-900">Instructor</p>
                          <p className="text-sm text-gray-500">
                             {batch.mentors.length > 0 ? batch.mentors[0].name : "Not Assigned"}
                             {batch.mentors.length > 1 && ` +${batch.mentors.length - 1}`}
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                     <div className="flex gap-3">
                       <div className="p-2 bg-purple-50 rounded-lg h-fit">
                          <Users className="w-5 h-5 text-purple-600" />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-gray-900">Capacity</p>
                          <p className="text-sm text-gray-500">{batch.studentCount}/60</p>
                       </div>
                    </div>
                  </div>
                </CardContent>
                
                <div className="px-5 pb-5 pt-0">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-t border-gray-100 pt-4 rounded-none h-auto"
                    onClick={() => navigate(`/admin/batch/${batch.batchId}`)}
                  >
                    Click to view details
                    <ChevronRight className="w-4 h-4" />
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
                  Batch ID
                </Label>
                <Input
                  id="batchId"
                  placeholder="Enter batch ID (e.g., A26, B27)"
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !creating && handleCreateBatch()
                  }
                  className="mt-1.5 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                  disabled={creating}
                />
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
    </div>
  );
};

export default BatchManagement;
