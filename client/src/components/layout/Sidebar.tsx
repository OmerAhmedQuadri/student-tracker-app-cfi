import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    CalendarCheck,
    Clock,
    Award,
    Activity,
    User,
    X,
    LogOut,
    Users,
    Settings,
    Shield,
    ClipboardCheck,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    // Define navigation items for each role
    const studentNavItems = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Assignments', path: '/assignments', icon: BookOpen },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Learning', path: '/learning', icon: Clock },
        { name: 'Skills', path: '/skills', icon: Award },
        { name: 'Activities', path: '/activities', icon: Activity },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const mentorNavItems = [
        { name: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
        { name: 'Assignments', path: '/mentor/assignments', icon: ClipboardCheck },
        { name: 'Attendance', path: '/mentor/attendance', icon: Users },
        { name: 'Sessions', path: '/mentor/sessions', icon: Calendar },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const adminNavItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Users', path: '/admin/users', icon: Users },
        { name: 'System Settings', path: '/admin/settings', icon: Settings },
        { name: 'Security Logs', path: '/admin/logs', icon: Shield },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    // Select items based on user role
    let navItems = studentNavItems; // Default fallback
    if (user?.role === 'mentor') {
        navItems = mentorNavItems;
    } else if (user?.role === 'admin') {
        navItems = adminNavItems;
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            EduTrack
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()} // Close sidebar on mobile when link is clicked
                            className={({ isActive }) => cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={logout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
