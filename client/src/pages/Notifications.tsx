import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, isRead: true } : n)
                );
                toast.success('Marked as read');
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            await Promise.all(
                unreadIds.map(id =>
                    fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                        method: 'PATCH',
                        credentials: 'include'
                    })
                )
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getBgColor = (type: string, isRead: boolean) => {
        if (isRead) return 'bg-gray-50';
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'error': return 'bg-red-50 border-red-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                                <Bell className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
                                <p className="text-blue-100 text-sm mt-1">Stay updated with your activities</p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Badge className="bg-white text-blue-600 hover:bg-white text-lg px-4 py-2">
                                {unreadCount} New
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8 pb-16 relative z-10">
                {/* Actions */}
                {unreadCount > 0 && (
                    <div className="mb-6">
                        <Card className="border-none shadow-lg bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    You have <span className="font-bold text-gray-900">{unreadCount}</span> unread notifications
                                </p>
                                <Button onClick={markAllAsRead} variant="outline" size="sm">
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark all as read
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Notifications List */}
                <Card className="border-none shadow-xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="text-base font-bold">All Notifications</CardTitle>
                        <CardDescription className="text-xs">Recent updates and announcements</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No notifications yet</p>
                                <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-6 flex items-start gap-4 transition-all hover:shadow-md ${getBgColor(notification.type, notification.isRead)} ${!notification.isRead ? 'border-l-4' : ''}`}
                                    >
                                        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(notification.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <Badge className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-0">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="shrink-0"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Notifications;
