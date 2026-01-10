import { useEffect, useState } from 'react';
import { Send, Twitter, Linkedin, Github, Loader2, Radio, Share2, Globe, ExternalLink, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface BrandingPost {
    _id: string;
    platform: 'linkedin' | 'medium' | 'twitter' | 'github';
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
    const [externalActivities, setExternalActivities] = useState<ExternalActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    // Form
    const [platform, setPlatform] = useState('linkedin');
    const [url, setUrl] = useState('');

    const fetchData = async () => {
        try {
            const [postsRes, extRes] = await Promise.all([
                api.get('/external-activities/posts/my'),
                api.get('/external-activities/my')
            ]);
            setPosts(postsRes.data);
            setExternalActivities(extRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch activities");
        } finally {
            setLoading(false);
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
            await api.post('/external-activities/post', {
                platform,
                url
            });
            toast.success("Post logged successfully!");
            setUrl('');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to log post");
        } finally {
            setPosting(false);
        }
    };

    const isConnected = (plat: string) => externalActivities.some(e => e.platform.toLowerCase() === plat.toLowerCase());

    const getPlatformIcon = (plat: string) => {
        switch (plat) {
            case 'github': return <Github className="w-5 h-5 text-gray-900" />;
            case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-700" />;
            case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />;
            case 'medium': return <BookOpenIcon className="w-5 h-5 text-gray-800" />; // Fallback icon
            default: return <Globe className="w-5 h-5 text-gray-500" />;
        }
    };

    // Quick Fix for missing icon
    const BookOpenIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">External Activities</h1>
                            </div>
                            <p className="text-indigo-100 text-lg max-w-2xl">
                                Showcase your tech journey. Log your posts, contributions, and achievements across platforms.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                            <div className="flex -space-x-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                                ))}
                            </div>
                            <div className="text-white">
                                <p className="text-sm font-semibold">Community Active</p>
                                <p className="text-xs text-indigo-200">Join the conversation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Integrations & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-indigo-600" /> 
                                    Integrations
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Connect your developer accounts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                {['github', 'leetcode', 'hackerrank'].map(plat => {
                                    const connected = isConnected(plat);
                                    return (
                                        <div key={plat} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                                                    plat === 'github' ? 'bg-gray-900 text-white' :
                                                    plat === 'leetcode' ? 'bg-amber-500 text-white' :
                                                    'bg-green-600 text-white'
                                                }`}>
                                                    {plat === 'github' && <Github className="w-5 h-5" />}
                                                    {plat === 'leetcode' && <Activity className="w-5 h-5" />}
                                                    {plat === 'hackerrank' && <CodeIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm capitalize text-gray-900">{plat}</p>
                                                    <p className="text-xs text-gray-500">{connected ? 'Syncing data...' : 'Not connected'}</p>
                                                </div>
                                            </div>
                                            <Badge variant={connected ? "default" : "outline"} className={connected ? "bg-green-500 hover:bg-green-600 text-white border-none" : "hover:bg-gray-100"}>
                                                {connected ? 'Active' : 'Connect'}
                                            </Badge>
                                        </div>
                                    );
                                })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Widget */}
                        <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white border-none shadow-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg font-bold">Activity Streak</h3>
                                </div>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-5xl font-black">{posts.length}</span>
                                    <span className="text-sm text-white/70 mb-2">posts logged</span>
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[15%] rounded-full shadow-lg"></div>
                                </div>
                                <p className="text-xs text-white/70 mt-3">Keep sharing to build your streak! 🚀</p>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Main Content: Log & Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Post Composer */}
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-4">
                                <div className="flex justify-between items-center flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Send className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold">Share Your Win</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                Log posts, articles, or contributions
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Public Feed
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Platform</label>
                                        <div className="relative">
                                            <select
                                                className="flex h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                                                value={platform}
                                                onChange={(e) => setPlatform(e.target.value)}
                                            >
                                                <option value="linkedin">LinkedIn</option>
                                                <option value="medium">Medium</option>
                                                <option value="twitter">X (Twitter)</option>
                                                <option value="github">GitHub</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Post URL</label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="https://linkedin.com/posts/..."
                                                className="h-11 border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                            />
                                            <Button
                                                onClick={handlePost}
                                                disabled={posting}
                                                className="h-11 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
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
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
                                <Badge variant="outline" className="font-normal">
                                    {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                                </Badge>
                            </div>

                            {posts.length === 0 && (
                                <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-none">
                                    <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
                                            <Radio className="w-9 h-9 text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
                                        <p className="text-gray-500 max-w-sm leading-relaxed">
                                            Share your first post or achievement to build your developer portfolio. Your activities will appear here.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <Card key={post._id} className="group hover:shadow-xl transition-all duration-300 border-none shadow-lg bg-white overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex gap-5">
                                                <div className="shrink-0 relative">
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-4 ring-indigo-50">
                                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border-2 border-gray-100">
                                                        {getPlatformIcon(post.platform)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-base">{user?.name}</p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                                Posted via 
                                                                <span className="font-semibold capitalize text-indigo-600">{post.platform}</span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </p>
                                                        </div>
                                                        <a 
                                                            href={post.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="opacity-0 group-hover:opacity-100 transition-all p-2.5 hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            View
                                                        </a>
                                                    </div>
                                                    
                                                    <div className="mt-3 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:border-indigo-200 transition-all">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-xs font-medium text-gray-500">Post Link</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 font-mono break-all">
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
            </div>
        </div>
    );
};

// Simple internal component for code icon to avoid extra deps if lucide doesn't have it explicitly exported as Code (it's usually Code2 or Code)
const CodeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

export default Activities;
