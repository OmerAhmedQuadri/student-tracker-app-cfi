import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Star,
  Users,
  Loader2,
  Crown,
  Flame,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface LeaderboardEntry {
  rank: number;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  totalPoints: number;
  weeklyPoints: number;
  assignmentsCompleted: number;
  learningHours: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [timeFrame, setTimeFrame] = useState<"all" | "weekly" | "monthly">(
    "all",
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/dashboard/leaderboard?timeFrame=${timeFrame}`,
      );
      setLeaderboard(res.data);

      // Find current user's rank
      const myRank = res.data.findIndex(
        (entry: LeaderboardEntry) => entry.userId._id === user?.id,
      );
      if (myRank !== -1) {
        setCurrentUserRank(myRank + 1);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-400 text-sm">
        {rank}
      </span>
    );
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
    return "bg-gray-100 text-gray-700";
  };

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const maxPoints = leaderboard[0]?.totalPoints || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Compete with your peers and climb the ranks
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    timeFrame === "all"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 z-10"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTimeFrame("all")}
                >
                  All Time
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                    timeFrame === "weekly"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 z-10"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTimeFrame("weekly")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                    timeFrame === "monthly"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 z-10"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTimeFrame("monthly")}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current User Rank Card */}
        {currentUserRank && (
          <Card className="shadow-sm border border-indigo-200 bg-indigo-50 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Your Current Rank
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-indigo-900">
                        #{currentUserRank}
                      </span>
                      <span className="text-sm text-indigo-700">
                        with {leaderboard[currentUserRank - 1]?.totalPoints}{" "}
                        points
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-700 mb-1">
                    Weekly Progress
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-indigo-900">
                      +{leaderboard[currentUserRank - 1]?.weeklyPoints || 0}{" "}
                      this week
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <Card className="shadow-sm border border-gray-200 overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Top Performers
                </CardTitle>
                <CardDescription className="text-xs">
                  The best of the best
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center pt-6 md:pt-10 order-1 md:order-1">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 border-4 border-gray-300">
                          <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xl font-bold">
                            {topThree[1].userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1.5 shadow-md">
                          <Medal className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-center">
                        {topThree[1].userId.name}
                      </h3>
                      <div className="mt-2 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {topThree[1].totalPoints}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                      <div className="mt-4 w-full">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to #1</span>
                          <span>
                            {Math.round(
                              (topThree[1].totalPoints /
                                topThree[0].totalPoints) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (topThree[1].totalPoints /
                              topThree[0].totalPoints) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center order-0 md:order-2">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50"></div>
                        <Avatar className="w-24 h-24 border-4 border-yellow-400 relative">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-2xl font-bold">
                            {topThree[0].userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1.5 shadow-md">
                          <Crown className="w-6 h-6 text-yellow-500" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-center text-lg">
                        {topThree[0].userId.name}
                      </h3>
                      <div className="mt-2 text-center">
                        <p className="text-3xl font-bold text-yellow-600">
                          {topThree[0].totalPoints}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          points
                        </p>
                      </div>
                      <div className="mt-4 w-full">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-full justify-center">
                          <Flame className="w-3 h-3 mr-1" />+
                          {topThree[0].weeklyPoints} this week
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center pt-6 md:pt-10 order-2 md:order-3">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 border-4 border-amber-700">
                          <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-800 text-white text-xl font-bold">
                            {topThree[2].userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1.5 shadow-md">
                          <Medal className="w-5 h-5 text-amber-700" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-center">
                        {topThree[2].userId.name}
                      </h3>
                      <div className="mt-2 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {topThree[2].totalPoints}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                      <div className="mt-4 w-full">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to #2</span>
                          <span>
                            {Math.round(
                              (topThree[2].totalPoints /
                                topThree[1].totalPoints) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (topThree[2].totalPoints /
                              topThree[1].totalPoints) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {others.length > 0 && (
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                All Rankings
              </CardTitle>
              <CardDescription className="text-xs">
                Complete leaderboard standings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {others.map((entry) => (
                  <div
                    key={entry.userId._id}
                    className={`p-5 flex items-center gap-4 hover:bg-gray-50 transition-all ${
                      currentUserRank === entry.rank
                        ? "bg-indigo-50 border-l-4 border-indigo-600"
                        : ""
                    }`}
                  >
                    <div className="shrink-0 w-10 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                        {entry.userId.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {entry.userId.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {entry.userId.email}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right min-w-[100px]">
                      <p className="text-xl font-bold text-gray-900">
                        {entry.totalPoints}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 min-w-[80px]">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>+{entry.weeklyPoints}</span>
                    </div>
                    <div className="hidden md:block w-24">
                      <Progress
                        value={(entry.totalPoints / maxPoints) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="py-20 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">
                No leaderboard data yet
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Start completing activities to earn points!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
