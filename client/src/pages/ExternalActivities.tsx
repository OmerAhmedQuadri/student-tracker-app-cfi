import { useEffect, useState } from 'react';
import { Megaphone, Plus, ExternalLink, Github, Linkedin, Twitter, Instagram, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

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
    status: 'pending' | 'approved' | 'rejected';
}

const ExternalActivitiesPage = () => {
    const [posts, setPosts] = useState<BrandingPost[]>([]);
    const [activities, setActivities] = useState<ExternalActivity[]>([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newPost, setNewPost] = useState({
        platform: 'linkedin',
        url: '',
        description: ''
    });

    const [newActivity, setNewActivity] = useState({
        title: '',
        platform: '',
        description: '',
        url: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, activitiesRes] = await Promise.all([
                fetch('http://localhost:5000/api/external-activities/posts/my', { credentials: 'include' }),
                fetch('http://localhost:5000/api/external-activities/my', { credentials: 'include' })
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
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitPost = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/external-activities/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newPost)
            });

            if (res.ok) {
                const data = await res.json();
                setPosts([data, ...posts]);
                setShowPostModal(false);
                setNewPost({ platform: 'linkedin', url: '', description: '' });
                toast.success('Branding post added successfully');
            }
        } catch (error) {
            console.error('Failed to add post:', error);
            toast.error('Failed to add post');
        }
    };

    const submitActivity = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/external-activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newActivity)
            });

            if (res.ok) {
                const data = await res.json();
                setActivities([data, ...activities]);
                setShowActivityModal(false);
                setNewActivity({ title: '', platform: '', description: '', url: '' });
                toast.success('External activity submitted for review');
            }
        } catch (error) {
            console.error('Failed to submit activity:', error);
            toast.error('Failed to submit activity');
        }
    };

    const getPlatformIcon = (platform: string) => {
        const lower = platform.toLowerCase();
        if (lower.includes('github')) return <Github className="w-4 h-4" />;
        if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (lower.includes('twitter') || lower.includes('x')) return <Twitter className="w-4 h-4" />;
        if (lower.includes('instagram')) return <Instagram className="w-4 h-4" />;
        return <Megaphone className="w-4 h-4" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                            <Megaphone className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">External Activities</h1>
                            <p className="text-purple-100 text-sm mt-1">Share your achievements and projects</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Branding Posts</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{posts.length}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Megaphone className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Activities</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{activities.length}</p>
                                </div>
                                <div className="p-3 bg-pink-50 rounded-xl">
                                    <ExternalLink className="w-5 h-5 text-pink-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Approved</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">
                                        {activities.filter(a => a.status === 'approved').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Eye className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Branding Posts */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold">Branding Posts</CardTitle>
                                    <CardDescription className="text-xs">Share your social media presence</CardDescription>
                                </div>
                                <Button onClick={() => setShowPostModal(true)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Post
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No posts yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Start sharing your content</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {posts.map((post) => (
                                        <div key={post._id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        {getPlatformIcon(post.platform)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm capitalize">{post.platform}</p>
                                                        {post.description && (
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* External Activities */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold">External Activities</CardTitle>
                                    <CardDescription className="text-xs">Log your external contributions</CardDescription>
                                </div>
                                <Button onClick={() => setShowActivityModal(true)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Log Activity
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                            {activities.length === 0 ? (
                                <div className="text-center py-12">
                                    <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No activities yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Log your external work</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div key={activity._id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-sm">{activity.title}</h4>
                                                <Badge className={getStatusColor(activity.status)}>
                                                    {activity.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getPlatformIcon(activity.platform)}
                                                    <span className="text-xs text-gray-500">{activity.platform}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {activity.status === 'approved' && (
                                                        <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                                                            +{activity.points} pts
                                                        </Badge>
                                                    )}
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={activity.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-3 h-3" />
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
            </div>

            {/* Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Add Branding Post</CardTitle>
                            <CardDescription>Share your social media content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Platform</label>
                                <select
                                    className="w-full mt-1 p-2 border rounded-md"
                                    value={newPost.platform}
                                    onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                                >
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="twitter">Twitter/X</option>
                                    <option value="github">GitHub</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">URL</label>
                                <Input
                                    value={newPost.url}
                                    onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                                    placeholder="https://..."
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description (optional)</label>
                                <Textarea
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                    placeholder="Brief description..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowPostModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={submitPost} disabled={!newPost.url}>
                                    Add Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Log External Activity</CardTitle>
                            <CardDescription>Submit your external work for review</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={newActivity.title}
                                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                    placeholder="Activity title..."
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Platform</label>
                                <Input
                                    value={newActivity.platform}
                                    onChange={(e) => setNewActivity({ ...newActivity, platform: e.target.value })}
                                    placeholder="e.g., GitHub, Medium, Dev.to"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                    placeholder="Describe your contribution..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">URL</label>
                                <Input
                                    value={newActivity.url}
                                    onChange={(e) => setNewActivity({ ...newActivity, url: e.target.value })}
                                    placeholder="https://..."
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowActivityModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitActivity}
                                    disabled={!newActivity.title || !newActivity.platform || !newActivity.url}
                                >
                                    Submit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ExternalActivitiesPage;
