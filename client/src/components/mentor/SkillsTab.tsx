import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Loader2, Edit, Trash2, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Skill {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    order?: number;
    batchId: string;
}

interface SkillTopic {
    _id: string;
    skillId: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedMinutes?: number;
}

interface Batch {
    _id?: string;
    id?: string;
    name?: string;
}

export const SkillsTab = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [topics, setTopics] = useState<SkillTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBatches, setLoadingBatches] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [isCreatingSkill, setIsCreatingSkill] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [topicForm, setTopicForm] = useState({
        title: '',
        difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        estimatedMinutes: 30
    });

    const [skillForm, setSkillForm] = useState({
        name: '',
        batchId: ''
    });

    useEffect(() => {
        loadBatches();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            loadSkills();
        }
    }, [selectedBatch]);

    useEffect(() => {
        if (selectedSkill) {
            loadTopics(selectedSkill._id);
        } else {
            setTopics([]);
        }
    }, [selectedSkill]);

    const loadBatches = async () => {
        setLoadingBatches(true);
        try {
            const response = await api.get('/mentor/batches');
            const batchData = response.data.map((id: string) => ({ id }));
            setBatches(batchData);
            if (batchData.length > 0) {
                setSelectedBatch(batchData[0].id);
            }
        } catch (error: any) {
            console.error('Failed to load batches', error);
            toast.error('Failed to load batches');
        } finally {
            setLoadingBatches(false);
        }
    };

    const loadSkills = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        try {
            const response = await api.get(`/mentor/skills?batchId=${selectedBatch}`);
            setSkills(response.data);
        } catch (error: any) {
            console.error('Failed to load skills', error);
            toast.error(error?.response?.data?.message || 'Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const loadTopics = async (skillId: string) => {
        setLoadingTopics(true);
        try {
            const response = await api.get(`/mentor/skills/topics/${skillId}`);
            setTopics(response.data);
        } catch (error: any) {
            console.error('Failed to load topics', error);
            toast.error('Failed to load topics');
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSkill) return;

        setIsSubmitting(true);
        try {
            await api.post('/mentor/skills/topics', {
                skillId: selectedSkill._id,
                ...topicForm
            });
            toast.success('Topic created successfully');
            setIsCreatingTopic(false);
            setTopicForm({ title: '', difficulty: 'beginner', estimatedMinutes: 30 });
            loadTopics(selectedSkill._id);
        } catch (error: any) {
            console.error('Failed to create topic', error);
            toast.error(error?.response?.data?.message || 'Failed to create topic');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateSkill = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBatch) {
            toast.error('Please select a batch first');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/mentor/skills', {
                ...skillForm,
                batchId: selectedBatch
            });
            toast.success('Skill created successfully');
            setIsCreatingSkill(false);
            setSkillForm({ name: '', batchId: '' });
            loadSkills();
            setSelectedSkill(response.data);
        } catch (error: any) {
            console.error('Failed to create skill', error);
            toast.error(error?.response?.data?.message || 'Failed to create skill');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSkill = async (skillId: string) => {
        if (!confirm('Are you sure you want to delete this skill? All related topics will also be deleted.')) return;

        try {
            await api.delete(`/mentor/skills/${skillId}`);
            toast.success('Skill deleted successfully');
            if (selectedSkill?._id === skillId) {
                setSelectedSkill(null);
            }
            loadSkills();
        } catch (error: any) {
            console.error('Failed to delete skill', error);
            toast.error('Failed to delete skill');
        }
    };

    const handleDeleteTopic = async (topicId: string) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;

        try {
            await api.delete(`/mentor/skills/topics/${topicId}`);
            toast.success('Topic deleted successfully');
            if (selectedSkill) loadTopics(selectedSkill._id);
        } catch (error: any) {
            console.error('Failed to delete topic', error);
            toast.error('Failed to delete topic');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'advanced':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Skills Management</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Manage skills and their topics for students</p>
                </div>
                <Button
                    onClick={() => setIsCreatingSkill(true)}
                    disabled={!selectedBatch || loadingBatches}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto disabled:opacity-50"
                >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Create Skill
                </Button>
            </div>

            {/* Batch Selector */}
            {loadingBatches ? (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                    <Label htmlFor="batchSelect" className="text-xs sm:text-sm font-medium whitespace-nowrap">Batch:</Label>
                    <select
                        id="batchSelect"
                        value={selectedBatch}
                        onChange={(e) => {
                            setSelectedBatch(e.target.value);
                            setSelectedSkill(null);
                        }}
                        className="flex-1 h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-200 text-xs sm:text-sm"
                    >
                        {batches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.name || batch.id}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Skills List */}
                <Card className="lg:col-span-4 bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-6 border-b border-gray-100">
                        <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">Skills List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isCreatingSkill ? (
                            <form onSubmit={handleCreateSkill} className="p-3 sm:p-4 space-y-3 bg-purple-50 border-b border-gray-200">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="skillName" className="text-xs sm:text-sm">Skill Name</Label>
                                    <Input
                                        id="skillName"
                                        placeholder="e.g., React Development"
                                        value={skillForm.name}
                                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                                        required
                                        className="h-8 sm:h-9 text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreatingSkill(false);
                                            setSkillForm({ name: '', batchId: '' });
                                        }}
                                        disabled={isSubmitting}
                                        className="h-8 sm:h-9 text-xs w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-9 text-xs w-full sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Skill'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                        <div className="divide-y divide-gray-100 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                            {skills.map((skill) => (
                                <button
                                    key={skill._id}
                                    onClick={() => setSelectedSkill(skill)}
                                    className={`w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 transition-colors ${
                                        selectedSkill?._id === skill._id
                                            ? 'bg-purple-50 border-l-4 border-l-purple-600'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                                {skill.name}
                                            </p>
                                            {skill.description && (
                                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                                    {skill.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSkill(skill._id);
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0"
                                    >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                </button>
                            ))}
                            {skills.length === 0 && (
                                <div className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-center">
                                    <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                    <p className="text-gray-500 text-xs sm:text-sm">No skills found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Topics Section */}
                <Card className="lg:col-span-8 bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">
                                {selectedSkill ? `Topics for ${selectedSkill.name}` : 'Select a Skill'}
                            </CardTitle>
                            {selectedSkill && (
                                <Button
                                    onClick={() => setIsCreatingTopic(!isCreatingTopic)}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white h-7 sm:h-8 text-xs w-full sm:w-auto"
                                >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Add Topic
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        {!selectedSkill ? (
                            <div className="text-center py-12 sm:py-16">
                                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                <p className="text-sm sm:text-base text-gray-500 font-medium">No skill selected</p>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                                    Select a skill from the list to view its topics
                                </p>
                            </div>
                        ) : isCreatingTopic ? (
                            <form onSubmit={handleCreateTopic} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-lg">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="title" className="text-xs sm:text-sm">Topic Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Introduction to React Hooks"
                                        value={topicForm.title}
                                        onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                                        required
                                        className="h-8 sm:h-9 text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Label htmlFor="difficulty" className="text-xs sm:text-sm">Difficulty</Label>
                                        <select
                                            id="difficulty"
                                            value={topicForm.difficulty}
                                            onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value as any })}
                                            className="w-full h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-200 text-xs sm:text-sm"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <Label htmlFor="estimatedMinutes" className="text-xs sm:text-sm">Est. Minutes</Label>
                                        <Input
                                            id="estimatedMinutes"
                                            type="number"
                                            value={topicForm.estimatedMinutes}
                                            onChange={(e) => setTopicForm({ ...topicForm, estimatedMinutes: Number(e.target.value) })}
                                            className="h-8 sm:h-9 text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreatingTopic(false);
                                            setTopicForm({ title: '', difficulty: 'beginner', estimatedMinutes: 30 });
                                        }}
                                        disabled={isSubmitting}
                                        className="h-8 sm:h-9 text-xs w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-9 text-xs w-full sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Topic'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {loadingTopics ? (
                            <div className="text-center py-8 sm:py-12">
                                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-purple-600 mx-auto" />
                            </div>
                        ) : topics.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                <p className="text-sm sm:text-base text-gray-500">No topics found</p>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Click "Add Topic" to create the first topic
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {topics.map((topic) => (
                                    <div
                                        key={topic._id}
                                        className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">
                                                    {topic.title}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <Badge
                                                        className={`${getDifficultyColor(topic.difficulty)} text-[10px] sm:text-xs px-2 py-0.5`}
                                                    >
                                                        {topic.difficulty}
                                                    </Badge>
                                                    {topic.estimatedMinutes && (
                                                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {topic.estimatedMinutes} min
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTopic(topic._id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 sm:h-8 w-full sm:w-auto"
                                            >
                                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                                <span className="sm:inline">Delete</span>
                                            </Button>
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
