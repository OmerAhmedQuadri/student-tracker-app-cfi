import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Assignment {
  _id: string;
  title: string;
  skillId: {
    _id: string;
    name: string;
  };
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    skillId: "",
    dueDate: "",
    maxScore: 100,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, skillsRes] = await Promise.all([
        api.get("/admin/assignments"),
        api.get("/skills"),
      ]);
      setAssignments(assignmentsRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/assignments", {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
      toast.success("Assignment created successfully");
      setShowCreateModal(false);
      setFormData({ title: "", skillId: "", dueDate: "", maxScore: 100 });
      fetchData();
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await api.delete(`/admin/assignments/${id}`);
      toast.success("Assignment deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Assignments
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Create and manage assignments
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Total Assignments
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {assignments.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <ClipboardCheck className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Active
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {
                      assignments.filter(
                        (a) => new Date(a.dueDate) > new Date(),
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Skills Covered
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {skills.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <CardTitle className="text-base font-bold">
              All Assignments
            </CardTitle>
            <CardDescription className="text-xs">
              Manage assignment details and deadlines
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const isOverdue = new Date(assignment.dueDate) < new Date();
                return (
                  <div
                    key={assignment._id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-gray-900">
                            {assignment.title}
                          </h3>
                          <Badge
                            className={
                              isOverdue
                                ? "bg-red-100 text-red-700 hover:bg-red-100"
                                : "bg-green-100 text-green-700 hover:bg-green-100"
                            }
                          >
                            {isOverdue ? "Overdue" : "Active"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Trophy className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">
                              {assignment.skillId?.name || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>
                              Due:{" "}
                              {new Date(assignment.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Max Score:</span>{" "}
                            {assignment.maxScore}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {assignments.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No assignments found</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Assignment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <CardTitle className="text-lg font-bold">
                Create New Assignment
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in the assignment details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="React Basics Assignment"
                    className="h-10"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="skillId"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Skill
                  </Label>
                  <select
                    id="skillId"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                    value={formData.skillId}
                    onChange={(e) =>
                      setFormData({ ...formData, skillId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a skill</option>
                    {skills.map((skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="dueDate"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="h-10"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="maxScore"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Max Score
                  </Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    className="h-10"
                    value={formData.maxScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxScore: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Create Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
