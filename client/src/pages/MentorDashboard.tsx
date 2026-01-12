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
  Presentation,
  Clock,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { AssignmentsTab } from "@/components/mentor/AssignmentsTab";
import { AttendanceTab } from "@/components/mentor/AttendanceTab";
import { SessionsTab } from "@/components/mentor/SessionsTab";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as mentorApi from "@/api/mentorApis";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "assignments", label: "Assignments", icon: FileCheck },
  { id: "attendance", label: "Attendance", icon: Users },
  { id: "sessions", label: "Sessions", icon: Calendar },
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* ===== HEADER ===== */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Mentor Dashboard
          </h1>
          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400">
            Welcome back, {user?.name}
          </p>
        </header>

        {/* ===== TABS ===== */}
        <nav className="relative">
          {/* Mobile */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => changeTab(tab.id)}
                aria-current={activeTab === tab.id}
                className="shrink-0"
              >
                <tab.icon className="w-4 h-4 mr-2" />
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
                className={`relative px-4 py-3 text-sm font-medium transition
                  ${
                    activeTab === tab.id
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
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
          <section className="space-y-8">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Main Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Cohort */}
              <Card className="lg:col-span-2 bg-indigo-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="w-5 h-5" />
                    Cohort Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <ActionButton
                    icon={FileCheck}
                    title="Grade Assignments"
                    subtitle="Review student submissions"
                    onClick={() => changeTab("assignments")}
                  />
                  <ActionButton
                    icon={Clock}
                    title="Schedule Session"
                    subtitle="Plan upcoming class"
                    onClick={() => changeTab("sessions")}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ActionRow
                    title="Pending Attendance"
                    subtitle="3 requests waiting"
                  />
                  <ActionRow
                    title="Upcoming Session"
                    subtitle="React Patterns · Today 4PM"
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => changeTab("attendance")}
                  >
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
