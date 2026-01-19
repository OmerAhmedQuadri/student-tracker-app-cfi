import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  Trash2,
  GraduationCap,
  School,
  Edit,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "mentor";
  isActive: boolean;
  batchId?: string; // For students
  batchIds?: string[]; // For mentors - multiple batches
  createdAt: string;
}

const UsersManagement = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "students" | "mentors">(
    "all"
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [studentsRes, mentorsRes] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/mentors"),
      ]);
      setStudents(studentsRes.data);
      setMentors(mentorsRes.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
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
          batchIds: batchesInput.filter((b) => b.trim()),
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
      fetchUsers();
    } catch (error) {
      console.error("Failed to assign batch:", error);
      toast.error("Failed to assign batch");
    }
  };

  const openBatchModal = (user: User) => {
    const currentBatch = user.batchId || "";
    const currentBatches =
      user.batchIds || (user.batchId ? [user.batchId] : []);
    setEditingBatch({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      currentBatch,
      currentBatches,
    });
    setBatchInput(currentBatch);
    setBatchesInput(currentBatches);
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await api.put(`/admin/activate/${userId}`);
      toast.success("User activated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to activate user:", error);
      toast.error("Failed to activate user");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await api.put(`/admin/deactivate/${userId}`);
      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      toast.error("Failed to deactivate user");
    }
  };

  const handleDeleteUser = (
    userId: string,
    userName: string,
    userRole: string
  ) => {
    setUserToDelete({ id: userId, name: userName, role: userRole });
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/delete/${userToDelete.id}`);
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const allUsers = [...students, ...mentors].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "students" && user.role === "student") ||
      (activeTab === "mentors" && user.role === "mentor");
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage students and mentors
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
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {allUsers.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {students.length}
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
                    Mentors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {mentors.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  All Users
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage user accounts and permissions
                </CardDescription>
              </div>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 h-9 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className={
                  activeTab === "all" ? "bg-indigo-600 hover:bg-indigo-700" : ""
                }
              >
                All Users
              </Button>
              <Button
                size="sm"
                variant={activeTab === "students" ? "default" : "outline"}
                onClick={() => setActiveTab("students")}
                className={
                  activeTab === "students"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }
              >
                Students
              </Button>
              <Button
                size="sm"
                variant={activeTab === "mentors" ? "default" : "outline"}
                onClick={() => setActiveTab("mentors")}
                className={
                  activeTab === "mentors"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                Mentors
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider align-middle">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <Badge
                          className={
                            user.role === "student"
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-100"
                          }
                        >
                          {user.role === "student" ? (
                            <>
                              <GraduationCap className="w-3 h-3 mr-1" /> Student
                            </>
                          ) : (
                            <>
                              <School className="w-3 h-3 mr-1" /> Mentor
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          {user.role === "mentor" ? (
                            // Mentor: show multiple batches
                            user.batchIds && user.batchIds.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.batchIds.map((batch) => (
                                  <Badge
                                    key={batch}
                                    variant="outline"
                                    className="bg-purple-50 text-purple-600 border-purple-200"
                                  >
                                    {batch}
                                  </Badge>
                                ))}
                              </div>
                            ) : user.batchId ? (
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-600 border-purple-200"
                              >
                                {user.batchId}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No batches
                              </span>
                            )
                          ) : // Student: show single batch
                          user.batchId ? (
                            <Badge
                              variant="outline"
                              className="bg-indigo-50 text-indigo-600 border-indigo-200"
                            >
                              {user.batchId}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No batch
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openBatchModal(user)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <Badge
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          <span
                            className={`flex items-center ${
                              user.isActive ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                user.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></span>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <p className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex justify-end gap-2">
                          {user.isActive ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivateUser(user._id)}
                              className="h-8 text-gray-700 hover:text-red-700 hover:bg-red-50 transition-all"
                            >
                              <UserX className="w-3 h-3 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivateUser(user._id)}
                              className="h-8 text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all"
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteUser(user._id, user.name, user.role)
                            }
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Assignment Modal */}
      {editingBatch && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBatch.userRole === "mentor"
                  ? "Assign Batches"
                  : "Assign Batch"}
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
                <Badge
                  className={
                    editingBatch.userRole === "mentor"
                      ? "bg-purple-100 text-purple-700 mt-1"
                      : "bg-blue-100 text-blue-700 mt-1"
                  }
                >
                  {editingBatch.userRole === "mentor" ? "Mentor" : "Student"}
                </Badge>
              </div>

              {editingBatch.userRole === "mentor" ? (
                // Multiple batches for mentor
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manage Mentor Batches
                  </label>
                  <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Important:</strong> Edit the list below.
                      Current batches are shown - add or remove as needed.
                    </p>
                  </div>

                  {/* Current Batches Tags */}
                  {batchesInput.filter((b) => b).length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Current Batches:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {batchesInput
                          .filter((b) => b)
                          .map((batch, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded"
                            >
                              <span className="text-sm font-medium">
                                {batch}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBatches = batchesInput.filter(
                                    (_, i) => i !== idx || !batchesInput[i]
                                  );
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Add New Batch
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter batch ID (e.g., A26)"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && batchInput.trim()) {
                            e.preventDefault();
                            if (!batchesInput.includes(batchInput.trim())) {
                              setBatchesInput([
                                ...batchesInput,
                                batchInput.trim(),
                              ]);
                              setBatchInput("");
                            } else {
                              toast.error("Batch already added");
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
                              setBatchesInput([
                                ...batchesInput,
                                batchInput.trim(),
                              ]);
                              setBatchInput("");
                            } else {
                              toast.error("Batch already added");
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
                    Current: {editingBatch.currentBatch || "None"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete User</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {userToDelete?.name}
              </span>{" "}
              ({userToDelete?.role})? This action cannot be undone and will
              permanently remove this user from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setUserToDelete(null);
              }}
              disabled={deleting}
              className="transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleting}
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
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
