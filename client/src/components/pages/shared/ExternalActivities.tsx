import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Calendar,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  const [initialLoad, setInitialLoad] = useState(true);

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
      // Add a slight delay for initial load to prevent flashing
      setTimeout(() => setInitialLoad(false), 300);
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
    return <Megaphone className="w-4 h-4" />;
  };

  const getPlatformIconBg = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes("github")) return "bg-gray-50 text-gray-600";
    if (lower.includes("linkedin")) return "bg-blue-50 text-blue-600";
    if (lower.includes("twitter") || lower.includes("x"))
      return "bg-sky-50 text-sky-600";
    if (lower.includes("instagram")) return "bg-pink-50 text-pink-600";
    return "bg-indigo-50 text-indigo-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "rejected":
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              External Activities
            </h1>
            <p className="text-slate-500 mt-1">
              Share your achievements and projects
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowPostModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Post
            </Button>
            <Button
              onClick={() => setShowActivityModal(true)}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </div>

        {loading && initialLoad ? (
          // Skeleton Loading State
          <div className="space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                >
                  <div className="h-12 w-12 rounded-lg bg-slate-100 mb-4 animate-pulse"></div>
                  <div className="h-4 w-24 bg-slate-100 mb-2 animate-pulse"></div>
                  <div className="h-8 w-16 bg-slate-100 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                >
                  <div className="h-6 w-32 bg-slate-100 mb-6 animate-pulse"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="p-4 border border-slate-100 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-4 w-64 bg-slate-100 mb-2 animate-pulse"></div>
                            <div className="h-3 w-32 bg-slate-100 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Branding Posts
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {posts.length}
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <Megaphone className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Activities
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {activities.length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Approved
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {
                          activities.filter((a) => a.status === "approved")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Eye className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branding Posts */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Branding Posts
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Share your social media presence
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 max-h-[500px] overflow-y-auto">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No posts yet</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Start sharing your content
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div
                          key={post._id}
                          className="p-4 border border-slate-100 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${getPlatformIconBg(
                                post.platform
                              )}`}
                            >
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm capitalize text-slate-900">
                                  {post.platform}
                                </p>
                                <span className="text-xs text-slate-500">
                                  {formatDate(post.createdAt)}
                                </span>
                              </div>
                              {post.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {post.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                {post.views && (
                                  <div className="flex items-center gap-1.5">
                                    <Eye className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-500">
                                      {post.views} views
                                    </span>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="text-indigo-600 hover:text-indigo-700 h-8 p-0"
                                >
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-medium"
                                  >
                                    View Post{" "}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* External Activities */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        External Activities
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Log your external contributions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 max-h-[500px] overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <ExternalLink className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No activities yet</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Log your external work
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="p-4 border border-slate-100 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-slate-900">
                              {activity.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                activity.status
                              )} flex items-center gap-1 text-xs`}
                            >
                              {getStatusIcon(activity.status)}
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1 rounded ${getPlatformIconBg(
                                  activity.platform
                                )}`}
                              >
                                {getPlatformIcon(activity.platform)}
                              </div>
                              <span className="text-xs text-slate-500">
                                {activity.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {activity.status === "approved" && (
                                <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                                  +{activity.points} pts
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 p-0"
                              >
                                <a
                                  href={activity.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                                >
                                  View <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
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
                <option value="twitter">Twitter/X</option>
                <option value="github">GitHub</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other</option>
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
              variant="outline"
              onClick={() => setShowPostModal(false)}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={submitPost}
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
              variant="outline"
              onClick={() => setShowActivityModal(false)}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={submitActivity}
              disabled={
                !newActivity.title || !newActivity.platform || !newActivity.url
              }
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalActivitiesPage;
