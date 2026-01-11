import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users, Video, Link as LinkIcon, Loader2, MapPin, ExternalLink, X } from 'lucide-react';
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
            // Send all the fields including platform and meetingLink
            const sessionData = {
                topic: formData.topic,
                date: formData.date,
                batchId: formData.batchId,
                platform: formData.platform,
                meetingLink: formData.meetingLink
            };
            
            console.log('Sending session data:', sessionData);
            
            await mentorApi.createMentorshipSession(sessionData);
            toast.success('Session scheduled successfully');
            setIsCreating(false);
            setFormData({ topic: '', date: '', batchId: '', platform: 'Online', meetingLink: '' });
            loadSessions();
        } catch (error: any) {
            console.error("Failed to create session", error);
            console.error("Error response:", error?.response?.data);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create session';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Mentorship Sessions</h2>
                    <p className="text-muted-foreground">Schedule and manage your upcoming classes.</p>
                </div>
                <Button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Session
                </Button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                     <Card className="w-full max-w-lg shadow-2xl border-border/60">
                        <CardHeader className="border-b border-border/40">
                            <div className="flex justify-between items-center">
                                <CardTitle>Schedule New Session</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="h-8 w-8 rounded-full">
                                    <Plus className="w-4 h-4 rotate-45" />
                                </Button>
                            </div>
                            <CardDescription>Fill in the details for the upcoming mentorship session.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        placeholder="e.g., Advanced React Hooks"
                                        required
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date & Time</Label>
                                        <Input
                                            id="date"
                                            type="datetime-local"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="batchId">Batch ID</Label>
                                        <Input
                                            id="batchId"
                                            placeholder="e.g., B23"
                                            required
                                            value={formData.batchId}
                                            onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                                        <SelectTrigger>
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
                                    <Label htmlFor="link">Meeting Link (Optional)</Label>
                                    <Input
                                        id="link"
                                        placeholder="https://meet.google.com/..."
                                        value={formData.meetingLink}
                                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsCreating(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-indigo-600 hover:bg-indigo-700"
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

            {sessions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-xl bg-muted/20 text-center">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No Sessions Scheduled</h3>
                    <p className="text-muted-foreground max-w-xs mt-2 mb-6">You haven't scheduled any mentorship sessions yet. Create one to get started.</p>
                    <Button onClick={() => setIsCreating(true)} variant="outline">Schedule First Session</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sessions.map((session, idx) => {
                        const sessionDate = new Date(session.date);
                        const isPast = sessionDate < new Date();
                        
                        return (
                            <Card key={session._id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
                                <div className={`h-2 w-full ${isPast ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"}>
                                            {isPast ? 'Completed' : 'Upcoming'}
                                        </Badge>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            {session.batchId}
                                        </span>
                                    </div>
                                    <CardTitle className="line-clamp-1 text-lg mb-1" title={session.topic}>
                                        {session.topic}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-xs">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {sessionDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4">
                                    <div className="flex items-center gap-2.5 text-sm text-foreground/80">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground uppercase">Time</p>
                                            <p>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-2.5 text-sm text-foreground/80">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                            {session.platform === 'Offline' ? (
                                                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground uppercase">Platform</p>
                                            <p>{session.platform || 'Online'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t border-border/50 bg-muted/10">
                                     <Button 
                                        variant="ghost" 
                                        className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-9"
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

            {/* Session Details Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl shadow-2xl border-border/60 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-border/40">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{selectedSession.topic}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center gap-2">
                                        <Badge variant={selectedSession.status === 'completed' ? 'secondary' : 'default'} className="bg-indigo-100 text-indigo-700">
                                            {selectedSession.status}
                                        </Badge>
                                        <Badge variant="outline">{selectedSession.batchId}</Badge>
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
                                    <p className="font-semibold text-sm text-muted-foreground uppercase mb-1">Date & Time</p>
                                    <p className="text-lg font-medium">
                                        {new Date(selectedSession.date).toLocaleDateString(undefined, { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    <p className="text-base text-muted-foreground mt-1">
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
                                    <p className="font-semibold text-sm text-muted-foreground uppercase mb-1">Platform</p>
                                    <p className="text-lg font-medium">{selectedSession.platform || 'Online'}</p>
                                </div>
                            </div>

                            {/* Meeting Link */}
                            {selectedSession.meetingLink && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                        <LinkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-muted-foreground uppercase mb-1">Meeting Link</p>
                                        <a 
                                            href={selectedSession.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-base font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-2"
                                        >
                                            {selectedSession.meetingLink.length > 50 
                                                ? selectedSession.meetingLink.substring(0, 50) + '...' 
                                                : selectedSession.meetingLink}
                                            <ExternalLink className="w-4 h-4" />
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
                                    <p className="font-semibold text-sm text-muted-foreground uppercase mb-1">Batch</p>
                                    <p className="text-lg font-medium">{selectedSession.batchId}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-border/40 pt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedSession(null)}>
                                Close
                            </Button>
                            {selectedSession.meetingLink && (
                                <Button 
                                    className="bg-indigo-600 hover:bg-indigo-700"
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
