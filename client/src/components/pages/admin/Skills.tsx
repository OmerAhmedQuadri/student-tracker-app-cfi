import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Plus, Trash2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Skill {
    _id: string;
    name: string;
}

interface Topic {
    _id: string;
    skillId: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedMinutes: number;
}

const AdminSkills = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
        estimatedMinutes: 60
    });

    const fetchTopics = useCallback(async (skillId: string) => {
        try {
            const res = await api.get(`/admin/skills/topics/${skillId}`);
            setTopics(res.data);
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            setTopics([]);
        }
    }, []);

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSkill) {
            toast.error('Please select a skill first');
            return;
        }

        try {
            await api.post('/admin/skills/topics', {
                skillId: selectedSkill,
                ...formData
            });
            toast.success('Topic created successfully');
            setShowCreateModal(false);
            setFormData({ title: '', difficulty: 'intermediate', estimatedMinutes: 60 });
            fetchTopics(selectedSkill);
        } catch (error) {
            console.error('Failed to create topic:', error);
            toast.error('Failed to create topic');
        }
    };

    const handleDeleteTopic = async (topicId: string) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;

        try {
            await api.delete(`/admin/skills/topics/${topicId}`);
            toast.success('Topic deleted successfully');
            fetchTopics(selectedSkill);
        } catch (error) {
            console.error('Failed to delete topic:', error);
            toast.error('Failed to delete topic');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
            case 'advanced': return 'bg-red-100 text-red-700 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
        }
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await api.get('/skills');
                setSkills(res.data);
                if (res.data.length > 0 && !selectedSkill) {
                    setSelectedSkill(res.data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch skills:', error);
                toast.error('Failed to load skills');
            }
        };
        fetchSkills();
    }, []);

    useEffect(() => {
        if (selectedSkill) {
            fetchTopics(selectedSkill);
        }
    }, [selectedSkill, fetchTopics]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Skills Management</h1>
                            <p className="text-purple-100 text-sm mt-1">Manage skills and topics</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowCreateModal(true)}
                        disabled={!selectedSkill}
                        className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Topic
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Skills</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{skills.length}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Topics</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{topics.length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Target className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Avg. Duration</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">
                                        {topics.length > 0 ? Math.round(topics.reduce((sum, t) => sum + t.estimatedMinutes, 0) / topics.length) : 0}m
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Target className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Skills List */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <CardTitle className="text-base font-bold">Skills</CardTitle>
                            <CardDescription className="text-xs">Select a skill to view topics</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {skills.map(skill => (
                                    <button
                                        key={skill._id}
                                        onClick={() => setSelectedSkill(skill._id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${selectedSkill === skill._id
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold">{skill.name}</p>
                                    </button>
                                ))}

                                {skills.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-xs text-gray-500">No skills found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Topics List */}
                    <Card className="lg:col-span-3 border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <CardTitle className="text-base font-bold">
                                {skills.find(s => s._id === selectedSkill)?.name || 'Select a Skill'} Topics
                            </CardTitle>
                            <CardDescription className="text-xs">Learning topics and their difficulty levels</CardDescription>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {topics.map((topic) => (
                                    <div
                                        key={topic._id}
                                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-base font-bold text-gray-900 mb-2">{topic.title}</h3>

                                                <div className="flex items-center gap-3">
                                                    <Badge className={getDifficultyColor(topic.difficulty)}>
                                                        {topic.difficulty}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        ⏱️ {topic.estimatedMinutes} mins
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteTopic(topic._id)}
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {topics.length === 0 && (
                                    <div className="text-center py-12">
                                        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No topics found</p>
                                        <Button
                                            onClick={() => setShowCreateModal(true)}
                                            disabled={!selectedSkill}
                                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add First Topic
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg border-none shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <CardTitle className="text-lg font-bold">Add New Topic</CardTitle>
                            <CardDescription className="text-xs">
                                Create a topic for {skills.find(s => s._id === selectedSkill)?.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleCreateTopic} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-semibold text-gray-700">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="React Hooks"
                                        className="h-10"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty" className="text-xs font-semibold text-gray-700">Difficulty</Label>
                                    <select
                                        id="difficulty"
                                        className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimatedMinutes" className="text-xs font-semibold text-gray-700">Estimated Time (minutes)</Label>
                                    <Input
                                        id="estimatedMinutes"
                                        type="number"
                                        min="1"
                                        className="h-10"
                                        value={formData.estimatedMinutes}
                                        onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Add Topic
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminSkills;
