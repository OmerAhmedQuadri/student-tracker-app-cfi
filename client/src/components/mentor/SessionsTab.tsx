import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users, Video, Link as LinkIcon, Loader2, MapPin, ExternalLink, X, CheckCircle2, Search, FileCheck } from 'lucide-react';
import * as mentorApi from '@/api/mentorApis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface Session {
    _id: string;
    topic: string;
    date: string;
    batchId: string;
    status: string;
    platform?: string;
    meetingLink?: string;
}

export const SessionsTab = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        topic: '',
        date: '',
        batchId: '',
        platform: 'Online',
        meetingLink: ''
    });

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await mentorApi.getMentorshipSessions();
            setSessions(data);
        } catch (error: any) {
            console.error("Failed to load sessions", error);
            toast.error(error?.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const sessionData = {
                topic: formData.topic,
                date: formData.date,
                batchId: formData.batchId,
                platform: formData.platform,
                meetingLink: formData.meetingLink
            };
            
            await mentorApi.createMentorshipSession(sessionData);
            toast.success('Session scheduled successfully');
            setIsCreating(false);
            setFormData({ topic: '', date: '', batchId: '', platform: 'Online', meetingLink: '' });
            loadSessions();
        } catch (error: any) {
            console.error("Failed to create session", error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create session';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           session.batchId.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterType === 'all') return matchesSearch;
        if (filterType === 'upcoming') return matchesSearch && new Date(session.date) >= new Date();
        if (filterType === 'completed') return matchesSearch && new Date(session.date) < new Date();
        if (filterType === 'week') {
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return matchesSearch && new Date(session.date) >= now && new Date(session.date) <= weekFromNow;
        }
        return matchesSearch;
    });

    const stats = {
        total: sessions.length,
        upcoming: sessions.filter(s => new Date(s.date) >= new Date()).length,
        completed: sessions.filter(s => new Date(s.date) < new Date()).length,
        thisMonth: sessions.filter(s => {
            const now = new Date();
            const sessionDate = new Date(s.date);
            return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
        }).length
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96" role="status" aria-label="Loading sessions">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header - Improved with better spacing and typography */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Mentorship Sessions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Schedule and manage your upcoming classes
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Session
                </Button>
            </div>

            {/* Stats Cards - Added for better overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Total Sessions
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
                                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Upcoming
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.upcoming}
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
                                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Completed
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    This Month
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.thisMonth}
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full">
                                <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters - Improved with search functionality */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                            <Button
                                size="sm"
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterType('all')}
                                className={`transition-colors ${
                                    filterType === 'all' 
                                        ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                All Sessions
                            </Button>
                            <Button
                                size="sm"
                                variant={filterType === 'upcoming' ? 'default' : 'outline'}
                                onClick={() => setFilterType('upcoming')}
                                className={`transition-colors ${
                                    filterType === 'upcoming' 
                                        ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Upcoming
                            </Button>
                            <Button
                                size="sm"
                                variant={filterType === 'completed' ? 'default' : 'outline'}
                                onClick={() => setFilterType('completed')}
                                className={`transition-colors ${
                                    filterType === 'completed' 
                                        ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Completed
                            </Button>
                            <Button
                                size="sm"
                                variant={filterType === 'week' ? 'default' : 'outline'}
                                onClick={() => setFilterType('week')}
                                className={`transition-colors ${
                                    filterType === 'week' 
                                        ? 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                This Week
                            </Button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <Input
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create Session Modal - Improved with better form layout */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                     <Card className="w-full max-w-lg shadow-2xl border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Schedule New Session</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="h-8 w-8 rounded-full">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                                Fill in the details for the upcoming mentorship session.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="topic" className="text-slate-700 dark:text-slate-300">Topic</Label>
                                    <Input
                                        id="topic"
                                        placeholder="e.g., Advanced React Hooks"
                                        required
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                        className="focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-slate-700 dark:text-slate-300">Date & Time</Label>
                                        <Input
                                            id="date"
                                            type="datetime-local"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="batchId" className="text-slate-700 dark:text-slate-300">Batch ID</Label>
                                        <Input
                                            id="batchId"
                                            placeholder="e.g., B23"
                                            required
                                            value={formData.batchId}
                                            onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                            className="focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="platform" className="text-slate-700 dark:text-slate-300">Platform</Label>
                                    <Select 
                                        value={formData.platform} 
                                        onValueChange={(value) => setFormData({ ...formData, platform: value })}
                                    >
                                        <SelectTrigger className="focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="Offline">Offline</SelectItem>
                                            <SelectItem value="Google Meet">Google Meet</SelectItem>
                                            <SelectItem value="Zoom">Zoom</SelectItem>
                                            <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="link" className="text-slate-700 dark:text-slate-300">Meeting Link (Optional)</Label>
                                    <Input
                                        id="link"
                                        placeholder="https://meet.google.com/..."
                                        value={formData.meetingLink}
                                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                        className="focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsCreating(false)}
                                        disabled={isSubmitting}
                                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Scheduling...
                                            </>
                                        ) : (
                                            'Schedule Session'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sessions Grid - Improved with better visual hierarchy */}
            {filteredSessions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Sessions Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2 mb-6">
                        {searchQuery ? 'No sessions match your search criteria.' : 'You haven\'t scheduled any mentorship sessions yet.'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setIsCreating(true)} variant="outline" className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            Schedule First Session
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSessions.map((session, idx) => {
                        const sessionDate = new Date(session.date);
                        const isPast = sessionDate < new Date();
                        
                        return (
                            <Card key={session._id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white overflow-hidden">
                                <CardHeader className="pb-3 pt-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge 
                                            variant="secondary" 
                                            className={`${
                                                isPast 
                                                    ? "bg-gray-100 text-gray-600" 
                                                    : "bg-indigo-100 text-indigo-700"
                                            } px-3 py-1 text-xs font-medium`}
                                        >
                                            {isPast ? 'Completed' : 'Upcoming'}
                                        </Badge>
                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                                            {session.batchId}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-900 mb-3" title={session.topic}>
                                        {session.topic}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">TIME</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(sessionDate.getTime() + 90 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                            {session.platform === 'Offline' ? (
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                            ) : session.platform === 'Google Meet' ? (
                                                <Video className="w-5 h-5 text-purple-600" />
                                            ) : session.platform === 'Zoom' ? (
                                                <Video className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <Video className="w-5 h-5 text-purple-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">PLATFORM</p>
                                            <p className="text-sm font-medium text-gray-900">{session.platform || 'Online'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 pb-4 border-t border-gray-100">
                                     <Button 
                                        variant="ghost" 
                                        className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-9 font-medium text-sm"
                                        onClick={() => setSelectedSession(session)}
                                     >
                                        View Details
                                     </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Session Details Modal - Improved with better information architecture */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl shadow-2xl border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">{selectedSession.topic}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center gap-2">
                                        <Badge 
                                            variant={selectedSession.status === 'completed' ? 'secondary' : 'default'} 
                                            className={`${
                                                selectedSession.status === 'completed'
                                                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                            }`}
                                        >
                                            {selectedSession.status}
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                            {selectedSession.batchId}
                                        </Badge>
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setSelectedSession(null)}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Date and Time */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                    <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase mb-1">Date & Time</p>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                                        {new Date(selectedSession.date).toLocaleDateString(undefined, { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
                                        {new Date(selectedSession.date).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Platform */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                    {selectedSession.platform === 'Offline' ? (
                                        <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    ) : (
                                        <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase mb-1">Platform</p>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedSession.platform || 'Online'}</p>
                                </div>
                            </div>

                            {/* Meeting Link */}
                            {selectedSession.meetingLink && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                        <LinkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase mb-1">Meeting Link</p>
                                        <a 
                                            href={selectedSession.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-base font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-2 break-all"
                                        >
                                            {selectedSession.meetingLink.length > 50 
                                                ? selectedSession.meetingLink.substring(0, 50) + '...' 
                                                : selectedSession.meetingLink}
                                            <ExternalLink className="w-4 h-4 shrink-0" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Batch Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase mb-1">Batch</p>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedSession.batchId}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedSession(null)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                Close
                            </Button>
                            {selectedSession.meetingLink && (
                                <Button 
                                    className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"
                                    onClick={() => window.open(selectedSession.meetingLink, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};