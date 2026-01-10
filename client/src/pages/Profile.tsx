import React, { useEffect, useState } from 'react';
import { User, Mail, Github, Linkedin, Save, Loader2, Shield, Lock, Briefcase, GraduationCap, LayoutDashboard, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Socials state (Only for students)
    const [socials, setSocials] = useState({
        githubUrl: '',
        linkedinUrl: '',
        mediumUrl: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.role !== 'student') {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/dashboard/student');
                const profile = res.data.profile;
                if (profile && profile.socials) {
                    setSocials({
                        githubUrl: profile.socials.github?.profileUrl || '',
                        linkedinUrl: profile.socials.linkedin?.profileUrl || '',
                        mediumUrl: profile.socials.medium?.profileUrl || ''
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        } else {
             setLoading(false);
        }
    }, [user]);

    const handleSaveSocials = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/students/me/socials', socials);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    const isStudent = user?.role === 'student';
    const isMentor = user?.role === 'mentor';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Header Banner */}
            <div className="relative h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                
                {/* Header Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                        <p className="text-indigo-100">Manage your account information and preferences.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => logout()} 
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-20 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Identity Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardContent className="p-8 text-center">
                                <div className="mx-auto w-28 h-28 mb-6 relative">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white ring-offset-2 ring-offset-gray-100 uppercase">
                                        {user?.name?.charAt(0) || <User className="w-12 h-12" />}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                                    <div className="flex items-center justify-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <Badge className={`px-4 py-1.5 capitalize font-medium ${
                                        isMentor ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                                        isAdmin ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                        'bg-indigo-100 text-indigo-700 hover:bg-indigo-100'
                                    }`}>
                                        {user?.role}
                                    </Badge>
                                    <Badge variant="outline" className="px-4 py-1.5 bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                        Active
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role Specific Info Card */}
                        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        isMentor ? 'bg-purple-500 text-white' : 'bg-indigo-500 text-white'
                                    } shadow-lg`}>
                                        {isMentor ? <Briefcase className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-base mb-1">
                                            {isMentor ? "Mentor Access" : "Student Account"}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {isMentor 
                                                ? "You have full access to manage assignments, view student progress, and schedule sessions."
                                                : "You are enrolled in the full-stack development track. Keep up the great work!"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Settings & Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Account Details */}
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">Account Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                                        <Input 
                                            value={user?.name || ''} 
                                            disabled 
                                            className="bg-gray-50 border-gray-200 text-gray-900 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                                        <Input 
                                            value={user?.email || ''} 
                                            disabled 
                                            className="bg-gray-50 border-gray-200 text-gray-900 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">User ID</Label>
                                        <Input 
                                            value={user?.id || ''} 
                                            disabled 
                                            className="font-mono text-xs bg-gray-50 border-gray-200 text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Role</Label>
                                        <Input 
                                            value={user?.role?.toUpperCase() || ''} 
                                            disabled 
                                            className="bg-gray-50 border-gray-200 text-gray-900 font-semibold"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Social Presence (STUDENT ONLY) */}
                        {isStudent && (
                            <form onSubmit={handleSaveSocials}>
                                <Card className="border-none shadow-lg bg-white">
                                    <CardHeader className="pb-4 border-b">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Globe className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-bold">Social Presence</CardTitle>
                                                    <CardDescription className="mt-0.5 text-sm">
                                                        Update your external profile links.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button 
                                                type="submit" 
                                                disabled={saving}
                                                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        {/* GitHub */}
                                        <div className="space-y-2">
                                            <Label htmlFor="github" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Github className="w-4 h-4" /> GitHub Profile
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                                                    https://github.com/
                                                </span>
                                                <Input 
                                                    id="github" 
                                                    placeholder="username" 
                                                    className="pl-[9rem] h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                                    value={socials.githubUrl.replace('https://github.com/', '')}
                                                    onChange={(e) => setSocials({...socials, githubUrl: `https://github.com/${e.target.value}`})}
                                                />
                                            </div>
                                        </div>

                                        {/* LinkedIn */}
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Linkedin className="w-4 h-4" /> LinkedIn Profile
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                                                    https://linkedin.com/in/
                                                </span>
                                                <Input 
                                                    id="linkedin" 
                                                    placeholder="username" 
                                                    className="pl-[11rem] h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                                    value={socials.linkedinUrl.replace('https://linkedin.com/in/', '')}
                                                    onChange={(e) => setSocials({...socials, linkedinUrl: `https://linkedin.com/in/${e.target.value}`})}
                                                />
                                            </div>
                                        </div>

                                        {/* Portfolio / Blog */}
                                        <div className="space-y-2">
                                            <Label htmlFor="medium" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Portfolio / Blog
                                            </Label>
                                            <Input 
                                                id="medium" 
                                                placeholder="https://yourwebsite.com" 
                                                className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                                value={socials.mediumUrl}
                                                onChange={(e) => setSocials({...socials, mediumUrl: e.target.value})}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        )}

                        {/* 3. Security */}
                        <Card className="border-none shadow-lg bg-white">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Shield className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">Security</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between p-5 border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <Lock className="w-5 h-5 text-gray-700" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-gray-900">Password</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Last changed 30 days ago</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled
                                        className="border-gray-300 hover:bg-gray-100"
                                    >
                                        Change
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
