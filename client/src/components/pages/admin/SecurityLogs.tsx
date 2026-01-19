import { useState } from "react";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ipAddress: string;
  status: "success" | "warning" | "error" | "info";
  details: string;
}

const SecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      action: "User Login",
      user: "admin@edutrack.com",
      ipAddress: "192.168.1.100",
      status: "success",
      details: "Successful admin login",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: "Failed Login Attempt",
      user: "unknown@example.com",
      ipAddress: "10.0.0.50",
      status: "warning",
      details: "Invalid credentials provided",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: "User Created",
      user: "admin@edutrack.com",
      ipAddress: "192.168.1.100",
      status: "info",
      details: "New student account created",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      action: "Unauthorized Access",
      user: "student@example.com",
      ipAddress: "172.16.0.25",
      status: "error",
      details: "Attempted to access admin panel",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      action: "Password Changed",
      user: "mentor@edutrack.com",
      ipAddress: "192.168.1.105",
      status: "success",
      details: "Password updated successfully",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "warning":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "error":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }
  };

  const statusCounts = {
    success: logs.filter((l) => l.status === "success").length,
    warning: logs.filter((l) => l.status === "warning").length,
    error: logs.filter((l) => l.status === "error").length,
    info: logs.filter((l) => l.status === "info").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Security Logs
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Monitor system security events and activities
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Success
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {statusCounts.success}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Warnings
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {statusCounts.warning}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Errors
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {statusCounts.error}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Info
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {statusCounts.info}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs List */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">
                  Security Events
                </CardTitle>
                <CardDescription className="text-xs">
                  Recent security-related activities
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="h-9 px-3 rounded-md border border-gray-200 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs text-gray-600">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <p className="text-sm font-semibold text-gray-900">
                            {log.action}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{log.user}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-500">
                          {log.ipAddress}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">{log.details}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No security logs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityLogs;
