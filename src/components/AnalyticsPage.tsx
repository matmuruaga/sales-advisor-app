import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

// Simulated component for a bar chart (visual only)
const FakeBarChart = () => (
  <div className="w-full h-48 bg-gray-50 rounded-lg flex items-end p-2 space-x-2">
    <div
      className="w-full h-[60%] bg-purple-200 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.1s" }}
    ></div>
    <div
      className="w-full h-[80%] bg-purple-300 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className="w-full h-[50%] bg-purple-200 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.3s" }}
    ></div>
    <div
      className="w-full h-[70%] bg-purple-300 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.4s" }}
    ></div>
    <div
      className="w-full h-[90%] bg-purple-400 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.5s" }}
    ></div>
    <div
      className="w-full h-[65%] bg-purple-300 rounded-t-md animate-pulse"
      style={{ animationDelay: "0.6s" }}
    ></div>
  </div>
);

export function AnalyticsPage() {
  return (
    <div className="h-full w-full p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate (PoC)
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72.5%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +5.2% vs. last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Close Probability
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-gray-500">
              AI-estimated across active pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meetings this Week
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-gray-500">
              22 Opportunities, 26 Follow-ups
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Team Performance Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance vs. Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <FakeBarChart />
            </CardContent>
          </Card>
        </div>

        {/* Common Objections & Top Performer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Common Objections (Q3)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <p>1. Price / TCO</p>
                <Badge variant="destructive">38%</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p>2. Integration Complexity</p>
                <Badge variant="outline">25%</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p>3. Missing Feature X</p>
                <Badge variant="outline">19%</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p>4. Competitor Y Comparison</p>
                <Badge variant="outline">11%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Jessica Smith</p>
                <p className="text-xs text-gray-500">85% Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
