import React from 'react';
import { BookOpen, Clock, CalendarCheck, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import SkillsOverview from '@/components/dashboard/SkillsOverview';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                    <span>Last updated: just now</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Assignments Pending"
                    value="4"
                    icon={BookOpen}
                    iconClassName="bg-blue-50 text-blue-600"
                    trend={{ value: 12, label: "vs last week", positive: false }}
                />
                <StatCard
                    title="Learning Hours"
                    value="24.5h"
                    icon={Clock}
                    iconClassName="bg-purple-50 text-purple-600"
                    trend={{ value: 8, label: "vs last week", positive: true }}
                />
                <StatCard
                    title="Attendance Rate"
                    value="92%"
                    icon={CalendarCheck}
                    iconClassName="bg-green-50 text-green-600"
                    trend={{ value: 2, label: "vs last month", positive: true }}
                />
                <StatCard
                    title="Skill Points"
                    value="1,250"
                    icon={TrendingUp}
                    iconClassName="bg-orange-50 text-orange-600"
                    trend={{ value: 15, label: "this month", positive: true }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <RecentActivity />

                    {/* Ongoing Courses / Assignments Preview could go here */}
                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-6">
                    <SkillsOverview />

                    {/* Quick Actions or Calendar could go here */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
