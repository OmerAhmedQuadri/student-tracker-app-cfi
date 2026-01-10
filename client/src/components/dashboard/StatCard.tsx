import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '../../lib/utils'; // Assuming you have utility for class merging

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
    iconClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    className,
    iconClassName
}) => {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={cn("p-2 bg-blue-50 rounded-lg", iconClassName)}>
                        <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={cn(
                                "font-medium",
                                trend.positive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.positive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-gray-500 ml-2">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
