import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Clock,

  User,
  X,
  LogOut,
  Users,
  ClipboardCheck,
  Calendar,
  Megaphone,
  Trophy,
  Zap,
  History,
  UsersRound,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  // Define navigation items for each role
  const studentNavItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Assignments", path: "/assignments", icon: BookOpen },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck },
    { name: "Learning", path: "/learning", icon: Clock },


    {
      name: "External Work",
      path: "/student/external-activities",
      icon: Megaphone,
    },

    { name: "Profile", path: "/profile", icon: User },
  ];

  const mentorNavItems = [
    { name: "Dashboard", path: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "My Students", path: "/mentor/students", icon: UsersRound },
    { name: "My Batches", path: "/mentor/batches", icon: Layers },
    { name: "Assignments", path: "/mentor/assignments", icon: ClipboardCheck },
    {
      name: "Mark Attendance",
      path: "/mentor/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Daily Progress",
      path: "/mentor/daily-progress",
      icon: ClipboardCheck,
    },
    {
      name: "Attendance History",
      path: "/mentor/attendance/history",
      icon: History,
    },
    { name: "Sessions", path: "/mentor/sessions", icon: Calendar },
    {
      name: "External Activities",
      path: "/mentor/external-activities",
      icon: Zap,
    },
    { name: "Profile", path: "/mentor/profile", icon: User },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "Create Users", path: "/admin/create-users", icon: Users },
    { name: "Batch Management", path: "/admin/batches", icon: Layers },
    { name: "Sessions", path: "/admin/sessions", icon: Calendar },
    { name: "Attendance", path: "/admin/attendance", icon: ClipboardCheck },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User },
  ];

  // Select items based on user role
  let navItems = studentNavItems; // Default fallback
  if (user?.role === "mentor") {
    navItems = mentorNavItems;
  } else if (user?.role === "admin") {
    navItems = adminNavItems;
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "mentor":
        return "bg-purple-100 text-purple-700";
      case "student":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-56 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        {/* Logo and Header */}
        <div className="flex items-center justify-end px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8 rounded-full"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="px-3 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
              <AvatarImage src={/* user?.avatar */ ""} alt={user?.name} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <Badge
              className={cn(
                "text-[10px] font-medium px-2 py-0.5",
                getRoleBadgeColor(user?.role)
              )}
            >
              {(user?.role || "").charAt(0).toUpperCase() +
                (user?.role || "").slice(1)}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="px-2.5 py-3 space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          aria-label="Navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={
                item.path === "/mentor/attendance" ||
                item.path === "/admin/attendance"
              }
              onClick={() => onClose()} // Close sidebar on mobile when link is clicked
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-2.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-2.5">
                    <item.icon
                      className={cn(
                        "w-[17px] h-[17px] transition-colors flex-shrink-0",
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-2.5 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-9 text-sm font-medium rounded-xl"
            onClick={logout}
          >
            <LogOut className="w-[17px] h-[17px] mr-2.5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
