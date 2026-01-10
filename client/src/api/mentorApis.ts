import api from "@/lib/api";

// --- Assignments ---

export const createAssignment = async (data: { title: string; skillId: string; dueDate: string; maxScore: number }) => {
    const response = await api.post("/assignments", data);
    return response.data;
};

export const getAllAssignments = async () => {
    const response = await api.get("/assignments");
    return response.data;
};

export const getAssignmentById = async (id: string) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
};

export const updateAssignment = async (id: string, data: any) => {
    const response = await api.patch(`/assignments/${id}`, data);
    return response.data;
};

export const deleteAssignment = async (id: string) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
};

export const getSubmissionsForAssignment = async (assignmentId: string) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
};

export const gradeAssignment = async (studentAssignmentId: string, score: number) => {
    const response = await api.patch(`/assignments/grade/${studentAssignmentId}`, { score });
    return response.data;
};

// --- Attendance ---

export const getSessionAttendance = async (sessionId: string) => {
    const response = await api.get(`/attendance/session/${sessionId}`);
    return response.data;
};

export const approveAttendance = async (attendanceId: string, data: { approved: boolean; finalStatus?: "present" | "absent" }) => {
    const response = await api.patch(`/attendance/approve/${attendanceId}`, data);
    return response.data;
};

// --- Sessions ---

export const createMentorshipSession = async (data: { batchId: string; date: string; topic: string }) => {
    const response = await api.post("/sessions/mentorship", data);
    return response.data;
};

export const getMentorshipSessions = async () => {
    const response = await api.get("/sessions/mentorship");
    return response.data;
};

export const updateMentorshipSession = async (id: string, data: any) => {
    const response = await api.patch(`/sessions/mentorship/${id}`, data);
    return response.data;
};

export const getStudentLearningSessions = async (userId: string) => {
    const response = await api.get(`/sessions/learning/${userId}`);
    return response.data;
};

// --- Notifications ---

export const createNotification = async (data: { userId: string; type: "info" | "warning" | "success" | "error"; message: string }) => {
    const response = await api.post("/notifications", data);
    return response.data;
};

// --- External Activities ---

export const getUserExternalActivities = async (userId: string) => {
    const response = await api.get(`/external-activities/${userId}`);
    return response.data;
};

// --- Skills ---

export const getAllSkills = async () => {
    const response = await api.get("/skills");
    return response.data;
};

export const createSkillTopic = async (data: { skillId: string; title: string; difficulty: "beginner" | "intermediate" | "advanced"; estimatedMinutes: number }) => {
    const response = await api.post("/skills/topics", data);
    return response.data;
};

export const getSkillTopics = async (skillId: string) => {
    const response = await api.get(`/skills/topics/${skillId}`);
    return response.data;
};

export const updateSkillTopic = async (id: string, data: any) => {
    const response = await api.patch(`/skills/topics/${id}`, data);
    return response.data;
};

export const deleteSkillTopic = async (id: string) => {
    const response = await api.delete(`/skills/topics/${id}`);
    return response.data;
};

export const getStudentSkillProgress = async (userId: string) => {
    const response = await api.get(`/skills/progress/${userId}`);
    return response.data;
};
