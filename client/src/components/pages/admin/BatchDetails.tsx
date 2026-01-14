import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Users, 
  Clock, 
  Calendar, 
  BookOpen, 
  Video, 
  MoreVertical, 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  parentName?: string;
  isActive: boolean;
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
}

interface BatchData {
  batchId: string;
  studentCount: number;
  mentorCount: number;
  students: Student[];
  mentors: Mentor[];
}

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const response = await api.get(`/admin/batches/${batchId}`);
        setBatchData(response.data);
      } catch (error) {
        console.error("Failed to fetch batch details:", error);
        toast.error("Failed to load batch details");
        navigate("/admin/batches");
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      fetchBatchDetails();
    }
  }, [batchId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!batchData) return null;

  const filteredStudents = batchData.students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{batchData.batchId}</h1>
          <p className="text-gray-500 mt-1">Manage batch information and students</p>
        </div>
        <Button onClick={() => navigate("/admin/batches")} variant="outline">
          Back to Batches
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold mt-1">{batchData.studentCount}</h3>
            </div>
            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Capacity</p>
              <h3 className="text-2xl font-bold mt-1">30</h3>
            </div>
            <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Information */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl">
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
                <p className="mt-1 text-sm font-medium text-gray-900">Learn CS Engineering in 12 Months</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructors</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {batchData.mentors.length > 0 ? (
                    batchData.mentors.map(mentor => (
                       <span key={mentor._id} className="text-sm font-medium text-gray-900">{mentor.name}</span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No instructors assigned</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">1 January 2025</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current MAT</p>
                <p className="mt-1 text-sm font-medium text-gray-900">5</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">30 December 2025</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Credits</p>
                <p className="mt-1 text-sm font-medium text-gray-900">800</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</p>
                <p className="mt-1 text-sm font-medium text-gray-900">Online</p>
              </div>

               <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining Credits</p>
                <p className="mt-1 text-sm font-medium text-gray-900">300</p>
              </div>
              
               <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GitHub Repository</p>
                <a href="#" className="mt-1 text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1">
                  https://github.com/thehackingschool/CS24_Classwork
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Management */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-purple-600 text-white rounded-t-xl flex flex-row items-center justify-between">
          <CardTitle>Students Management</CardTitle>
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
            {batchData.studentCount} students
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search students by name, email..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-4">Student</th>
                  <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="group hover:bg-gray-50/50">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {student.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">MAT: 0</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={student.isActive ? "default" : "secondary"} className={student.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none" : "bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none"}>
                          {student.isActive ? "Enrolled" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Average
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No students found in this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchDetails;
