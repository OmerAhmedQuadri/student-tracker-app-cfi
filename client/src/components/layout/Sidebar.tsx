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
    ClipboardCheck,
    Calendar,
    Bell,
    Megaphone,
    Trophy,
    Zap,
    History,
    UsersRound,
    Layers,
    ChevronRight,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
        { name: 'External Work', path: '/student/external-activities', icon: Megaphone },
        { name: 'Notifications', path: '/student/notifications', icon: Bell },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const mentorNavItems = [
        { name: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
        { name: 'My Students', path: '/mentor/students', icon: UsersRound },
        { name: 'Assignments', path: '/mentor/assignments', icon: ClipboardCheck },
        { name: 'Mark Attendance', path: '/mentor/attendance', icon: CalendarCheck },
        { name: 'Attendance History', path: '/mentor/attendance/history', icon: History },
        { name: 'Sessions', path: '/mentor/sessions', icon: Calendar },
        { name: 'External Activities', path: '/mentor/external-activities', icon: Zap },
        { name: 'Profile', path: '/mentor/profile', icon: User },
    ];

    const adminNavItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Users', path: '/admin/users', icon: Users },
        { name: 'Create Users', path: '/admin/create-users', icon: Users },
        { name: 'Batch Management', path: '/admin/batches', icon: Layers },
        { name: 'Sessions', path: '/admin/sessions', icon: Calendar },
        { name: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    // Select items based on user role
    let navItems = studentNavItems; // Default fallback
    if (user?.role === 'mentor') {
        navItems = mentorNavItems;
    } else if (user?.role === 'admin') {
        navItems = adminNavItems;
    }

    const getRoleBadgeColor = (role?: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'mentor': return 'bg-purple-100 text-purple-700';
            case 'student': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
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
                    "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
                aria-label="Main navigation"
            >
                {/* Logo and Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            EduTrack
                        </span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="md:hidden h-8 w-8 rounded-full"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={/* user?.avatar */ ''} alt={user?.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                                {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Badge className={cn("text-xs font-medium", getRoleBadgeColor(user?.role))}>
                            {(user?.role || '').charAt(0).toUpperCase() + (user?.role || '').slice(1)}
                        </Badge>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto flex-1" aria-label="Navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/mentor/attendance' || item.path === '/admin/attendance'}
                            onClick={() => onClose()} // Close sidebar on mobile when link is clicked
                            className={({ isActive }) => cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-colors",
                                            isActive ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"
                                        )} />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 text-indigo-600" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => {
                            // In a real app, this would navigate to settings
                            console.log('Navigate to settings');
                        }}
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Button>
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