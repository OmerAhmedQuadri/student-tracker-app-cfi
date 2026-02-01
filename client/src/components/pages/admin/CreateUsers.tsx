import { useState } from "react";
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  Lock,
  User,
  X,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Badge } from '@/components/ui/badge';
import { toast } from "react-hot-toast";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from "@/lib/api";

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  batch?: string;
  phone?: string;
}

const AdminCreateUsers = () => {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showMentorPassword, setShowMentorPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [batches, setBatches] = useState<{ batchId: string; description?: string }[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await api.get("/admin/batches");
      setBatches(res.data);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };


  const handleOpenMentorForm = () => {
    setShowMentorForm(true);
  };

  const [studentData, setStudentData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: "",
    batch: "",
    phone: "",
  });

  const [adminData, setAdminData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [mentorData, setMentorData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: "",
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (data: CreateUserFormData) => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    return errors;
  };

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(studentData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      await api.post("/students", studentData);

      toast.success("Student created successfully");
      setStudentData({ name: "", email: "", password: "", batch: "", phone: "" });
      setShowStudentForm(false);
    } catch (error: any) {
      console.error("Failed to create student:", error);
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const createMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(mentorData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      await api.post("/mentors", {
        ...mentorData,
        batchId: mentorData.batch,
      });

      toast.success("Mentor created successfully");
      setMentorData({ name: "", email: "", password: "", batch: "" });
      setShowMentorForm(false);
    } catch (error: any) {
      console.error("Failed to create mentor:", error);
      toast.error(error.response?.data?.message || "Failed to create mentor");
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(adminData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      await api.post("/admin", adminData);

      toast.success("Admin created successfully");
      setAdminData({ name: "", email: "", password: "" });
      setShowAdminForm(false);
    } catch (error: any) {
      console.error("Failed to create admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add new students and mentors to the system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer group"
            onClick={() => {
              fetchBatches();
              setShowStudentForm(true);
            }}
          >
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create Student</CardTitle>
                  <CardDescription className="text-xs">
                    Add a new student account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 text-left">
                Create student accounts with batch assignment and default
                credentials.
              </p>
              <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Student
              </Button>
            </CardContent>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer group"
            onClick={handleOpenMentorForm}
          >
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create Mentor</CardTitle>
                  <CardDescription className="text-xs">
                    Add a new mentor account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 text-left">
                Create mentor accounts with instructor privileges and access
                controls.
              </p>
              <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Mentor
              </Button>
            </CardContent>
          </Card>

          <Card
            className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer group"
            onClick={() => setShowAdminForm(true)}
          >
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create Admin</CardTitle>
                  <CardDescription className="text-xs">
                    Add a new admin account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 text-left">
                Create admin accounts with full system access and privileges.
              </p>
              <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Admin
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
                    <CardTitle className="text-lg">
                      Create Student Account
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter student information to create a new account
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStudentForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={createStudent} className="space-y-4">
                <div>
                  <Label
                    htmlFor="student-name"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Full Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="student-name"
                      className={`pl-9 ${formErrors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={studentData.name}
                      onChange={(e) =>
                        setStudentData({ ...studentData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="student-email"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="student-email"
                      type="email"
                      className={`pl-9 ${formErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={studentData.email}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="student-password"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="student-password"
                      type={showStudentPassword ? "text" : "password"}
                      className={`pl-9 pr-10 ${formErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={studentData.password}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          password: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowStudentPassword(!showStudentPassword)
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showStudentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                  {!formErrors.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="student-batch"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Batch
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="student-batch"
                      className={`w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border ${formErrors.batch ? "border-red-300" : ""}`}
                      value={studentData.batch || ""}
                      onChange={(e) => setStudentData({ ...studentData, batch: e.target.value })}
                      disabled={loading}
                    >
                      <option value="">Select a batch</option>
                      {batches.map((b) => (
                        <option key={b.batchId} value={b.batchId}>
                          {b.batchId}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="student-phone"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Phone Number
                  </Label>
                  <PhoneInput
                    country={'in'}
                    value={studentData.phone}
                    onChange={(phone) => setStudentData({ ...studentData, phone })}
                    containerStyle={{ width: '100%' }}
                    inputStyle={{ width: '100%', height: '40px', borderRadius: '0.375rem', borderColor: '#e5e7eb' }}
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
                    <CardTitle className="text-lg">
                      Create Mentor Account
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter mentor information to create a new account
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMentorForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={createMentor} className="space-y-4">
                <div>
                  <Label
                    htmlFor="mentor-name"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Full Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mentor-name"
                      className={`pl-9 ${formErrors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={mentorData.name}
                      onChange={(e) =>
                        setMentorData({ ...mentorData, name: e.target.value })
                      }
                      placeholder="Jane Smith"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="mentor-email"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mentor-email"
                      type="email"
                      className={`pl-9 ${formErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={mentorData.email}
                      onChange={(e) =>
                        setMentorData({ ...mentorData, email: e.target.value })
                      }
                      placeholder="jane@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>





                <div>
                  <Label
                    htmlFor="mentor-password"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Password
                  </Label>
                  {/* Password Input continues below... */}
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="mentor-password"
                      type={showMentorPassword ? "text" : "password"}
                      className={`pl-9 pr-10 ${formErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={mentorData.password}
                      onChange={(e) =>
                        setMentorData({
                          ...mentorData,
                          password: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMentorPassword(!showMentorPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showMentorPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                  {!formErrors.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters
                    </p>
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

      {/* Admin Form Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Create Admin Account
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter admin information to create a new account
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdminForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={createAdmin} className="space-y-4">
                <div>
                  <Label
                    htmlFor="admin-name"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Full Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-name"
                      className={`pl-9 ${formErrors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={adminData.name}
                      onChange={(e) =>
                        setAdminData({ ...adminData, name: e.target.value })
                      }
                      placeholder="John Admin"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="admin-email"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      className={`pl-9 ${formErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={adminData.email}
                      onChange={(e) =>
                        setAdminData({ ...adminData, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-left block mb-2"
                  >
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      className={`pl-9 pr-10 ${formErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                      value={adminData.password}
                      onChange={(e) =>
                        setAdminData({ ...adminData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                  {!formErrors.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAdminForm(false);
                      setFormErrors({});
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Admin
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
