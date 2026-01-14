import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  sessionId: string;
  finalStatus: "present" | "absent" | "late";
  date: string;
}

interface Session {
  _id: string;
  topic: string;
  date: string;
  batch: string;
}

const AdminAttendance = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent" | "late"
  >("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchAttendance(selectedSession);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/sessions/mentorship",
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSession(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  const fetchAttendance = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/attendance/session/${sessionId}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      } else {
        toast.error("Failed to load attendance records");
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 border-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "absent":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "late":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.userId.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || record.finalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: attendance.length,
    present: attendance.filter((a) => a.finalStatus === "present").length,
    late: attendance.filter((a) => a.finalStatus === "late").length,
    absent: attendance.filter((a) => a.finalStatus === "absent").length,
  };

  const attendanceRate =
    stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attendance Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor student attendance by session
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => {
                  if (selectedSession) fetchAttendance(selectedSession);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Present
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.present}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Late
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.late}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Absent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.absent}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {attendanceRate}%
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Selector & Attendance List */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Attendance Records
                </CardTitle>
                <CardDescription className="text-xs">
                  View attendance for mentorship sessions
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={selectedSession}
                  onValueChange={setSelectedSession}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-64 h-9">
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session._id} value={session._id}>
                        {session.topic} -{" "}
                        {new Date(session.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    className="pl-9 h-9 text-sm w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge
                variant={statusFilter === "all" ? "default" : "outline"}
                className={
                  statusFilter === "all"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : ""
                }
                onClick={() => setStatusFilter("all")}
              >
                All Status
              </Badge>
              <Badge
                variant={statusFilter === "present" ? "default" : "outline"}
                className={
                  statusFilter === "present"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => setStatusFilter("present")}
              >
                Present
              </Badge>
              <Badge
                variant={statusFilter === "late" ? "default" : "outline"}
                className={
                  statusFilter === "late"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : ""
                }
                onClick={() => setStatusFilter("late")}
              >
                Late
              </Badge>
              <Badge
                variant={statusFilter === "absent" ? "default" : "outline"}
                className={
                  statusFilter === "absent" ? "bg-red-600 hover:bg-red-700" : ""
                }
                onClick={() => setStatusFilter("absent")}
              >
                Absent
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-gray-500 mt-4">Loading attendance...</p>
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ClipboardCheck className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">
                  No attendance records found
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Try selecting a different session
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                        Marked At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredAttendance.map((record) => (
                      <tr
                        key={record._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.userId.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.userId.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.finalStatus)}
                            <Badge
                              variant="outline"
                              className={getStatusColor(record.finalStatus)}
                            >
                              {(record.finalStatus || 'unknown').charAt(0).toUpperCase() +
                                (record.finalStatus || 'unknown').slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <p className="text-sm text-gray-600">
                            {record.date ? new Date(record.date).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "N/A"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;
