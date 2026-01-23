import { useEffect, useState } from "react";
import { Users, Loader2, ArrowLeft, GraduationCap, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMentorBatches, getStudentsByBatch } from "@/api/mentorApis";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  email: string;
  batchId?: string;
  status: "pending" | "active" | "suspended";
  createdAt: string;
}

const MentorBatches = () => {
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await getMentorBatches();
      setBatches(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = async (batchId: string) => {
    setSelectedBatch(batchId);
    setStudentsLoading(true);
    try {
      const data = await getStudentsByBatch(batchId);
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setStudents([]);
  };

  const getStatusBadge = (status: "pending" | "active" | "suspended") => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-orange-100 text-orange-700 border-orange-200",
      suspended: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <Badge
        variant="outline"
        className={`${variants[status]} px-3 py-1 text-xs font-medium`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show batch cards view
  if (!selectedBatch) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Batches
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage your assigned batches
          </p>
        </div>

        {/* Batches Grid */}
        {batches.length === 0 ? (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">
                No batches assigned
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Contact your administrator to get batch assignments
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {batches.map((batch) => (
              <Card
                key={batch}
                className="border-2 border-gray-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleBatchClick(batch)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Batch {batch}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Click to view students
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show students list view
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToBatches}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batches
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Batch {selectedBatch}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {students.length} students enrolled
            </p>
          </div>
        </div>
      </div>

      {/* Students List */}
      {studentsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : students.length === 0 ? (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">
              No students found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This batch has no enrolled students yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {students.map((student, index) => (
            <Card
              key={student._id}
              className="border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className={`w-16 h-16 mb-4 ${getAvatarColor(index)}`}>
                    <AvatarFallback className="bg-transparent text-white font-semibold text-xl">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {student.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-full">{student.email}</span>
                  </div>
                  <div>{getStatusBadge(student.status)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorBatches;
