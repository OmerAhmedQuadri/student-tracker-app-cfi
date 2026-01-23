import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Eye,
  X,
  CheckCircle,
  Clock,
  Layout,
  Trophy,
  Globe
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface BrandingPost {
  _id: string;
  platform: string;
  url: string;
  description?: string;
  views?: number;
  createdAt: string;
}

interface ExternalActivity {
  _id: string;
  title: string;
  platform: string;
  description: string;
  url: string;
  points: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const ExternalActivitiesPage = () => {
  const [posts, setPosts] = useState<BrandingPost[]>([]);
  const [activities, setActivities] = useState<ExternalActivity[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState({
    platform: "linkedin",
    url: "",
    description: "",
  });

  const [newActivity, setNewActivity] = useState({
    title: "",
    platform: "",
    description: "",
    url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, activitiesRes] = await Promise.all([
        fetch("http://localhost:5000/api/external-activities/posts/my", {
          credentials: "include",
        }),
        fetch("http://localhost:5000/api/external-activities/my", {
          credentials: "include",
        }),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/external-activities/post",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newPost),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setPosts([data, ...posts]);
        setShowPostModal(false);
        setNewPost({ platform: "linkedin", url: "", description: "" });
        toast.success("Branding post added successfully");
      }
    } catch (error) {
      console.error("Failed to add post:", error);
      toast.error("Failed to add post");
    }
  };

  const submitActivity = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/external-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newActivity),
      });

      if (res.ok) {
        const data = await res.json();
        setActivities([data, ...activities]);
        setShowActivityModal(false);
        setNewActivity({ title: "", platform: "", description: "", url: "" });
        toast.success("External activity submitted for review");
      }
    } catch (error) {
      console.error("Failed to submit activity:", error);
      toast.error("Failed to submit activity");
    }
  };

  const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes("github")) return <Github className="w-4 h-4" />;
    if (lower.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
    if (lower.includes("twitter") || lower.includes("x"))
      return <Twitter className="w-4 h-4" />;
    if (lower.includes("instagram")) return <Instagram className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "rejected":
        return <X className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">External Activities</h1>
              <p className="text-gray-500 mt-2 max-w-2xl text-lg mx-auto">
                Showcase your work, share branding posts, and build your professional portfolio.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-indigo-100/50 rounded-lg">
                    <Megaphone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Total Posts</p>
                    <p className="text-2xl font-bold text-indigo-700">{posts.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50/50 border-purple-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100/50 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">Activities</p>
                    <p className="text-2xl font-bold text-purple-700">{activities.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50/50 border-green-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Approved</p>
                    <p className="text-2xl font-bold text-green-700">{activities.filter(a => a.status === 'approved').length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50/50 border-yellow-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-yellow-100/50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{activities.filter(a => a.status === 'pending').length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Branding Posts Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">Branding Posts</h2>
              </div>
              <Button
                onClick={() => setShowPostModal(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Post
              </Button>
            </div>

            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Megaphone className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No posts yet</p>
                  <p className="text-sm text-gray-400">Share your journey with the world</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="hover:shadow-md transition-shadow duration-200 group">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors flex-shrink-0">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-900 capitalize truncate pr-2">{post.platform}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(post.createdAt)}</span>
                          </div>
                          {post.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.description}</p>
                          )}

                          <div className="flex flex-wrap items-center justify-between mt-2 pt-2 border-t border-gray-50 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {post.views !== undefined && (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{post.views} views</span>
                                </>
                              )}
                            </div>
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View Post <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* External Activities Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">External Work</h2>
              </div>
              <Button
                onClick={() => setShowActivityModal(true)}
                size="sm"
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Log Activity
              </Button>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExternalLink className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No activities logged</p>
                  <p className="text-sm text-gray-400">Record your external achievements</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <Card key={activity._id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate pr-2">{activity.title}</h3>
                          <div className="flex items-center flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600 capitalize">
                              {activity.platform}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize flex items-center gap-1 border-0 ring-1 ring-inset ${activity.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                activity.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                  'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                }`}
                            >
                              {getStatusIcon(activity.status)}
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                        {activity.status === 'approved' && (
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-lg font-bold text-green-600">+{activity.points}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Points</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mt-3 mb-4">{activity.description}</p>

                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-50 gap-2">
                        <span className="text-xs text-gray-400">Submitted {formatDate(activity.submittedAt)}</span>
                        <a
                          href={activity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          View Project <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Branding Post</DialogTitle>
            <DialogDescription>
              Share your social media content
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            submitPost();
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="platform"
                  className="text-sm font-medium text-slate-700"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newPost.platform}
                  onChange={(e) =>
                    setNewPost({ ...newPost, platform: e.target.value })
                  }
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">X</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-slate-700"
                >
                  URL
                </label>
                <Input
                  id="url"
                  value={newPost.url}
                  onChange={(e) =>
                    setNewPost({ ...newPost, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="border-slate-300 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  value={newPost.description}
                  onChange={(e) =>
                    setNewPost({ ...newPost, description: e.target.value })
                  }
                  placeholder="Brief description..."
                  className="border-slate-300 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPostModal(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newPost.url}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activity Modal */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log External Activity</DialogTitle>
            <DialogDescription>
              Submit your external work for review
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            submitActivity();
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Title
                </label>
                <Input
                  id="title"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  placeholder="Activity title..."
                  className="border-slate-300 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="platform"
                  className="text-sm font-medium text-slate-700"
                >
                  Platform
                </label>
                <Input
                  id="platform"
                  value={newActivity.platform}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, platform: e.target.value })
                  }
                  placeholder="e.g., GitHub, Medium, Dev.to"
                  className="border-slate-300 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your contribution..."
                  className="border-slate-300 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="text-sm font-medium text-slate-700"
                >
                  URL
                </label>
                <Input
                  id="url"
                  value={newActivity.url}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowActivityModal(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newActivity.title || !newActivity.platform || !newActivity.url
                }
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalActivitiesPage;
