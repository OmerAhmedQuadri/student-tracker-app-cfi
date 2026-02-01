import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface MentorshipSession {
  _id: string;
  topic?: string;
  topics?: string[];
  scheduledAt: string;
  mentorName?: string;
  status: "scheduled" | "cancelled" | "completed";
  date?: string; // This usually exists on existing records
}

interface AttendanceRecord {
  _id: string;
  sessionId: string | MentorshipSession;
  date: string;
  finalStatus: "present" | "absent" | "late";
}

const Attendance = () => {
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, sessRes] = await Promise.all([
        api.get("/attendance/my"),
        api.get("/sessions/mentorship"),
      ]);
      setAttendanceHistory(attRes.data);
      setSessions(sessRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = async (sessionId: string) => {
    setMarking(sessionId);
    try {
      await api.post("/attendance/mark", { sessionId });
      toast.success("Attendance marked!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark attendance. Session might not be active.");
    } finally {
      setMarking(null);
    }
  };

  const isAttended = (sessionId: string) => {
    return attendanceHistory.some(
      (a) =>
        (typeof a.sessionId === "string" ? a.sessionId : a.sessionId._id) ===
        sessionId,
    );
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = attendanceHistory.length;
    // Assuming current API only returns 'present' records in /attendance/my usually,
    // but generalizing for absent if API changes
    const present = attendanceHistory.filter((a) => a.finalStatus === "present")
      .length;
    const absent = attendanceHistory.filter((a) => a.finalStatus === "absent")
      .length;
    // Calculate rate based on total vs present.
    // Ideally total sessions should be (attended + missed), but here we use history length as base.
    // If backend only returns present, then rate is 100%. adapting logic to be safe.
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, rate };
  }, [attendanceHistory]);

  const totalPages = Math.ceil(attendanceHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return attendanceHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [attendanceHistory, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upcomingSessions = sessions.filter(
    (s) =>
      !isAttended(s._id) &&
      new Date(s.scheduledAt) > new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        {/* Header Skeleton */}
        <div className="bg-white border-b py-8 -mx-6 -mt-6 mb-6 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-20 bg-gray-100 rounded-lg w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Attendance
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl text-lg mx-auto">
                Track your consistency and session history.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {stats.total}
                    </p>
                    <p className="text-xs text-blue-600/80">Sessions</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50/50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Present</p>
                    <p className="text-2xl font-bold text-green-700">
                      {stats.present}
                    </p>
                    <p className="text-xs text-green-600/80">Confirmed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50/50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-red-100/50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Absent</p>
                    <p className="text-2xl font-bold text-red-700">
                      {stats.absent}
                    </p>
                    <p className="text-xs text-red-600/80">Missed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-indigo-100/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Rate</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {stats.rate}%
                    </p>
                    <p className="text-xs text-indigo-600/80">Attendance</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Active Sessions Action Card */}
        {upcomingSessions.length > 0 && (
          <Card className="bg-indigo-50 border-indigo-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-indigo-100/50">
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <AlertCircle className="w-5 h-5" />
                Mark Attendance
              </CardTitle>
              <CardDescription className="text-indigo-600/80">
                You have sessions scheduled for today that need your attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-indigo-100 shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {session.topic || (session.topics ? session.topics.join(", ") : "Mentorship Session")}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(session.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {session.mentorName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.mentorName}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleMarkAttendance(session._id)}
                    disabled={!!marking}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                  >
                    {marking === session._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Marking...
                      </>
                    ) : (
                      "Mark Present"
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* History Table/List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance History
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Session Topic
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-center">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <p>No attendance records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((record) => {
                    let sessionTopic = "Session";
                    let sessionDate = record.date; // Default to record date

                    if (typeof record.sessionId === "object") {
                      const session = record.sessionId as MentorshipSession;
                      sessionTopic = session.topic || (session.topics ? session.topics.join(", ") : "Session");
                      // Prefer session date if available
                      if (session.date) {
                        sessionDate = session.date;
                      } else if (session.scheduledAt) {
                        sessionDate = session.scheduledAt;
                      }
                    }
                    return (
                      <TableRow
                        key={record._id}
                        className="hover:bg-gray-50/50 transition-colors border-gray-100"
                      >
                        <TableCell className="py-4 text-center font-medium text-gray-900">
                          {new Date(sessionDate).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell className="py-4 text-center text-gray-600">
                          {sessionTopic}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge
                            variant="outline"
                            className={`
                              ${record.finalStatus === "present"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                              }
                            `}
                          >
                            {record.finalStatus === "present" ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {(record.finalStatus || "unknown").charAt(0).toUpperCase() +
                              (record.finalStatus || "unknown").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center text-sm text-gray-500 font-mono">
                          {new Date(record.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {paginatedHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p>No attendance records found</p>
                </div>
              </div>
            ) : (
              paginatedHistory.map((record) => {
                let sessionTopic = "Session";
                if (typeof record.sessionId === "object") {
                  const session = record.sessionId as MentorshipSession;
                  sessionTopic = session.topic || (session.topics ? session.topics.join(", ") : "Session");
                }
                const isPresent = record.finalStatus === "present";
                const statusColor = isPresent ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200";

                return (
                  <div key={record._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">
                          {sessionTopic}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(record.date).toLocaleDateString('en-GB')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(record.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className={`shrink-0 ${statusColor} px-2.5 py-0.5`}>
                        {isPresent ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Present</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Absent</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {attendanceHistory.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={attendanceHistory.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
