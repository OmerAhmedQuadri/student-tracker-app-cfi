import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  ArrowLeft,
  GraduationCap,
  School,
  CalendarDays,
  Github,
  Edit,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
}

interface BatchData {
  batchId: string;
  studentCount: number;
  mentorCount: number;
  students: Student[];
  mentors: Mentor[];
  startDate?: string;
  endDate?: string;
  description?: string;
  githubLink?: string;
}

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    startDate: "",
    endDate: "",
    description: "",
    githubLink: "",
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const res = await api.get(`/admin/batches/${batchId}`);
        setBatchData(res.data);
        if (res.data) {
          setEditData({
            startDate: res.data.startDate ? new Date(res.data.startDate).toISOString().split('T')[0] : "",
            endDate: res.data.endDate ? new Date(res.data.endDate).toISOString().split('T')[0] : "",
            description: res.data.description || "",
            githubLink: res.data.githubLink || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load batch details");
        navigate("/admin/batches");
      } finally {
        setLoading(false);
      }
    };

    if (batchId) fetchBatchDetails();
  }, [batchId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!batchData) return null;

  const filteredStudents = batchData.students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDuration = () => {
    if (!batchData.startDate || !batchData.endDate) return "N/A";
    const start = new Date(batchData.startDate);
    const end = new Date(batchData.endDate);
    const weeks = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return `${weeks} Weeks`;
  };

  const handleUpdateBatch = async () => {
    if (!batchId) return;

    // Validation
    if ((!batchData?.startDate && !editData.startDate) || (!batchData?.endDate && !editData.endDate)) {
      // If trying to fix a TBD batch, dates are required
      if (!editData.startDate || !editData.endDate) {
        toast.error("Start and End dates are required to initialize this batch");
        return;
      }
    }

    setLoadingUpdate(true);
    try {
      const res = await api.patch(`/admin/batches/${batchId}`, editData);
      setBatchData((prev) => prev ? { ...prev, ...res.data } : null);
      toast.success("Batch updated successfully");
      setShowEditModal(false);
      // Update local state is enough, no need to refetch full details usually
      // But let's resync just in case
      // window.location.reload(); 
      // Actually we updated state above.
    } catch (error: any) {
      console.error("Failed to update batch:", error);
      toast.error(error.response?.data?.message || "Failed to update batch");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/admin/batches")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Batch {batchData.batchId}
              </h1>
              <p className="text-sm text-slate-500">
                {batchData.description || "Batch overview & management"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </Button>
            <Badge className="px-4 py-1 bg-indigo-100 text-indigo-700">
              Active Batch
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Students",
              value: batchData.studentCount,
              icon: Users,
              color: "indigo",
            },
            {
              label: "Mentors",
              value: batchData.mentorCount,
              icon: School,
              color: "purple",
            },
            {
              label: "Duration",
              value: getDuration(),
              icon: CalendarDays,
              color: "blue",
            },
            {
              label: "Capacity",
              value: `${batchData.studentCount}/30`,
              icon: GraduationCap,
              color: "green",
            },

          ].map((item) => (
            <Card
              key={item.label}
              className="transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}
                >

                  <item.icon className={`h-6 w-6 text-${item.color}-600`} />

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Batch Info */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-500">Description</p>
              <p className="font-medium text-slate-900">
                {batchData.description || "No description"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Mentors</p>
              <p className="font-medium text-slate-900">
                {batchData.mentors.length
                  ? batchData.mentors.map((m) => m.name).join(", ")
                  : "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Start Date</p>
              <p className="font-medium">
                {batchData.startDate
                  ? new Date(batchData.startDate).toDateString()
                  : "Not set"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">End Date</p>
              <p className="font-medium">
                {batchData.endDate
                  ? new Date(batchData.endDate).toDateString()
                  : "Not set"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-slate-500">GitHub Repository</p>
              {batchData.githubLink ? (
                <a
                  href={batchData.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
                >
                  {batchData.githubLink}
                  <Github className="h-4 w-4" />
                </a>
              ) : (
                <p className="text-sm text-gray-500 italic">No repository linked</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {batchData.studentCount} enrolled students
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 w-[40%]">
                      Student
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 w-[30%]">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 w-[30%]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStudents.length ? (
                    filteredStudents.map((s) => (
                      <tr
                        key={s._id}
                        className="group hover:bg-indigo-50/50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-indigo-600 text-white">
                                {s.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
                                {s.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {s.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-center text-slate-600">
                          {s.phone || "—"}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Badge
                            className={
                              s.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-12 text-center text-slate-500"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Batch Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Batch description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubLink">GitHub Repository URL</Label>
              <Input
                id="githubLink"
                value={editData.githubLink}
                onChange={(e) => setEditData({ ...editData, githubLink: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={loadingUpdate}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBatch} disabled={loadingUpdate} className="bg-indigo-600 hover:bg-indigo-700">
              {loadingUpdate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default BatchDetails;
