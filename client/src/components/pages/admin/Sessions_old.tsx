import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  Users,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  X,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    batchId: "",
    date: "",
    topic: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.batchId.trim()) {
      errors.batchId = "Batch ID is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    }

    if (!formData.topic.trim()) {
      errors.topic = "Topic is required";
    } else if (formData.topic.trim().length < 3) {
      errors.topic = "Topic must be at least 3 characters";
    }

    return errors;
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await api.post("/admin/sessions/mentorship", {
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      toast.success("Session created successfully");
      setShowCreateModal(false);
      setFormData({ batchId: "", date: "", topic: "" });
      fetchSessions();
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/admin/sessions/${sessionId}`);
      toast.success("Session deleted successfully");
      fetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const upcomingSessions = sessions
    .filter((s) => new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastSessions = sessions
    .filter((s) => new Date(s.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading sessions...</p>
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
                Sessions Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Schedule and manage mentorship sessions
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Session
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
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {sessions.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Upcoming
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {upcomingSessions.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pastSessions.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold">
                Upcoming Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                Scheduled mentorship sessions
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5">
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          {session.topic}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
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

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>
                              {new Date(session.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">
                              {session.batchId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {upcomingSessions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">
                      No upcoming sessions
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Schedule a new session to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Sessions */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold">
                Past Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                Completed mentorship sessions
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5">
              <div className="space-y-4">
                {pastSessions.slice(0, 5).map((session) => (
                  <div
                    key={session._id}
                    className="p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          {session.topic}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
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

                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{session.batchId}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {pastSessions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">
                      No past sessions
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Completed sessions will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Create New Session</CardTitle>
                  <CardDescription className="text-xs">
                    Schedule a mentorship session
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormErrors({});
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <Label htmlFor="batchId" className="text-sm font-medium">
                    Batch ID
                  </Label>
                  <Input
                    id="batchId"
                    placeholder="Batch 1"
                    className={`mt-1 ${
                      formErrors.batchId
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    value={formData.batchId}
                    onChange={(e) =>
                      setFormData({ ...formData, batchId: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                  {formErrors.batchId && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.batchId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    className={`mt-1 ${
                      formErrors.date
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="topic" className="text-sm font-medium">
                    Topic
                  </Label>
                  <Input
                    id="topic"
                    placeholder="Intro to Node.js"
                    className={`mt-1 ${
                      formErrors.topic
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                  {formErrors.topic && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.topic}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormErrors({});
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Session"
                    )}
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

export default AdminSessions;
