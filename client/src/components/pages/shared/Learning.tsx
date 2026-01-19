import React, { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  BookOpen,
  Calendar,
  CheckCircle2,
  Plus,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface LearningSession {
  _id: string;
  date: string;
  minutesSpent: number;
  tasksCompleted: string[];
  createdAt: string;
}

const Learning = () => {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [duration, setDuration] = useState("");
  const [tasks, setTasks] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions/learning/my");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/sessions/learning", {
        minutesSpent: parseInt(duration),
        date: new Date(sessionDate).toISOString(),
        tasksCompleted: tasks.split("\n").filter((t) => t.trim().length > 0),
      });
      toast.success("Learning session logged!");
      setDuration("");
      setTasks("");
      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log session");
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours =
    sessions.reduce((acc, curr) => acc + curr.minutesSpent, 0) / 60;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Learning Journal
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl text-lg mx-auto">
                Document your learning journey, track hours, and reflect on your
                progress.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100/50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {totalHours.toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50/50 border-purple-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Sessions
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {sessions.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                Recent Activity
              </h2>
            </div>

            {sessions.length === 0 ? (
              <Card className="bg-white border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    No sessions yet
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Start logging your learning journey today!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sessions.map((session) => (
                  <Card
                    key={session._id}
                    className="hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-32 flex-shrink-0">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {new Date(session.date).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {session.minutesSpent} mins
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                          <ul className="space-y-3">
                            {session.tasksCompleted.map((task, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm leading-relaxed">
                                  {task}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Log Session Form */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-8">
              <Card className="border-0 shadow-lg ring-1 ring-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Log New Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogSession} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="bg-gray-50/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                          id="duration"
                          type="number"
                          placeholder="e.g. 120"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="pl-9 bg-gray-50/50"
                          required
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="tasks">What did you learn?</Label>
                        <span className="text-xs text-gray-400">
                          One per line
                        </span>
                      </div>
                      <Textarea
                        id="tasks"
                        placeholder="• Completed Module 5&#10;• Practiced async/await&#10;• Fixed bugs in project"
                        className="min-h-[120px] bg-gray-50/50 resize-y"
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin mr-2 w-4 h-4" />
                          Saving...
                        </>
                      ) : (
                        "Log Session"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
