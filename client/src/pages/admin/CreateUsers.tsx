import { useState } from 'react';
import { UserPlus, Users, Shield, Mail, Lock, User, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface CreateUserFormData {
    name: string;
    email: string;
    password: string;
    batch?: string;
}

const AdminCreateUsers = () => {
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showMentorForm, setShowMentorForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [studentData, setStudentData] = useState<CreateUserFormData>({
        name: '',
        email: '',
        password: '',
        batch: ''
    });

    const [mentorData, setMentorData] = useState<CreateUserFormData>({
        name: '',
        email: '',
        password: ''
    });

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = (data: CreateUserFormData, isStudent: boolean) => {
        const errors: Record<string, string> = {};
        
        if (!data.name.trim()) {
            errors.name = 'Name is required';
        } else if (data.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        if (!data.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.password) {
            errors.password = 'Password is required';
        } else if (data.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        return errors;
    };

    const createStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(studentData, true);
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setLoading(true);
        setFormErrors({});
        
        try {
            const res = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(studentData)
            });

            if (res.ok) {
                toast.success('Student created successfully');
                setStudentData({ name: '', email: '', password: '', batch: '' });
                setShowStudentForm(false);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create student');
            }
        } catch (error) {
            console.error('Failed to create student:', error);
            toast.error('Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    const createMentor = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(mentorData, false);
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setLoading(true);
        setFormErrors({});
        
        try {
            const res = await fetch('http://localhost:5000/api/mentors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(mentorData)
            });

            if (res.ok) {
                toast.success('Mentor created successfully');
                setMentorData({ name: '', email: '', password: '' });
                setShowMentorForm(false);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create mentor');
            }
        } catch (error) {
            console.error('Failed to create mentor:', error);
            toast.error('Failed to create mentor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Users</h1>
                            <p className="mt-1 text-sm text-gray-500">Add new students and mentors to the system</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer group" onClick={() => setShowStudentForm(true)}>
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Create Student</CardTitle>
                                    <CardDescription className="text-xs">Add a new student account</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-600">Create student accounts with batch assignment and default credentials.</p>
                            <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create Student
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer group" onClick={() => setShowMentorForm(true)}>
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Shield className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Create Mentor</CardTitle>
                                    <CardDescription className="text-xs">Add a new mentor account</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-600">Create mentor accounts with instructor privileges and access controls.</p>
                            <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create Mentor
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Student Form Modal */}
            {showStudentForm && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Create Student Account</CardTitle>
                                        <CardDescription className="text-xs">Enter student information to create a new account</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowStudentForm(false)} className="h-8 w-8 p-0">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={createStudent} className="space-y-4">
                                <div>
                                    <Label htmlFor="student-name" className="text-sm font-medium">Full Name</Label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="student-name"
                                            className={`pl-9 ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={studentData.name}
                                            onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                                            placeholder="John Doe"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="student-email" className="text-sm font-medium">Email</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="student-email"
                                            type="email"
                                            className={`pl-9 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={studentData.email}
                                            onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="student-password" className="text-sm font-medium">Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="student-password"
                                            type="password"
                                            className={`pl-9 ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={studentData.password}
                                            onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                                            placeholder="••••••••"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                                    {!formErrors.password && (
                                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="student-batch" className="text-sm font-medium">Batch (Optional)</Label>
                                    <Input
                                        id="student-batch"
                                        value={studentData.batch}
                                        onChange={(e) => setStudentData({ ...studentData, batch: e.target.value })}
                                        placeholder="Batch 2024"
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setShowStudentForm(false);
                                            setFormErrors({});
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="bg-green-600 hover:bg-green-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Create Student
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Mentor Form Modal */}
            {showMentorForm && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Create Mentor Account</CardTitle>
                                        <CardDescription className="text-xs">Enter mentor information to create a new account</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowMentorForm(false)} className="h-8 w-8 p-0">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={createMentor} className="space-y-4">
                                <div>
                                    <Label htmlFor="mentor-name" className="text-sm font-medium">Full Name</Label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="mentor-name"
                                            className={`pl-9 ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={mentorData.name}
                                            onChange={(e) => setMentorData({ ...mentorData, name: e.target.value })}
                                            placeholder="Jane Smith"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="mentor-email" className="text-sm font-medium">Email</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="mentor-email"
                                            type="email"
                                            className={`pl-9 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={mentorData.email}
                                            onChange={(e) => setMentorData({ ...mentorData, email: e.target.value })}
                                            placeholder="jane@example.com"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="mentor-password" className="text-sm font-medium">Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="mentor-password"
                                            type="password"
                                            className={`pl-9 ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            value={mentorData.password}
                                            onChange={(e) => setMentorData({ ...mentorData, password: e.target.value })}
                                            placeholder="••••••••"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                                    {!formErrors.password && (
                                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                                    )}
                                </div>
                                
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setShowMentorForm(false);
                                            setFormErrors({});
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="bg-purple-600 hover:bg-purple-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Create Mentor
                                            </>
                                        )}
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

export default AdminCreateUsers;