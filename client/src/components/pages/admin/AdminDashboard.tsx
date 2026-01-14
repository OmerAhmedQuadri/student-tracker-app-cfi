import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Layers,
  Edit,
  X,
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
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface DashboardStats {
  totalStudents: number;
  totalMentors: number;
  activeUsers: number;
  totalAssignments: number;
  totalSessions: number;
  pendingApprovals: number;
  totalBatches: number;
  batchDistribution: { [key: string]: number };
}

interface RecentActivity {
  _id: string;
  user: {
    name: string;
    role: string;
  };
  action: string;
  timestamp: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "mentor";
  batchId?: string; // For students
  batchIds?: string[]; // For mentors - multiple batches
  isActive: boolean;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalMentors: 0,
    activeUsers: 0,
    totalAssignments: 0,
    totalSessions: 0,
    pendingApprovals: 0,
    totalBatches: 0,
    batchDistribution: {},
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [editingBatch, setEditingBatch] = useState<{
    userId: string;
    userName: string;
    userRole: "student" | "mentor";
    currentBatch: string;
    currentBatches?: string[];
  } | null>(null);
  const [batchInput, setBatchInput] = useState("");
  const [batchesInput, setBatchesInput] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, mentorsRes, assignmentsRes, sessionsRes] =
        await Promise.all([
          api.get("/admin/students"),
          api.get("/admin/mentors"),
          api.get("/admin/assignments"),
          api.get("/admin/sessions/mentorship"),
        ]);

      const students = studentsRes.data;
      const mentors = mentorsRes.data;
      const users = [...students, ...mentors];
      setAllUsers(users);

      // Calculate batch statistics
      const batchDistribution: { [key: string]: number } = {};
      users.forEach((user: User) => {
        if (user.batchId) {
          batchDistribution[user.batchId] =
            (batchDistribution[user.batchId] || 0) + 1;
        }
      });
      const totalBatches = Object.keys(batchDistribution).length;

      setStats({
        totalStudents: students.length,
        totalMentors: mentors.length,
        activeUsers:
          students.filter((s: any) => s.isActive).length +
          mentors.filter((m: any) => m.isActive).length,
        totalAssignments: assignmentsRes.data.length,
        totalSessions: sessionsRes.data.length,
        pendingApprovals: 0,
        totalBatches,
        batchDistribution,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBatch = async () => {
    if (!editingBatch) return;

    try {
      if (editingBatch.userRole === "mentor") {
        // For mentors, send the batches array
        await api.patch(`/admin/users/${editingBatch.userId}/batch`, {
          batchIds: batchesInput.filter(b => b.trim())
        });
      } else {
        // For students, send single batchId
        await api.patch(`/admin/users/${editingBatch.userId}/batch`, {
          batchId: batchInput,
        });
      }
      toast.success("Batch assigned successfully");
      setEditingBatch(null);
      setBatchInput("");
      setBatchesInput([]);
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to assign batch:", error);
      toast.error("Failed to assign batch");
    }
  };

  const openBatchModal = (user: User) => {
    const currentBatch = user.batchId || "";
    const currentBatches = user.batchIds || (user.batchId ? [user.batchId] : []);
    setEditingBatch({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      currentBatch,
      currentBatches
    });
    setBatchInput(currentBatch);
    setBatchesInput(currentBatches);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
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
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                System overview and management
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Students Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total enrolled</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentors Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mentors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalMentors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active mentors</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>





          {/* Batches Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Batches
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalBatches}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active batches</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Layers className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/users"
                  className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                >
                  <Users className="w-5 h-5 text-blue-600 mb-2 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">
                    Manage Users
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Students & Mentors
                  </p>
                </a>

                <a
                  href="/admin/batches"
                  className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                >
                  <Layers className="w-5 h-5 text-purple-600 mb-2 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">
                    Batch Management
                  </p>
                  <p className="text-xs text-gray-500 mt-1">View all batches</p>
                </a>

                <a
                  href="/admin/sessions"
                  className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-green-600 mb-2 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">
                    Sessions
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Schedule & view</p>
                </a>

                <a
                  href="/admin/attendance"
                  className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                >
                  <ClipboardCheck className="w-5 h-5 text-orange-600 mb-2 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">
                    Attendance
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Track records</p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                System Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Platform statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Total Sessions
                      </p>
                      <p className="text-xs text-gray-500">
                        Mentorship sessions
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {stats.totalSessions}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Active Rate
                      </p>
                      <p className="text-xs text-gray-500">User engagement</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    {(
                      (stats.activeUsers /
                        (stats.totalStudents + stats.totalMentors) || 0) * 100
                    ).toFixed(0)}
                    %
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Pending Approvals
                      </p>
                      <p className="text-xs text-gray-500">
                        Requires attention
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                    {stats.pendingApprovals}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        System Health
                      </p>
                      <p className="text-xs text-gray-500">Overall status</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    Excellent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>

      {/* Batch Assignment Modal */}
      {editingBatch && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBatch.userRole === 'mentor' ? 'Assign Batches' : 'Assign Batch'}
              </h3>
              <button
                onClick={() => {
                  setEditingBatch(null);
                  setBatchInput("");
                  setBatchesInput([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">User:</p>
                <p className="text-base font-medium text-gray-900">
                  {editingBatch.userName}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${editingBatch.userRole === 'mentor'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {editingBatch.userRole === 'mentor' ? 'Mentor' : 'Student'}
                </span>
              </div>

              {editingBatch.userRole === 'mentor' ? (
                // Multiple batches for mentor
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manage Mentor Batches
                  </label>
                  <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Important:</strong> Edit the list below. Current batches are shown - add or remove as needed.
                    </p>
                  </div>

                  {/* Current Batches Tags */}
                  {batchesInput.filter(b => b).length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Current Batches:</p>
                      <div className="flex flex-wrap gap-2">
                        {batchesInput.filter(b => b).map((batch, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            <span className="text-sm font-medium">{batch}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newBatches = batchesInput.filter((_, i) => i !== idx || !batchesInput[i]);
                                setBatchesInput(newBatches);
                              }}
                              className="ml-1 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Batch */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Add New Batch</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter batch ID (e.g., A26)"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && batchInput.trim()) {
                            e.preventDefault();
                            if (!batchesInput.includes(batchInput.trim())) {
                              setBatchesInput([...batchesInput, batchInput.trim()]);
                              setBatchInput('');
                            } else {
                              toast.error('Batch already added');
                            }
                          }
                        }}
                        className="flex-1 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (batchInput.trim()) {
                            if (!batchesInput.includes(batchInput.trim())) {
                              setBatchesInput([...batchesInput, batchInput.trim()]);
                              setBatchInput('');
                            } else {
                              toast.error('Batch already added');
                            }
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter or click Add to include a new batch
                    </p>
                  </div>
                </div>
              ) : (
                // Single batch for student
                <div className="mb-5">
                  <label
                    htmlFor="batchInput"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Batch ID
                  </label>
                  <Input
                    id="batchInput"
                    placeholder="Enter batch name (e.g., A26, B27)"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {editingBatch.currentBatch || 'None'}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingBatch(null);
                    setBatchInput("");
                    setBatchesInput([]);
                  }}
                  className="transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignBatch}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
