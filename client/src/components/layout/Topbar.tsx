import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    return (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </Button>

                    <div className="hidden md:flex items-center relative">
                        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" className="relative text-gray-500 hover:bg-gray-100 rounded-full w-10 h-10 p-0">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </Button>

                    <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-none">Alex Johnson</p>
                            <p className="text-xs text-gray-500 mt-1">Student</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
