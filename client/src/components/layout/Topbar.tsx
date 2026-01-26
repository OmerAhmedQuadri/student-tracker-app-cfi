import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    return (
        <header className="absolute top-2 left-2 z-30 md:hidden">
            <Button
                variant="ghost"
                size="sm"
                className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
                onClick={onMenuClick}
            >
                <Menu className="w-5 h-5 text-gray-600" />
            </Button>
        </header>
    );
};

export default Topbar;
