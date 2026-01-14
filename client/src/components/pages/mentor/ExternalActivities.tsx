import { useEffect, useState } from "react";
import {
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  User,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface ExternalActivity {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  platform: string;
  description: string;
  url: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

const AdminExternalActivities = () => {
  const [activities, setActivities] = useState<ExternalActivity[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Avatar colors for students
  const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
  ];

  const getAvatarColor = (index: number) =>
    avatarColors[index % avatarColors.length];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchActivitiesByUser(selectedUserId);
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, [selectedUserId]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/mentor/students/all", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const studentUsers = data.filter(
          (user: any) => user.role === "student"
        );
        setStudents(studentUsers);
        // Select first student by default
        if (studentUsers.length > 0) {
          setSelectedUserId(studentUsers[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchActivitiesByUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/mentor/external-activities/${userId}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (
    activityId: string,
    status: "approved" | "rejected",
    points?: number
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/mentor/external-activities/${activityId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, points: points || 10 }),
        }
      );

      if (res.ok) {
        const updatedActivity = await res.json();
        setActivities((prev) =>
          prev.map((a) => (a._id === activityId ? updatedActivity : a))
        );
        toast.success(`Activity ${status}!`);
      } else {
        const errorText = await res.text();
        let errorMessage = "Failed to update activity";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
      toast.error("Network error: Failed to update activity");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const filteredActivities = activities
    .filter((activity) => filter === "all" || activity.status === filter)
    .filter(
      (activity) =>
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.platform?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: activities.length,
    pending: activities.filter((a) => a.status === "pending").length,
    approved: activities.filter((a) => a.status === "approved").length,
    rejected: activities.filter((a) => a.status === "rejected").length,
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return "bg-red-100 text-red-700";
      case "blog":
        return "bg-blue-100 text-blue-700";
      case "course":
        return "bg-green-100 text-green-700";
      case "github":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-600 border border-green-200";
      case "rejected":
        return "bg-red-50 text-red-600 border border-red-200";
      default:
        return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              External Activities
            </h1>
            <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
              Review and approve student external work
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-gray-200"
              onClick={() => {
                if (selectedUserId) fetchActivitiesByUser(selectedUserId);
              }}
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </Button>
            <div className="bg-purple-100 p-2 sm:p-2.5 rounded-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Stats Cards with colored left borders */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
            <CardContent className="py-2 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    TOTAL
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                    {stats.total}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">All submissions</p>
                </div>
                <div className="bg-blue-100 p-1.5 sm:p-2 md:p-3 rounded-full flex-shrink-0">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 bg-white shadow-sm">
            <CardContent className="py-2 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    PENDING
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                    {stats.pending}
                  </p>
                  <p className="text-[9px] sm:text-xs text-yellow-600 mt-0.5 sm:mt-1 truncate">Needs review</p>
                </div>
                <div className="bg-yellow-100 p-1.5 sm:p-2 md:p-3 rounded-full flex-shrink-0">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 bg-white shadow-sm">
            <CardContent className="py-2 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    APPROVED
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                    {stats.approved}
                  </p>
                  <p className="text-[9px] sm:text-xs text-green-600 mt-0.5 sm:mt-1 truncate">Accepted</p>
                </div>
                <div className="bg-green-100 p-1.5 sm:p-2 md:p-3 rounded-full flex-shrink-0">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 bg-white shadow-sm">
            <CardContent className="py-2 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    REJECTED
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                    {stats.rejected}
                  </p>
                  <p className="text-[9px] sm:text-xs text-red-600 mt-0.5 sm:mt-1 truncate">Declined</p>
                </div>
                <div className="bg-red-100 p-1.5 sm:p-2 md:p-3 rounded-full flex-shrink-0">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Select Student and Activity Submissions Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          {/* Select Student Card */}
          <Card className="lg:col-span-4 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">
                  Select Student
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Search by name
                </label>
                <div className="relative">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Type student name..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="pl-7 sm:pl-9 border-gray-200 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Submissions Header */}
          <Card className="lg:col-span-8 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="py-3 sm:py-4 px-3 sm:px-4 md:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">
                  Activity Submissions
                </CardTitle>
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {(["all", "pending", "approved", "rejected"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                          filter === status
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="relative">
                <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 sm:pl-9 border-gray-200 h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Student List and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Student List */}
          <Card className="lg:col-span-4 bg-white border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-6 border-b border-gray-100">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">
                Student List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {filteredStudents.map((student, index) => (
                  <button
                    key={student._id}
                    onClick={() => {
                      setSelectedUserId(student._id);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
                      selectedUserId === student._id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(
                          index
                        )}`}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-center">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-xs sm:text-sm">No students found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          <Card className="lg:col-span-8 bg-white border border-gray-200 shadow-sm overflow-hidden">
            {/* Activities count and sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-gray-100 gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredActivities.length}
                </span>{" "}
                activities
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-500">Sort by:</span>
                <button
                  onClick={() =>
                    setSortBy(sortBy === "latest" ? "oldest" : "latest")
                  }
                  className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {sortBy === "latest" ? "Latest" : "Oldest"}
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-300 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading activities...</p>
                </div>
              ) : !selectedUserId ? (
                <div className="py-16 text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No student selected
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Select a student to view their activities
                  </p>
                </div>
              ) : paginatedActivities.length === 0 ? (
                <div className="py-16 text-center">
                  <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No activities found
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    No external activities for this student
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title and Platform Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-2">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                              {activity.title || "Untitled Activity"}
                            </h3>
                            <Badge
                              className={`${getPlatformColor(
                                activity.platform
                              )} text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit`}
                            >
                              {activity.platform}
                            </Badge>
                          </div>

                          {/* Description */}
                          {activity.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                              {activity.description}
                            </p>
                          )}

                          {/* Submitted date, status, and points */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                            <span>
                              Submitted on{" "}
                              {new Date(
                                activity.submittedAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-gray-300">•</span>
                            <Badge
                              className={`${getStatusBadge(
                                activity.status
                              )} text-xs font-medium px-3 py-1 rounded-full capitalize`}
                            >
                              {activity.status === "approved"
                                ? "Approved"
                                : activity.status === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </Badge>
                            {activity.status === "approved" &&
                              activity.points > 0 && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-xs font-medium px-3 py-1 rounded-full">
                                    +{activity.points} pts
                                  </Badge>
                                </>
                              )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-lg border-gray-200"
                            asChild
                          >
                            <a
                              href={activity.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-500" />
                            </a>
                          </Button>
                          {activity.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-lg bg-green-500 text-white hover:bg-green-600"
                                onClick={() =>
                                  updateActivityStatus(
                                    activity._id,
                                    "approved",
                                    15
                                  )
                                }
                              >
                                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                onClick={() =>
                                  updateActivityStatus(activity._id, "rejected")
                                }
                              >
                                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredActivities.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-100 gap-3 sm:gap-0">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-700">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredActivities.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-blue-600">
                      {filteredActivities.length}
                    </span>{" "}
                    activities
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-600 border-gray-200 hover:bg-gray-50 disabled:opacity-50 h-7 sm:h-8 text-xs px-2 sm:px-3"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="text-gray-600 border-gray-200 hover:bg-gray-50 disabled:opacity-50 h-7 sm:h-8 text-xs px-2 sm:px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminExternalActivities;
