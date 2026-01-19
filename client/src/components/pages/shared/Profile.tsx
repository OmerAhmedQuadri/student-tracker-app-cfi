import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Github,
  Linkedin,
  Save,
  Loader2,
  Shield,
  Lock,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Globe,
  LogOut,
  LogIn,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Socials state (Only for students)
  const [socials, setSocials] = useState({
    githubUrl: "",
    linkedinUrl: "",
    mediumUrl: "",
  });

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role !== "student") {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/dashboard/student");
        const profile = res.data.profile;
        if (profile && profile.socials) {
          setSocials({
            githubUrl: profile.socials.github?.profileUrl || "",
            linkedinUrl: profile.socials.linkedin?.profileUrl || "",
            mediumUrl: profile.socials.medium?.profileUrl || "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
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

    // Validate URLs
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (socials.githubUrl && !urlRegex.test(socials.githubUrl)) {
      toast.error("Please enter a valid GitHub URL");
      return;
    }
    if (socials.linkedinUrl && !urlRegex.test(socials.linkedinUrl)) {
      toast.error("Please enter a valid LinkedIn URL");
      return;
    }
    if (socials.mediumUrl && !urlRegex.test(socials.mediumUrl)) {
      toast.error("Please enter a valid Portfolio/Blog URL");
      return;
    }

    setSaving(true);
    try {
      await api.put("/students/me/socials", socials);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    setSaving(true);
    try {
      await api.put("/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(error);
      setPasswordError(
        error.response?.data?.message || "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  const isStudent = user?.role === "student";
  const isMentor = user?.role === "mentor";
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Centered & Simplified */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Identity Card - Enhanced Visual Hierarchy */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-28 h-28 mb-6 relative">
                  <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white uppercase">
                    {user?.name?.charAt(0) || <User className="w-14 h-14" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {user?.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 rounded-lg py-2 px-4">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge
                      className={`px-4 py-1.5 capitalize font-semibold text-sm pointer-events-none ${
                        isMentor
                          ? "bg-purple-600 text-white"
                          : isAdmin
                            ? "bg-red-600 text-white"
                            : "bg-indigo-600 text-white"
                      }`}
                    >
                      {user?.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-4 py-1.5 bg-green-50 text-green-700 border-green-300 pointer-events-none font-semibold text-sm shadow-sm"
                    >
                      ● Active
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => logout()}
                    className="w-full border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-700 font-semibold transition-all duration-200 h-11"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings & Forms - Enhanced Visual Design */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Account Details - Improved Readability */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50 py-5 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600 mt-0.5">
                      Your registered account details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      Full Name
                    </Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-900 font-semibold h-11 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      Email Address
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-900 font-semibold h-11 cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Social Presence (STUDENT ONLY) - Enhanced UX */}
            {isStudent && (
              <form onSubmit={handleSaveSocials}>
                <Card className="shadow-sm border border-gray-200 overflow-hidden">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 py-5 px-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            Social Presence
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-600 mt-0.5">
                            Update your external profile links
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10 px-6 font-semibold"
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
                  <CardContent className="space-y-6 pt-6 pb-6 px-6">
                    {/* GitHub */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="github"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Github className="w-4 h-4 text-gray-900" /> GitHub
                        Profile
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                          https://github.com/
                        </span>
                        <Input
                          id="github"
                          placeholder="username"
                          className="pl-[9rem] h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-medium"
                          value={socials.githubUrl.replace(
                            "https://github.com/",
                            "",
                          )}
                          onChange={(e) =>
                            setSocials({
                              ...socials,
                              githubUrl: `https://github.com/${e.target.value}`,
                            })
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="linkedin"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                        Profile
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                          https://linkedin.com/in/
                        </span>
                        <Input
                          id="linkedin"
                          placeholder="username"
                          className="pl-[11rem] h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-medium"
                          value={socials.linkedinUrl.replace(
                            "https://linkedin.com/in/",
                            "",
                          )}
                          onChange={(e) =>
                            setSocials({
                              ...socials,
                              linkedinUrl: `https://linkedin.com/in/${e.target.value}`,
                            })
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Portfolio / Blog */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="medium"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4 text-purple-600" /> Portfolio
                        / Blog
                      </Label>
                      <Input
                        id="medium"
                        placeholder="https://yourwebsite.com"
                        className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-medium"
                        value={socials.mediumUrl}
                        onChange={(e) =>
                          setSocials({ ...socials, mediumUrl: e.target.value })
                        }
                        disabled={saving}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}

            {/* 3. Security - Enhanced Visual Design */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50 py-5 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 rounded-xl">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600 mt-0.5">
                      Manage your account security
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-indigo-100 transition-all duration-200">
                        <Lock className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors duration-200" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          Password
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-gray-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-semibold transition-all duration-200 h-10 px-4"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 relative">
              <div className="text-center pr-8">
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Enter your current password to set a new one
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordModal(false)}
                className="h-8 w-8 p-0 absolute right-2 top-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password" className="text-left block">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="old-password"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-left block">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-left block">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
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

export default Profile;
