import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Calendar,
  Activity,
  ChevronRight,
  Monitor,
  Clock,
  FileText,
  Bell,
  ArrowRight,
  List,
  GraduationCap,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { AssignmentsTab } from "@/components/mentor/AssignmentsTab";
import { AttendanceTab } from "@/components/mentor/AttendanceTab";
import { SessionsTab } from "@/components/mentor/SessionsTab";
import { SkillsTab } from "@/components/mentor/SkillsTab";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as mentorApi from "@/api/mentorApis";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "assignments", label: "Assignments", icon: FileCheck },
  { id: "attendance", label: "Attendance", icon: Users },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "skills", label: "Skills", icon: GraduationCap },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): TabId => {
    const last = location.pathname.split("/").pop();
    return tabs.some(t => t.id === last) ? (last as TabId) : "overview";
  };

  const activeTab = getActiveTab();

  const [stats, setStats] = useState({
    assignments: 0,
    sessions: 0,
    students: 12,
  });

  useEffect(() => {
    (async () => {
      try {
        const [assignments, sessions] = await Promise.all([
          mentorApi.getAllAssignments(),
          mentorApi.getMentorshipSessions(),
        ]);

        setStats({
          assignments: assignments.length,
          sessions: sessions.length,
          students: 12,
        });
      } catch (err) {
        console.error("Dashboard stats failed", err);
      }
    })();
  }, []);

  const changeTab = (tab: TabId) => {
    tab === "overview"
      ? navigate("/mentor/dashboard")
      : navigate(`/mentor/${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8">

        {/* ===== HEADER ===== */}
        <header className="space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Mentor Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400">
            Welcome back, {user?.name}
          </p>
        </header>

        {/* ===== TABS ===== */}
        <nav className="relative">
          {/* Mobile */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 no-scrollbar -mx-3 px-3">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => changeTab(tab.id)}
                aria-current={activeTab === tab.id}
                className="shrink-0 text-xs"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:flex border-b border-slate-200 dark:border-slate-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                aria-current={activeTab === tab.id}
                className={`relative px-3 lg:px-4 py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition
                  ${
                    activeTab === tab.id
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {tab.label}
                </div>

                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* ===== CONTENT ===== */}
        {activeTab === "overview" && (
          <section className="space-y-4 sm:space-y-6 md:space-y-8">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Students"
                value={stats.students.toString()}
                icon={Users}
              />
              <StatCard
                title="Assignments"
                value={stats.assignments.toString()}
                icon={FileCheck}
              />
              <StatCard
                title="Sessions"
                value={stats.sessions.toString()}
                icon={Calendar}
              />
              <StatCard
                title="Attendance"
                value="85%"
                icon={Activity}
              />
            </div>

            {/* Main Cards - New Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

              {/* Cohort Overview - Left Side */}
              <Card className="lg:col-span-2 bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                    <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
                      <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    Cohort Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/mentor/assignments')}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg w-fit mb-3 sm:mb-4">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Grade Assignments</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Review student submissions</p>
                        <button className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                          Go to assignments <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/mentor/sessions')}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg w-fit mb-3 sm:mb-4">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Schedule Session</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Plan upcoming class</p>
                        <button className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                          Go to sessions <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Action Items - Right Side */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Action Items</CardTitle>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">3 pending</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="mt-0.5">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">Pending Attendance</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">3 requests waiting</p>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="mt-0.5">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">Upcoming Session</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">React Patterns · Today 4PM</p>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="mt-0.5">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">New Submissions</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">5 assignments to grade</p>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 sm:mt-6 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm"
                    onClick={() => changeTab("attendance")}
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    View All Activity
                  </Button>
                </CardContent>
              </Card>

            </div>
          </section>
        )}

        {activeTab === "assignments" && <AssignmentsTab />}
        {activeTab === "attendance" && <AttendanceTab />}
        {activeTab === "sessions" && <SessionsTab />}
        {activeTab === "skills" && <SkillsTab />}
      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */

function ActionButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white/10 p-4 text-left transition active:scale-95"
    >
      <Icon className="w-6 h-6 mb-3" />
      <p className="font-semibold">{title}</p>
      <p className="text-sm opacity-80">{subtitle}</p>
      <ChevronRight className="mt-3 w-4 h-4 opacity-80" />
    </button>
  );
}

function ActionRow({ title, subtitle }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </div>
  );
}
