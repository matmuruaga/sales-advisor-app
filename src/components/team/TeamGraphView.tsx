"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamMember } from '@/data/mockTeamMembers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, TrendingUp, TrendingDown, Minus, AlertCircle, Trophy, Target
} from 'lucide-react';

interface TeamGraphViewProps {
  members: TeamMember[];
  onMemberSelect: (memberId: string) => void;
  searchTerm: string;
}

interface GraphNode {
  id: string;
  member: TeamMember;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  group?: string;
}

type GroupBy = 'none' | 'role' | 'territory' | 'performance';
type SizeMetric = 'quota' | 'pipeline' | 'winRate';

export const TeamGraphView: React.FC<TeamGraphViewProps> = ({ 
  members, 
  onMemberSelect,
  searchTerm 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('performance');
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('quota');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.territory.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate node positions based on grouping
  useEffect(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const padding = 60;

    // Group members
    const groups: Record<string, TeamMember[]> = {};
    
    filteredMembers.forEach(member => {
      let groupKey = 'default';
      switch (groupBy) {
        case 'role':
          groupKey = member.role;
          break;
        case 'territory':
          groupKey = member.territory;
          break;
        case 'performance':
          groupKey = member.performance.status;
          break;
        default:
          groupKey = 'all';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(member);
    });

    const groupKeys = Object.keys(groups);
    const newNodes: GraphNode[] = [];

    groupKeys.forEach((groupKey, groupIndex) => {
      const groupMembers = groups[groupKey];
      const groupAngle = (groupIndex * 2 * Math.PI) / groupKeys.length;
      
      // Calculate group center
      let groupCenterX = centerX;
      let groupCenterY = centerY;
      
      if (groupBy !== 'none' && groupKeys.length > 1) {
        const radius = Math.min(dimensions.width, dimensions.height) * 0.25;
        groupCenterX = centerX + Math.cos(groupAngle) * radius;
        groupCenterY = centerY + Math.sin(groupAngle) * radius;
      }

      // Position members within group
      groupMembers.forEach((member, memberIndex) => {
        // Calculate radius based on metric
        let size = 30; // base size
        switch (sizeMetric) {
          case 'quota':
            size = 25 + (member.performance.quotaAttainment / 100) * 25;
            break;
          case 'pipeline':
            const maxPipeline = Math.max(...filteredMembers.map(m => m.performance.pipelineValue));
            size = 25 + (member.performance.pipelineValue / maxPipeline) * 25;
            break;
          case 'winRate':
            size = 25 + (member.performance.winRate / 100) * 25;
            break;
        }

        // Determine color based on performance
        let color = '#9CA3AF'; // gray default
        if (member.performance.status === 'excellent' || member.performance.quotaAttainment >= 100) {
          color = '#9333EA'; // purple
        } else if (member.performance.status === 'good' || member.performance.quotaAttainment >= 80) {
          color = '#6366F1'; // indigo
        } else if (member.performance.status === 'needs-attention' || member.performance.quotaAttainment < 80) {
          color = '#F59E0B'; // amber
        }

        // Calculate position within group
        let x = groupCenterX;
        let y = groupCenterY;
        
        if (groupMembers.length > 1) {
          const memberAngle = (memberIndex * 2 * Math.PI) / groupMembers.length;
          const memberRadius = Math.min(150, groupMembers.length * 15);
          x = groupCenterX + Math.cos(memberAngle) * memberRadius;
          y = groupCenterY + Math.sin(memberAngle) * memberRadius;
        }

        // Ensure nodes stay within bounds
        x = Math.max(padding + size, Math.min(dimensions.width - padding - size, x));
        y = Math.max(padding + size, Math.min(dimensions.height - padding - size, y));

        // Find existing node to preserve current position for smooth transition
        const existingNode = nodes.find(n => n.id === member.id);
        
        newNodes.push({
          id: member.id,
          member,
          x: existingNode?.x || x,
          y: existingNode?.y || y,
          targetX: x,
          targetY: y,
          radius: size,
          color,
          group: groupKey
        });
      });
    });

    setNodes(newNodes);
  }, [filteredMembers, groupBy, sizeMetric, dimensions, nodes]);

  // Smooth animation to target positions
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          x: node.x + (node.targetX - node.x) * 0.1,
          y: node.y + (node.targetY - node.y) * 0.1
        }))
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    onMemberSelect(nodeId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Trophy className="w-3 h-3" />;
      case 'good': return <Target className="w-3 h-3" />;
      case 'needs-attention': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable': return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Group by:</span>
          <div className="flex gap-1">
            {(['none', 'performance', 'role', 'territory'] as GroupBy[]).map(option => (
              <button
                key={option}
                onClick={() => setGroupBy(option)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  groupBy === option 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {option === 'none' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Size by:</span>
          <div className="flex gap-1">
            {(['quota', 'pipeline', 'winRate'] as SizeMetric[]).map(option => (
              <button
                key={option}
                onClick={() => setSizeMetric(option)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  sizeMetric === option 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {option === 'quota' ? 'Quota' : option === 'pipeline' ? 'Pipeline' : 'Win Rate'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-600">Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-600">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">Needs Attention</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '500px' }}
      >
        {/* Performance Zones Background */}
        {groupBy === 'performance' && (
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="excellentGradient">
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="goodGradient">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="attentionGradient">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
            </defs>
            {nodes.filter(n => n.group === 'excellent').map(node => (
              <circle
                key={`zone-${node.id}`}
                cx={node.targetX}
                cy={node.targetY}
                r="150"
                fill="url(#excellentGradient)"
              />
            ))}
            {nodes.filter(n => n.group === 'good').map(node => (
              <circle
                key={`zone-${node.id}`}
                cx={node.targetX}
                cy={node.targetY}
                r="150"
                fill="url(#goodGradient)"
              />
            ))}
            {nodes.filter(n => n.group === 'needs-attention').map(node => (
              <circle
                key={`zone-${node.id}`}
                cx={node.targetX}
                cy={node.targetY}
                r="150"
                fill="url(#attentionGradient)"
              />
            ))}
          </svg>
        )}

        {/* Nodes */}
        {nodes.map(node => {
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;
          const isSearchMatch = !searchTerm || 
            node.member.name.toLowerCase().includes(searchTerm.toLowerCase());

          return (
            <motion.div
              key={node.id}
              className={`absolute cursor-pointer ${
                !isSearchMatch ? 'opacity-30' : ''
              }`}
              style={{
                width: node.radius * 2,
                height: node.radius * 2,
              }}
              animate={{
                left: node.x - node.radius,
                top: node.y - node.radius,
                scale: isHovered ? 1.15 : isSelected ? 1.1 : 1,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 25,
                mass: 0.5
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node.id)}
            >
              {/* Node Circle */}
              <div
                className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200 ${
                  isHovered || isSelected ? 'ring-4 ring-white shadow-xl' : 'shadow-lg'
                }`}
                style={{
                  backgroundColor: node.color,
                  borderWidth: node.member.coachingPriority === 'high' ? 3 : 0,
                  borderColor: '#F59E0B',
                  borderStyle: 'solid'
                }}
              >
                <span className="text-white font-bold text-sm select-none">
                  {node.member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              {/* Trend Indicator */}
              {node.member.performance.quotaTrend !== 'stable' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  {getTrendIcon(node.member.performance.quotaTrend)}
                </div>
              )}

              {/* Hover Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
                  >
                    <Card className="p-3 shadow-xl bg-white border-gray-200 min-w-[200px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{node.member.name}</h4>
                          {getStatusIcon(node.member.performance.status)}
                        </div>
                        <p className="text-xs text-gray-500">{node.member.role}</p>
                        <p className="text-xs text-gray-400">{node.member.territory}</p>
                        
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Quota:</span>
                            <span className="font-medium">{node.member.performance.quotaAttainment}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Win Rate:</span>
                            <span className="font-medium">{node.member.performance.winRate}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Pipeline:</span>
                            <span className="font-medium">${(node.member.performance.pipelineValue / 1000).toFixed(0)}K</span>
                          </div>
                        </div>

                        {node.member.coachingPriority !== 'low' && (
                          <div className="pt-2 border-t border-gray-100">
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Coaching Priority: {node.member.coachingPriority}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Group Labels */}
        {groupBy !== 'none' && (
          <div className="absolute inset-0 pointer-events-none">
            {Object.entries(
              nodes.reduce((acc, node) => {
                const group = node.group || 'default';
                if (!acc[group]) {
                  acc[group] = { x: 0, y: 0, count: 0 };
                }
                acc[group].x += node.targetX;
                acc[group].y += node.targetY;
                acc[group].count++;
                return acc;
              }, {} as Record<string, { x: number; y: number; count: number }>)
            ).map(([group, pos]) => pos.count > 0 && (
              <motion.div
                key={group}
                className="absolute"
                animate={{
                  left: pos.x / pos.count,
                  top: pos.y / pos.count - 100,
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
                  <span className="text-xs font-medium text-gray-700">
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};