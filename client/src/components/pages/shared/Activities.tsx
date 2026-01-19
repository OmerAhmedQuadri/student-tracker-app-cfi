import { useEffect, useState } from "react";
import {
  Send,
  Twitter,
  Linkedin,
  Github,
  Loader2,
  Share2,
  ExternalLink,
  Activity,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface BrandingPost {
  _id: string;
  platform: "linkedin" | "medium" | "twitter" | "github";
  url: string;
  createdAt: string;
}

interface ExternalActivity {
  platform: string;
  metrics: any;
  lastActivityDate: string;
}

const Activities = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BrandingPost[]>([]);
  const [externalActivities, setExternalActivities] = useState<
    ExternalActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [posting, setPosting] = useState(false);

  // Form
  const [platform, setPlatform] = useState("linkedin");
  const [url, setUrl] = useState("");

  const fetchData = async () => {
    try {
      const [postsRes, extRes] = await Promise.all([
        api.get("/external-activities/posts/my"),
        api.get("/external-activities/my"),
      ]);
      setPosts(postsRes.data);
      setExternalActivities(extRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
      // Add a slight delay for initial load to prevent flashing
      setTimeout(() => setInitialLoad(false), 300);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePost = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setPosting(true);
    try {
      await api.post("/external-activities/post", {
        platform,
        url,
      });
      toast.success("Post logged successfully!");
      setUrl("");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log post");
    } finally {
      setPosting(false);
    }
  };

  const isConnected = (plat: string) =>
    externalActivities.some(
      (e) => e.platform.toLowerCase() === plat.toLowerCase(),
    );

  const getPlatformIcon = (plat: string) => {
    const lower = plat.toLowerCase();
    if (lower.includes("github")) return <Github className="w-4 h-4" />;
    if (lower.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
    if (lower.includes("twitter") || lower.includes("x"))
      return <Twitter className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  const getPlatformIconBg = (plat: string) => {
    const lower = plat.toLowerCase();
    if (lower.includes("github")) return "bg-gray-100 text-gray-700";
    if (lower.includes("linkedin")) return "bg-blue-50 text-blue-600";
    if (lower.includes("twitter") || lower.includes("x"))
      return "bg-sky-50 text-sky-600";
    if (lower.includes("medium")) return "bg-gray-50 text-gray-700";
    if (lower.includes("leetcode")) return "bg-amber-50 text-amber-600";
    if (lower.includes("hackerrank")) return "bg-green-50 text-green-600";
    return "bg-gray-50 text-gray-700";
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
              Showcase your tech journey across platforms
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
            <Activity className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Community Active
              </p>
              <p className="text-xs text-slate-500">Join the conversation</p>
            </div>
          </div>
        </div>

        {loading && initialLoad ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="h-6 w-32 bg-slate-100 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg bg-slate-100 animate-pulse"></div>
                        <div>
                          <div className="h-4 w-24 bg-slate-100 mb-2 animate-pulse"></div>
                          <div className="h-3 w-16 bg-slate-100 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-6 w-16 rounded bg-slate-100 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 shadow-sm">
                <div className="h-6 w-32 bg-white/20 mb-4 animate-pulse"></div>
                <div className="h-12 w-20 bg-white/20 mb-4 animate-pulse"></div>
                <div className="h-2 w-full bg-white/20 rounded mb-3 animate-pulse"></div>
                <div className="h-3 w-48 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="h-6 w-32 bg-slate-100 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="h-4 w-16 bg-slate-100 mb-2 animate-pulse"></div>
                    <div className="h-11 w-full bg-slate-100 animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-16 bg-slate-100 mb-2 animate-pulse"></div>
                    <div className="flex gap-3">
                      <div className="flex-1 h-11 bg-slate-100 animate-pulse"></div>
                      <div className="h-11 w-24 bg-slate-100 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-100 animate-pulse"></div>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                  >
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-slate-100 mb-2 animate-pulse"></div>
                        <div className="h-3 w-32 bg-slate-100 mb-4 animate-pulse"></div>
                        <div className="h-20 bg-slate-50 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar: Integrations & Stats */}
              <div className="lg:col-span-1 space-y-6">
                {/* Integrations Card */}
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-indigo-600" />
                      Integrations
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Connect your developer accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {["github", "leetcode", "hackerrank"].map((plat) => {
                        const connected = isConnected(plat);
                        return (
                          <div
                            key={plat}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-lg flex items-center justify-center ${getPlatformIconBg(
                                  plat,
                                )}`}
                              >
                                {plat === "github" && (
                                  <Github className="w-5 h-5" />
                                )}
                                {plat === "leetcode" && (
                                  <Activity className="w-5 h-5" />
                                )}
                                {plat === "hackerrank" && (
                                  <Activity className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-900 capitalize">
                                  {plat}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {connected
                                    ? "Syncing data..."
                                    : "Not connected"}
                                </p>
                              </div>
                            </div>
                            {connected ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Widget */}
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold">Activity Streak</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-black">
                        {posts.length}
                      </span>
                      <span className="text-sm text-white/80 mb-2">
                        posts logged
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[15%] rounded-full"></div>
                    </div>
                    <p className="text-xs text-white/80 mt-3">
                      Keep sharing to build your streak! 🚀
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content: Log & Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post Composer */}
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Send className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            Share Your Win
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Log posts, articles, or contributions
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Public Feed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Platform
                        </label>
                        <Select value={platform} onValueChange={setPlatform}>
                          <SelectTrigger className="h-11 border-slate-200 focus:ring-indigo-500">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="twitter">X (Twitter)</SelectItem>
                            <SelectItem value="github">GitHub</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Post URL
                        </label>
                        <div className="flex gap-3">
                          <Input
                            placeholder="https://linkedin.com/posts/..."
                            className="h-11 border-slate-200 focus:ring-indigo-500"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                          />
                          <Button
                            onClick={handlePost}
                            disabled={posting || !url}
                            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          >
                            {posting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Share Post
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Activity Feed
                    </h3>
                    <Badge variant="outline" className="font-normal">
                      {posts.length} {posts.length === 1 ? "Post" : "Posts"}
                    </Badge>
                  </div>

                  {posts.length === 0 && (
                    <Card className="border-2 border-dashed border-slate-200 bg-slate-50 shadow-none">
                      <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
                          <Send className="w-9 h-9 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Start Your Journey
                        </h3>
                        <p className="text-slate-500 max-w-sm leading-relaxed">
                          Share your first post or achievement to build your
                          developer portfolio. Your activities will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card
                        key={post._id}
                        className="border-none shadow-sm bg-white hover:shadow-md transition-all"
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="shrink-0 relative">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center ${getPlatformIconBg(
                                    post.platform,
                                  )}`}
                                >
                                  {getPlatformIcon(post.platform)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {user?.name}
                                  </p>
                                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                    Posted via
                                    <span className="font-medium text-indigo-600 capitalize">
                                      {post.platform}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{formatDate(post.createdAt)}</span>
                                  </p>
                                </div>
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>

                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs font-medium text-slate-500">
                                    Post Link
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 font-mono break-all">
                                  {post.url}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Activities;
