import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Session {
  _id: string;
  batchId: string;
  date: string;
  topic: string;
  createdAt: string;
}

const AdminSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchBatches();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/admin/sessions/mentorship");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/admin/batches");
      const batchIds = res.data.map((batch: any) => batch.batchId);
      setBatches(batchIds);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      await api.delete(`/admin/sessions/${sessionToDelete}`);
      toast.success("Session deleted successfully");
      setShowDeleteDialog(false);
      setSessionToDelete(null);
      fetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const filteredSessions = selectedBatch === "all"
    ? sessions
    : sessions.filter((s) => s.batchId === selectedBatch);

  const upcomingSessions = filteredSessions
    .filter((s) => new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastSessions = filteredSessions
    .filter((s) => new Date(s.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Loading sessions...
          </p>
          <p className="text-xs text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Improved visual hierarchy */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Sessions Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage mentorship sessions for all batches
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats - Enhanced with better visual design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total Sessions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sessions.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-7 h-7 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Upcoming
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {upcomingSessions.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pastSessions.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Filter */}
        <div className="mb-8">
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Filter by Batch
            </label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions - Redesigned */}
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600 mt-0.5">
                    {upcomingSessions.length} scheduled{" "}
                    {upcomingSessions.length === 1 ? "session" : "sessions"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-3">
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                            {session.topic}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1.5 bg-blue-50 rounded-md">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {new Date(session.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1.5 bg-blue-50 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {new Date(session.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-semibold"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {session.batchId}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {upcomingSessions.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl mb-4">
                      <Calendar className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg">
                      No upcoming sessions
                    </p>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                      There are no sessions scheduled at the moment
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Sessions - Redesigned */}
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 py-5 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Past Sessions
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600 mt-0.5">
                    {pastSessions.length} completed{" "}
                    {pastSessions.length === 1 ? "session" : "sessions"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {pastSessions.slice(0, 10).map((session) => (
                  <div
                    key={session._id}
                    className="p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 group opacity-90"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                            {session.topic}
                          </h3>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Completed
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(session.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>

                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-300"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {session.batchId}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pastSessions.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg">
                      No past sessions
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Completed sessions will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Session
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Are you sure you want to delete this session? This action cannot
              be undone and will permanently remove the session data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSessionToDelete(null);
              }}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSessions;
