import { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Mail, Lock, Globe, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'EduTrack',
        supportEmail: 'support@edutrack.com',
        maxFileSize: '10',
        sessionTimeout: '30',
        enableNotifications: true,
        enableEmailAlerts: true,
        maintenanceMode: false,
        allowRegistration: true
    });

    const handleSave = () => {
        // Here you would typically save to API
        toast.success('Settings saved successfully!');
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                            <SettingsIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                            <p className="text-gray-200 text-sm mt-1">Configure platform settings and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-600" />
                                <CardTitle className="text-base font-bold">General Settings</CardTitle>
                            </div>
                            <CardDescription className="text-xs">Basic platform configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="siteName" className="text-xs font-semibold text-gray-700">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supportEmail" className="text-xs font-semibold text-gray-700">Support Email</Label>
                                <Input
                                    id="supportEmail"
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxFileSize" className="text-xs font-semibold text-gray-700">Max File Size (MB)</Label>
                                <Input
                                    id="maxFileSize"
                                    type="number"
                                    value={settings.maxFileSize}
                                    onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout" className="text-xs font-semibold text-gray-700">Session Timeout (minutes)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-600" />
                                <CardTitle className="text-base font-bold">Notifications</CardTitle>
                            </div>
                            <CardDescription className="text-xs">Manage notification preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-4 h-4 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Push Notifications</p>
                                        <p className="text-xs text-gray-500">Enable in-app notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('enableNotifications')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Email Alerts</p>
                                        <p className="text-xs text-gray-500">Send email notifications</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('enableEmailAlerts')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.enableEmailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.enableEmailAlerts ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-red-600" />
                                <CardTitle className="text-base font-bold">Security</CardTitle>
                            </div>
                            <CardDescription className="text-xs">Security and access control</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Maintenance Mode</p>
                                        <p className="text-xs text-gray-500">Restrict access to admins only</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('maintenanceMode')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Allow Registration</p>
                                        <p className="text-xs text-gray-500">Enable new user signups</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('allowRegistration')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.allowRegistration ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {settings.maintenanceMode && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Zap className="w-4 h-4 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-red-900">Maintenance Mode Active</p>
                                            <p className="text-xs text-red-700 mt-1">Only administrators can access the platform</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Database */}
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-purple-600" />
                                <CardTitle className="text-base font-bold">Database</CardTitle>
                            </div>
                            <CardDescription className="text-xs">Database management tools</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-gray-700">Database Status</p>
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">Last backup: 2 hours ago</p>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full h-9 text-sm"
                                    onClick={() => toast.success('Backup initiated')}
                                >
                                    <Database className="w-3 h-3 mr-2" />
                                    Create Backup
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full h-9 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear cache? This action cannot be undone.')) {
                                            toast.success('Cache cleared successfully');
                                        }
                                    }}
                                >
                                    <Zap className="w-3 h-3 mr-2" />
                                    Clear Cache
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save All Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
