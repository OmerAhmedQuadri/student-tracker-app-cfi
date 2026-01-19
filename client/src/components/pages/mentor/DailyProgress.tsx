import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import {

  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,

    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,

} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,

    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,

} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// APIs
import {

  getMentorBatches,
  getMentorshipSessions,
  getSessionAttendance,
  getStudentsByBatch,
  getAllAssignments,
} from "@/api/mentorApis";

interface Session {
  _id: string;
  batchId: string;
  date: string;
  startTime: string;
  endTime: string;
  topics: string[];
}

interface Student {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  title: string;
  batchId: string;
  dueDate: string;
}

const DailyProgress = () => {
  const { toast } = useToast();

  // Inputs
  const [week, setWeek] = useState<string>("0");
  const [day, setDay] = useState<string>("1");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Data
  const [batches, setBatches] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [absentees, setAbsentees] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [loadingSessionData, setLoadingSessionData] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      // setLoadingBatches(true);
      try {
        const [batchesData, sessionsData] = await Promise.all([
          getMentorBatches(),
          getMentorshipSessions(),
        ]);
        setBatches(batchesData);
        setSessions(sessionsData);
      } catch (error) {
        // console.error("Failed to fetch initial data", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load data.",
          variant: "destructive",
        });
      } finally {
        // setLoadingBatches(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Filter Sessions when Batch changes
  useEffect(() => {
    if (selectedBatchId) {
      const batchSessions = sessions.filter(
        (s) => s.batchId === selectedBatchId,
      );
      setFilteredSessions(batchSessions);
      setSelectedSessionId(""); // Reset session selection
      setCurrentSession(null);
      setAttendanceCount(0);
      setAbsentees([]);
      setTasks([]);
    }
  }, [selectedBatchId, sessions]);

  // Fetch Session Details when Session changes
  useEffect(() => {
    const fetchDetailData = async () => {
      if (!selectedSessionId || !selectedBatchId) return;

      setLoadingSessionData(true);

      try {
        // 1. Find session
        const session =
          sessions.find((s) => s._id === selectedSessionId) || null;

        if (!session) return;

        setCurrentSession(session);

        // 2. Fetch data USING CORRECT QUERY
        const [attendanceData, studentsData, assignmentsData] =
          await Promise.all([
            getSessionAttendance(selectedSessionId),
            getStudentsByBatch(selectedBatchId),
            getAllAssignments(),
          ]);

        // console.log("RAW attendanceData:", attendanceData);

        /* ===============================
                   ATTENDANCE COUNT (FINAL)
                =============================== */

        let finalAttendanceCount = 0;

        if (attendanceData.length === 0) {
          // Attendance not taken yet → assume all present
          finalAttendanceCount = studentsData.length;
        } else {
          const presentOrLateIds = new Set<string>();

          attendanceData.forEach((a: any) => {
            const rawStatus =
              a.finalStatus ?? a.status ?? a.attendanceStatus ?? "";

            const status = String(rawStatus).toLowerCase().trim();

            if (status === "present" || status === "late") {
              const studentId =
                typeof a.userId === "object" ? a.userId._id : a.userId;

              if (studentId) presentOrLateIds.add(studentId);
            }
          });

          finalAttendanceCount = presentOrLateIds.size;
        }

        setAttendanceCount(finalAttendanceCount);

        /* ===============================
                   ABSENTEES
                =============================== */

        const absentIds = new Set<string>();

        attendanceData.forEach((a: any) => {
          const status = String(a.finalStatus ?? a.status ?? "").toLowerCase();

          if (status === "absent") {
            const studentId =
              typeof a.userId === "object" ? a.userId._id : a.userId;

            if (studentId) absentIds.add(studentId);
          }
        });

        setAbsentees(
          studentsData
            .filter((s: Student) => absentIds.has(s._id))
            .map((s: Student) => s.name),
        );

        /* ===============================
                   TASKS
                =============================== */

        setTasks(
          assignmentsData
            .filter((a: Assignment) => a.batchId === selectedBatchId)
            .map((a: Assignment) => {
              const date = new Date(a.dueDate).toLocaleDateString("en-GB");
              return `${a.title} (Due: ${date})`;
            }),
        );
      } catch (error) {
        // console.error("Failed to fetch session details", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load session details.",
          variant: "destructive",
        });
      } finally {
        setLoadingSessionData(false);
      }
    };

    fetchDetailData();
  }, [selectedSessionId, selectedBatchId, sessions, toast]);

  // Helper to format time to 12-hour AM/PM
  const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Generators
  const generateMarkdown = () => {
    if (!currentSession) return "Select a session to generate report.";

    const date = new Date(currentSession.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const startTime = formatTime12Hour(currentSession.startTime);
    const endTime = formatTime12Hour(currentSession.endTime);

    // Format topics
    const topicsList = currentSession.topics.map((t) => `- ${t}`).join("\n");
    // Format tasks
    const tasksList =
      tasks.length > 0
        ? tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "No specific tasks assigned.";
    // Format absentees
    const absenteesList =
      absentees.length > 0 ? absentees.map((a) => `- ${a}`).join("\n") : "None";

    return `Team CFI - Daily Progress

    getMentorBatches,
    getMentorshipSessions,
    getSessionAttendance,
    getStudentsByBatch,
    getAllAssignments,
} from "@/api/mentorApis";

interface Session {
    _id: string;
    batchId: string;
    date: string;
    startTime: string;
    endTime: string;
    topics: string[];
}

interface Student {
    _id: string;
    name: string;
}

interface Assignment {
    _id: string;
    title: string;
    batchId: string;
    dueDate: string;
}

const DailyProgress = () => {
    const { toast } = useToast();

    // Inputs
    const [week, setWeek] = useState<string>("0");
    const [day, setDay] = useState<string>("1");
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    // Data
    const [batches, setBatches] = useState<string[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [attendanceCount, setAttendanceCount] = useState<number>(0);
    const [absentees, setAbsentees] = useState<string[]>([]);
    const [tasks, setTasks] = useState<string[]>([]);
    const [loadingSessionData, setLoadingSessionData] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            // setLoadingBatches(true);
            try {
                const [batchesData, sessionsData] = await Promise.all([
                    getMentorBatches(),
                    getMentorshipSessions(),
                ]);
                setBatches(batchesData);
                setSessions(sessionsData);
            } catch (error) {
                // console.error("Failed to fetch initial data", error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to load data.",
                    variant: "destructive",
                });
            } finally {
                // setLoadingBatches(false);
            }
        };

        fetchInitialData();
    }, [toast]);

    // Filter Sessions when Batch changes
    useEffect(() => {
        if (selectedBatchId) {
            const batchSessions = sessions.filter(
                (s) => s.batchId === selectedBatchId,
            );
            setFilteredSessions(batchSessions);
            setSelectedSessionId(""); // Reset session selection
            setCurrentSession(null);
            setAttendanceCount(0);
            setAbsentees([]);
            setTasks([]);
        }
    }, [selectedBatchId, sessions]);

    // Fetch Session Details when Session changes
    useEffect(() => {
        const fetchDetailData = async () => {
            if (!selectedSessionId || !selectedBatchId) return;

            setLoadingSessionData(true);

            try {
                // 1. Find session
                const session =
                    sessions.find((s) => s._id === selectedSessionId) || null;

                if (!session) return;

                setCurrentSession(session);

                // 2. Fetch data USING CORRECT QUERY
                const [attendanceData, studentsData, assignmentsData] =
                    await Promise.all([
                        getSessionAttendance(selectedSessionId),
                        getStudentsByBatch(selectedBatchId),
                        getAllAssignments(),
                    ]);

                // console.log("RAW attendanceData:", attendanceData);

                /* ===============================
                   ATTENDANCE COUNT (FINAL)
                =============================== */

                let finalAttendanceCount = 0;

                if (attendanceData.length === 0) {
                    // Attendance not taken yet → assume all present
                    finalAttendanceCount = studentsData.length;
                } else {
                    const presentOrLateIds = new Set<string>();

                    attendanceData.forEach((a: any) => {
                        const rawStatus =
                            a.finalStatus ??
                            a.status ??
                            a.attendanceStatus ??
                            "";

                        const status = String(rawStatus).toLowerCase().trim();

                        if (status === "present" || status === "late") {
                            const studentId =
                                typeof a.userId === "object" ? a.userId._id : a.userId;

                            if (studentId) presentOrLateIds.add(studentId);
                        }
                    });

                    finalAttendanceCount = presentOrLateIds.size;
                }

                setAttendanceCount(finalAttendanceCount);

                /* ===============================
                   ABSENTEES
                =============================== */

                const absentIds = new Set<string>();

                attendanceData.forEach((a: any) => {
                    const status = String(
                        a.finalStatus ?? a.status ?? ""
                    ).toLowerCase();

                    if (status === "absent") {
                        const studentId =
                            typeof a.userId === "object" ? a.userId._id : a.userId;

                        if (studentId) absentIds.add(studentId);
                    }
                });

                setAbsentees(
                    studentsData
                        .filter((s: Student) => absentIds.has(s._id))
                        .map((s: Student) => s.name),
                );

                /* ===============================
                   TASKS
                =============================== */

                setTasks(
                    assignmentsData
                        .filter((a: Assignment) => a.batchId === selectedBatchId)
                        .map((a: Assignment) => {
                            const date = new Date(a.dueDate).toLocaleDateString("en-GB");
                            return `${a.title} (Due: ${date})`;
                        }),
                );
            } catch (error) {
                // console.error("Failed to fetch session details", error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to load session details.",
                    variant: "destructive",
                });
            } finally {
                setLoadingSessionData(false);
            }
        };

        fetchDetailData();
    }, [selectedSessionId, selectedBatchId, sessions, toast]);


    // Helper to format time to 12-hour AM/PM
    const formatTime12Hour = (timeStr: string) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    // Generators
    const generateMarkdown = () => {
        if (!currentSession) return "Select a session to generate report.";

        const date = new Date(currentSession.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        const startTime = formatTime12Hour(currentSession.startTime);
        const endTime = formatTime12Hour(currentSession.endTime);

        // Format topics
        const topicsList = currentSession.topics.map((t) => `- ${t}`).join("\n");
        // Format tasks
        const tasksList =
            tasks.length > 0
                ? tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")
                : "No specific tasks assigned.";
        // Format absentees
        const absenteesList =
            absentees.length > 0 ? absentees.map((a) => `- ${a}`).join("\n") : "None";

        return `Team CFI - Daily Progress

**Week:** ${week}
**Day:** ${day}
**Attendance Count:** ${attendanceCount}
**Session Date:** ${date}
**Session Time:** ${startTime} - ${endTime}

### Topics Covered:
${topicsList}

### Tasks & Action Items:
${tasksList}

### Absentees:
${absenteesList}

---
Team - Code For India Foundation
[Code For India](https://codeforindia.com)
`;

  };

  const generateText = () => {
    if (!currentSession) return "Select a session to generate report.";

    const date = new Date(currentSession.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const startTime = formatTime12Hour(currentSession.startTime);
    const endTime = formatTime12Hour(currentSession.endTime);

    // Format topics
    const topicsList = currentSession.topics.map((t) => `• ${t}`).join("\n");
    // Format tasks
    const tasksList =
      tasks.length > 0
        ? tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "No specific tasks assigned.";
    // Format absentees
    const absenteesList =
      absentees.length > 0 ? absentees.map((a) => `- ${a}`).join("\n") : "None";

    return `Team CFI - Daily Progress

    };

    const generateText = () => {
        if (!currentSession) return "Select a session to generate report.";

        const date = new Date(currentSession.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        const startTime = formatTime12Hour(currentSession.startTime);
        const endTime = formatTime12Hour(currentSession.endTime);

        // Format topics
        const topicsList = currentSession.topics.map((t) => `• ${t}`).join("\n");
        // Format tasks
        const tasksList =
            tasks.length > 0
                ? tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")
                : "No specific tasks assigned.";
        // Format absentees
        const absenteesList =
            absentees.length > 0 ? absentees.map((a) => `- ${a}`).join("\n") : "None";

        return `Team CFI - Daily Progress


Week: ${week}
Day: ${day}
Attendance Count: ${attendanceCount}
Session Date: ${date}
Session Time: ${startTime} - ${endTime}

Topics Covered:
${topicsList}

Tasks & Action Items:
${tasksList}

Absentees:
${absenteesList}

—
Team - Code For India Foundation
https://codeforindia.com
`;

  };

  const copyToClipboard = (text: string, type: "Text" | "Markdown") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} report copied to clipboard.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Daily Progress Update
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Generate daily progress reports for mentorship sessions.
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Configuration</CardTitle>
          <CardDescription className="text-sm">
            Select session details to generate the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Week</Label>
            <Input
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="e.g. 0"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Day</Label>
            <Input
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="e.g. 1"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Batch</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Session</Label>
            <Select
              value={selectedSessionId}
              onValueChange={setSelectedSessionId}
              disabled={!selectedBatchId}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {filteredSessions.map((session) => (
                  <SelectItem key={session._id} value={session._id}>
                    {new Date(session.date).toLocaleDateString()} -{" "}
                    {session.topics.join(", ").substring(0, 20)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loadingSessionData && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading session data...</span>
        </div>
      )}

      {/* Report Preview Card */}
      {currentSession && !loadingSessionData && (
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <CardTitle className="text-lg sm:text-xl">Report Preview</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateText(), "Text")}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateMarkdown(), "Markdown")}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Markdown
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-slate-800 text-slate-100 p-4 sm:p-6 rounded-lg min-h-[300px] max-h-[60vh] overflow-auto font-mono text-left leading-relaxed">
              {generateText()}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );

    };

    const copyToClipboard = (text: string, type: "Text" | "Markdown") => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${type} report copied to clipboard.`,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Daily Progress Update
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Generate daily progress reports for mentorship sessions.
                </p>
            </div>

            {/* Configuration Card */}
            <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Configuration</CardTitle>
                    <CardDescription className="text-sm">
                        Select session details to generate the report.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Week</Label>
                        <Input
                            value={week}
                            onChange={(e) => setWeek(e.target.value)}
                            placeholder="e.g. 0"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Day</Label>
                        <Input
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="e.g. 1"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Batch</Label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map((batch) => (
                                    <SelectItem key={batch} value={batch}>
                                        {batch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Session</Label>
                        <Select
                            value={selectedSessionId}
                            onValueChange={setSelectedSessionId}
                            disabled={!selectedBatchId}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSessions.map((session) => (
                                    <SelectItem key={session._id} value={session._id}>
                                        {new Date(session.date).toLocaleDateString()} -{" "}
                                        {session.topics.join(", ").substring(0, 20)}...
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loadingSessionData && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Loading session data...</span>
                </div>
            )}

            {/* Report Preview Card */}
            {currentSession && !loadingSessionData && (
                <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                        <CardTitle className="text-lg sm:text-xl">
                            Report Preview
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generateText(), "Text")}
                                className="w-full sm:w-auto"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Text
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generateMarkdown(), "Markdown")}
                                className="w-full sm:w-auto"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Markdown
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-slate-800 text-slate-100 p-4 sm:p-6 rounded-lg min-h-[300px] max-h-[60vh] overflow-auto font-mono text-left leading-relaxed">
                            {generateText()}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DailyProgress;
