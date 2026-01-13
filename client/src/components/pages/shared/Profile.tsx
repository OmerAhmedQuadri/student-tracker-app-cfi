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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account information and preferences
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => logout()}
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-24 h-24 mb-6 relative">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white ring-offset-2 ring-offset-gray-100 uppercase">
                    {user?.name?.charAt(0) || <User className="w-12 h-12" />}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge
                    className={`px-3 py-1 capitalize font-medium pointer-events-none ${
                      isMentor
                        ? "bg-purple-100 text-purple-700"
                        : isAdmin
                        ? "bg-red-100 text-red-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {user?.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="px-3 py-1 bg-green-50 text-green-700 border-green-200 pointer-events-none"
                  >
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings & Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Account Details */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Account Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                      className="bg-gray-50 border-gray-200 text-gray-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50 border-gray-200 text-gray-900 font-medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Social Presence (STUDENT ONLY) */}
            {isStudent && (
              <form onSubmit={handleSaveSocials}>
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Globe className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            Social Presence
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-sm">
                            Update your external profile links
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  <CardContent className="space-y-5 pt-6">
                    {/* GitHub */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="github"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Github className="w-4 h-4" /> GitHub Profile
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                          https://github.com/
                        </span>
                        <Input
                          id="github"
                          placeholder="username"
                          className="pl-[9rem] h-10 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          value={socials.githubUrl.replace(
                            "https://github.com/",
                            ""
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
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" /> LinkedIn Profile
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                          https://linkedin.com/in/
                        </span>
                        <Input
                          id="linkedin"
                          placeholder="username"
                          className="pl-[11rem] h-10 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          value={socials.linkedinUrl.replace(
                            "https://linkedin.com/in/",
                            ""
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
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" /> Portfolio / Blog
                      </Label>
                      <Input
                        id="medium"
                        placeholder="https://yourwebsite.com"
                        className="h-10 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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

            {/* 3. Security */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Security
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Lock className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>
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
