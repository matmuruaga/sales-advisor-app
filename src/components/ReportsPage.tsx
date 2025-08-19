"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Sparkles, 
  Phone, 
  BarChart3, 
  Target, 
  Map, 
  Heart, 
  Shield, 
  Activity,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  Minus,
  Users,
  Download,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Mock reports removed - using real data only

const iconMap = {
  TrendingUp,
  Sparkles,
  Phone,
  BarChart3,
  Target,
  Map,
  Heart,
  Shield,
  Activity,
  Users
};

export const ReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<'core-performance' | 'pipeline-analysis' | 'additional'>('core-performance');

  // Filter reports based on search and category
  const filteredReports = useMemo(() => {
    if (searchTerm) {
      return searchReports(searchTerm);
    }
    return getReportsByCategory(selectedCategory);
  }, [searchTerm, selectedCategory]);

  const featuredReports = getFeaturedReports();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ChevronDown className="w-3 h-3 text-red-500" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || BarChart3;
    return Icon;
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
              <p className="text-sm text-gray-500">Comprehensive insights and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-indigo-50 hover:border-indigo-200">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Reports Quick Access */}
      {!searchTerm && (
        <div className="flex-shrink-0 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Featured Reports</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {featuredReports.map(report => {
              const Icon = getIconComponent(report.icon);
              return (
                <motion.div
                  key={report.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {report.title}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm ? (
          // Search Results
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Found {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
            </p>
            <ReportGrid reports={filteredReports} viewMode={viewMode} />
          </div>
        ) : (
          // Category Tabs
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
              <TabsTrigger value="core-performance" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Core Performance
              </TabsTrigger>
              <TabsTrigger value="pipeline-analysis" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                Pipeline Analysis
              </TabsTrigger>
              <TabsTrigger value="additional" className="data-[state=active]:bg-white data-[state=active]:text-gray-700">
                Additional Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="core-performance" className="mt-0">
              <ReportGrid reports={filteredReports} viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="pipeline-analysis" className="mt-0">
              <ReportGrid reports={filteredReports} viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="additional" className="mt-0">
              <ReportGrid reports={filteredReports} viewMode={viewMode} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Report Grid Component
const ReportGrid = ({ reports, viewMode }: { reports: any[], viewMode: 'grid' | 'list' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ChevronDown className="w-3 h-3 text-red-500" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || BarChart3;
    return Icon;
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {reports.map(report => {
          const Icon = getIconComponent(report.icon);
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{report.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      {report.metrics.slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="text-right">
                          <p className="text-xs text-gray-500">{metric.label}</p>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold">{metric.value}</span>
                            {getTrendIcon(metric.trend)}
                          </div>
                        </div>
                      ))}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map(report => {
        const Icon = getIconComponent(report.icon);
        return (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
                      <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(report.status)}`}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{report.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  {report.metrics.map((metric, idx) => (
                    <div key={idx} className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-600">{metric.label}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                        <div className="flex items-center space-x-0.5">
                          {getTrendIcon(metric.trend)}
                          {metric.trendValue && (
                            <span className="text-xs text-gray-500">{metric.trendValue}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                  {report.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                      {tag}
                    </Badge>
                  ))}
                  {report.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                      +{report.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{report.lastUpdated}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700">
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};