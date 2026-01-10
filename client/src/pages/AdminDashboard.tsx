import { Users, GraduationCap, School, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import SkillsOverview from '@/components/dashboard/SkillsOverview';

const AdminDashboard = () => {
    // const { user } = useAuth();
    
    return (
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-500">System overview and management.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                  <span>System Status: Healthy</span>
              </div>
          </div>
  
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                  title="Total Students"
                  value="150"
                  icon={GraduationCap}
                  iconClassName="bg-blue-50 text-blue-600"
                  trend={{ value: 12, label: "this month", positive: true }}
              />
              <StatCard
                  title="Total Mentors"
                  value="12"
                  icon={School}
                  iconClassName="bg-purple-50 text-purple-600"
              />
              <StatCard
                  title="Active Users"
                  value="142"
                  icon={Users}
                  iconClassName="bg-green-50 text-green-600"
                  trend={{ value: 95, label: "engagement rate", positive: true }}
              />
               <StatCard
                  title="System Alerts"
                  value="0"
                  icon={AlertCircle}
                  iconClassName="bg-red-50 text-red-600"
                  trend={{ value: 0, label: "all systems operational", positive: true }}
              />
          </div>
  
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left Column (2/3 width) - System Activity */}
              <div className="lg:col-span-2 space-y-6">
                  {/* Reuse RecentActivity to show system logs placeholder */}
                  <RecentActivity activities={[]} />
              </div>
  
              {/* Right Column (1/3 width) - Platform Stats */}
              <div className="space-y-6">
                  {/* Reuse SkillsOverview to show platform usage placeholder */}
                  <SkillsOverview skills={[]} />
              </div>
          </div>
      </div>
    );
};

export default AdminDashboard;
