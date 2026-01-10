import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface Skill {
    id: string;
    name: string;
    progress: number;
    color: string;
}

interface SkillsOverviewProps {
    skills?: Skill[];
}

const SkillsOverview: React.FC<SkillsOverviewProps> = ({ skills = [] }) => {
    if (skills.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Skills Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">No skills progress yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skills Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {skills.map((skill) => (
                    <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{skill.name}</span>
                            <span className="text-gray-500">{Math.round(skill.progress)}%</span>
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
    );
};

export default SkillsOverview;

