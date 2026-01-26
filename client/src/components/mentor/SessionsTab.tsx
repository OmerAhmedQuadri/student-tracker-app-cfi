import { useEffect, useState } from "react";
import {
  Plus,

  Clock,
  Video,
  MapPin,
  ExternalLink,
  Loader2,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";
import * as mentorApi from "@/api/mentorApis";
import {
  Card,
  CardContent,

} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface Session {
  _id: string;
  topics: string[];
  date: string;
  startTime: string;
  endTime: string;
  batchId: string;
  status: string;
  platform?: string;
  meetingLink?: string;
}

export const SessionsTab = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    topics: [] as string[],
    currentTopic: '',
    date: '',
    startTime: '',
    endTime: '',
    batchId: '',
    platform: 'Offline',
    meetingLink: ''
  });

  // Helper function to format time to 12-hour format with AM/PM
  const formatTime = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await mentorApi.getMentorshipSessions();
      setSessions(data);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    const trimmedTopic = formData.currentTopic.trim();
    if (trimmedTopic && !formData.topics.includes(trimmedTopic)) {
      setFormData({ ...formData, topics: [...formData.topics, trimmedTopic], currentTopic: '' });
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData({ ...formData, topics: formData.topics.filter(t => t !== topicToRemove) });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one topic
    if (formData.topics.length === 0) {
      toast.error('Please add at least one topic');
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionData = {
        topics: formData.topics,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        batchId: formData.batchId,
        platform: formData.platform,
        meetingLink: formData.meetingLink
      };

      if (isEditing && selectedSession) {
        await mentorApi.updateMentorshipSession(selectedSession._id, sessionData);
        toast.success('Session updated successfully');
        setIsEditing(false);
      } else {
        await mentorApi.createMentorshipSession(sessionData);
        toast.success('Session scheduled successfully');
      }

      setIsCreating(false);
      setSelectedSession(null);
      setFormData({ topics: [], currentTopic: '', date: '', startTime: '', endTime: '', batchId: '', platform: 'Offline', meetingLink: '' });
      loadSessions();
    } catch (error: any) {
      console.error("Failed to save session", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save session';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setFormData({
      topics: session.topics || [],
      currentTopic: '',
      date: session.date,
      startTime: session.startTime || '',
      endTime: session.endTime || '',
      batchId: session.batchId,
      platform: session.platform || 'Offline',
      meetingLink: session.meetingLink || ''
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    setDeleting(true);
    try {
      await mentorApi.deleteMentorshipSession(sessionToDelete._id);
      toast.success('Session deleted successfully');
      setShowDeleteDialog(false);
      setSessionToDelete(null);
      loadSessions();
    } catch (error: any) {
      console.error("Failed to delete session:", error);
      toast.error(error?.response?.data?.message || 'Failed to delete session');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.batchId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Mentorship Sessions
          </h1>
          <p className="text-sm text-slate-500">
            Manage your scheduled sessions
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search sessions..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-slate-500">
          No sessions found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const sessionDate = new Date(session.date);
            const isPast = sessionDate < new Date();

            return (
              <Card
                key={session._id}
                className="overflow-hidden rounded-2xl border"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b">
                  <div className="flex gap-3">
                    {/* Date */}
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-slate-50 border">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        {sessionDate.toLocaleString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        {sessionDate.getDate()}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {session.topics[0]}
                      </h3>
                      <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {session.batchId}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(session);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Body */}
                <CardContent className="p-4 space-y-3">
                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5">
                    {session.topics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-md bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {formatTime(session.startTime)} – {formatTime(session.endTime)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {session.platform === "Offline" ? (
                      <MapPin className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Video className="h-4 w-4 text-slate-400" />
                    )}
                    {session.platform || "Offline"}
                  </div>
                </CardContent>

                {/* Footer */}
                <div className="flex items-center justify-between border-t p-4">
                  <Badge
                    className={`rounded-full px-3 py-1 text-xs shadow-none hover:shadow-none ${isPast
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-100"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                      }`}
                  >
                    {isPast ? "Completed" : "Upcoming"}
                  </Badge>

                  {session.meetingLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(session.meetingLink, "_blank")
                      }
                    >
                      Join
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Session Modal */}
      {isCreating && (
        <Dialog open={isCreating} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedSession(null);
            setFormData({ topics: [], currentTopic: '', date: '', startTime: '', endTime: '', batchId: '', platform: 'Offline', meetingLink: '' });
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the session details below.' : 'Fill in the details for the upcoming mentorship session.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="topic">Topics</Label>
                <div className="flex gap-2">
                  <Input
                    id="topic"
                    placeholder="e.g., Advanced React Hooks"
                    value={formData.currentTopic}
                    onChange={e => setFormData({ ...formData, currentTopic: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTopic}
                    disabled={!formData.currentTopic.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.topics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-1 flex items-center gap-1"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic)}
                          className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Class Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Class End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input
                  id="batchId"
                  placeholder="e.g., C24"
                  required
                  value={formData.batchId}
                  onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
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

              {formData.platform !== 'Offline' && (
                <div className="space-y-2">
                  <Label htmlFor="link">Meeting Link (Optional)</Label>
                  <Input
                    id="link"
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setSelectedSession(null);
                    setFormData({ topics: [], currentTopic: '', date: '', startTime: '', endTime: '', batchId: '', platform: 'Offline', meetingLink: '' });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Scheduling...'}
                    </>
                  ) : (
                    isEditing ? 'Update Session' : 'Schedule Session'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the session <span className="font-semibold text-slate-900">"{sessionToDelete?.topics.join(', ')}"</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSessionToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
