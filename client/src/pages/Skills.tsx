import { useEffect, useState } from 'react';
import { Award, Book, Code, TrendingUp, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface SkillProgress {
    _id: string;
    skillId: {
        _id: string;
        name: string;
        category: 'technical' | 'soft' | 'core'; // Assuming category exists
    };
    level: 'beginner' | 'intermediate' | 'advanced';
    topicsCompleted: string[];
}

const Skills = () => {
    const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
    const [allSkills, setAllSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const [progressRes, skillsRes] = await Promise.all([
                    api.get('/skills/progress/my'),
                    api.get('/skills')
                ]);
                setSkillProgress(progressRes.data);
                setAllSkills(skillsRes.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch skills");
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    const updateSkillLevel = async (skillId: string, newLevel: 'beginner' | 'intermediate' | 'advanced') => {
        setUpdating(true);
        try {
            await api.post('/skills/progress', {
                skillId,
                level: newLevel
            });
            
            // Update local state
            setSkillProgress(prev => {
                const existing = prev.find(sp => sp.skillId._id === skillId);
                if (existing) {
                    return prev.map(sp => 
                        sp.skillId._id === skillId ? { ...sp, level: newLevel } : sp
                    );
                } else {
                    // Add new skill progress
                    const skill = allSkills.find(s => s._id === skillId);
                    if (skill) {
                        return [...prev, {
                            _id: Date.now().toString(),
                            skillId: skill,
                            level: newLevel,
                            topicsCompleted: []
                        }];
                    }
                    return prev;
                }
            });

            toast.success('Skill progress updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update skill progress');
        } finally {
            setUpdating(false);
        }
    };

    const getProgressValue = (level: string) => {
        switch (level) {
            case 'beginner': return 33;
            case 'intermediate': return 66;
            case 'advanced': return 100;
            default: return 0;
        }
    };

    const categorizeSkills = () => {
        const categories = {
            'Technical': [] as any[], // fallback
            'Soft Skills': [] as any[],
            'Core Subjects': [] as any[]
        };

        skillProgress.forEach(sp => {
            // Simplified categorization logic if endpoint doesn't return category
            // Just pushing all to Technical for now if category undefined, or based on name
            // Assuming the Skill model has a category. If not, just listing them all in one big list or grouped by random logic
            // Let's assume grouping based on response or defaulting.
            const cat = sp.skillId.category || 'technical';
            const item = {
                _id: sp._id,
                skillId: sp.skillId._id,
                name: sp.skillId.name,
                level: sp.level,
                progress: getProgressValue(sp.level),
                color: 'bg-blue-600' // Dynamic color logic could be here
            };

            if (cat === 'core') categories['Core Subjects'].push(item);
            else if (cat === 'soft') categories['Soft Skills'].push(item);
            else categories['Technical'].push(item);
        });

        return [
            { title: "Technical Skills", icon: Code, skills: categories['Technical'] },
            { title: "Core Subjects", icon: Book, skills: categories['Core Subjects'] },
            { title: "Soft Skills", icon: Award, skills: categories['Soft Skills'] }
        ].filter(c => c.skills.length > 0);
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    const skillCategories = categorizeSkills();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Skills & Progress</h1>
                <p className="text-gray-500">Visualize your academic and personal growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillCategories.length === 0 && <p className="text-gray-500">No skills tracked yet.</p>}
                {skillCategories.map((category, idx) => (
                    <Card key={idx} className="h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <category.icon className="w-5 h-5 text-gray-700" />
                                </div>
                                <CardTitle>{category.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {category.skills.map((skill: any) => (
                                <div key={skill.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-700">{skill.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {skill.level}
                                            </Badge>
                                            <select
                                                className="text-xs border rounded px-2 py-1"
                                                value={skill.level}
                                                onChange={(e) => updateSkillLevel(skill.skillId, e.target.value as any)}
                                                disabled={updating}
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Progress
                                        value={skill.progress}
                                        className="h-2"
                                        indicatorClassName={skill.color}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Skills;
