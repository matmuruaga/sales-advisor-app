"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Mock contacts removed - will use real data from props
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, Building2, MapPin, Users, DollarSign, Calendar, Globe, 
  Linkedin, Twitter, TrendingUp, Phone, Mail, FileText,
  ExternalLink
} from 'lucide-react';

interface CompanyDetailPanelProps {
  companyName: string;
  onClose: () => void;
}

export const CompanyDetailPanel = ({ companyName, onClose }: CompanyDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // TODO: Get contacts from real data source (Supabase)
  // For now, using empty array until real data integration
  const companyContacts: any[] = [];
  const primaryContact = companyContacts[0]; // Use first contact for company data
  
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!primaryContact) return null;

  // Extract unique products from all contacts in the company
  const getCompanyProducts = () => {
    const products = new Set<string>();
    companyContacts.forEach(contact => {
      if (contact.buyingBehavior?.purchaseHistory) {
        contact.buyingBehavior.purchaseHistory.forEach(purchase => {
          if (purchase.vendor) products.add(purchase.vendor);
        });
      }
    });
    return Array.from(products);
  };

  const getFinancialHealth = () => {
    // Calculate based on revenue
    const revenueStr = primaryContact.revenue || '$0';
    const revenueNum = parseInt(revenueStr.replace(/[^0-9]/g, ''));
    
    if (revenueNum > 100) return { growth: 'steady', funding: 'well-funded', profitability: 'profitable' };
    if (revenueNum > 10) return { growth: 'growing', funding: 'funded', profitability: 'break-even' };
    return { growth: 'early-stage', funding: 'seed', profitability: 'pre-revenue' };
  };

  const financialHealth = getFinancialHealth();

  return (
    <>
      {/* Overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 z-[59] pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl pointer-events-auto z-[60]"
      >
        <div className="h-full flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Company Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Company Header */}
          <div className="p-4 border-b">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{companyName}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-3 h-3 mr-1" />
                <span>{primaryContact.industry} • Enterprise Software</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{primaryContact.location}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500 mr-1" />
                <span className="font-bold text-lg">{primaryContact.employees}</span>
              </div>
              <p className="text-xs text-center text-gray-500">Employees</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                <span className="font-bold text-lg">{primaryContact.revenue?.replace('$', '')}</span>
              </div>
              <p className="text-xs text-center text-gray-500">Revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                <span className="font-bold text-lg">2008</span>
              </div>
              <p className="text-xs text-center text-gray-500">Founded</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                <span className="font-bold text-lg">scale-up</span>
              </div>
              <p className="text-xs text-center text-gray-500">Stage</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Globe className="w-3 h-3 mr-1" />
              Website
            </Button>
            <Button variant="outline" size="sm">
              <Linkedin className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="w-3 h-3" />
            </Button>
          </div>
        </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
            <TabsList className="grid w-full grid-cols-4 px-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">AI Insights</TabsTrigger>
              <TabsTrigger value="relationship" className="text-xs">Relationship</TabsTrigger>
              <TabsTrigger value="intel" className="text-xs">Intel</TabsTrigger>
            </TabsList>

            <div className="flex-1">
            <TabsContent value="overview" className="px-4 pb-4 mt-4">
              {/* About */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-2">About</h4>
                <p className="text-sm text-gray-600">
                  Leading enterprise software company specializing in data analytics and cloud infrastructure solutions. 
                  Serving Fortune 500 companies with mission-critical applications.
                </p>
              </div>

              {/* Financial Health */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Financial Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {financialHealth.growth}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Funding Status</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {financialHealth.funding}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profitability</span>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {financialHealth.profitability}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investor Sentiment</span>
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      positive
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key People */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Key People</h4>
                <div className="space-y-2">
                  {companyContacts.slice(0, 3).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products & Services */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Products & Services</h4>
                <div className="space-y-2">
                  <Card className="p-3">
                    <h5 className="font-medium text-sm">TechCorp Analytics</h5>
                    <p className="text-xs text-gray-500">Enterprise data analytics platform</p>
                  </Card>
                  <Card className="p-3">
                    <h5 className="font-medium text-sm">CloudSecure</h5>
                    <p className="text-xs text-gray-500">Cloud security and compliance solution</p>
                  </Card>
                  <Card className="p-3">
                    <h5 className="font-medium text-sm">DataFlowPro</h5>
                    <p className="text-xs text-gray-500">Data integration and ETL tools</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="px-4 pb-4 mt-4">
              {/* Company Sentiment */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Company-Wide Sentiment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Engagement</span>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      very positive
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Decision Stage</span>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      evaluation
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Urgency Level</span>
                    <Badge className="bg-red-50 text-red-700 border-red-200">
                      high
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pain Points Analysis */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Identified Pain Points</h4>
                <ul className="space-y-2">
                  {primaryContact.buyingBehavior?.painPoints?.map((pain, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 text-red-500">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Priorities */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Strategic Priorities</h4>
                <ul className="space-y-2">
                  {primaryContact.buyingBehavior?.priorities?.map((priority, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Strategy */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-2 text-purple-900">Recommended Strategy</h4>
                  <p className="text-sm text-purple-800">
                    Focus on demonstrating ROI through cost optimization features. Leverage technical 
                    credibility with their engineering team while emphasizing ease of implementation. 
                    Consider offering a pilot program to reduce perceived risk.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relationship" className="px-4 pb-4 mt-4">
              {/* Engagement Summary */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Engagement Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{companyContacts.length}</p>
                    <p className="text-xs text-gray-500">Active Contacts</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {companyContacts.filter(c => c.status === 'hot').length}
                    </p>
                    <p className="text-xs text-gray-500">Hot Leads</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      ${companyContacts.reduce((sum, c) => sum + parseInt(c.value.replace(/[^0-9]/g, '')), 0) / 1000}K
                    </p>
                    <p className="text-xs text-gray-500">Total Pipeline</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(companyContacts.reduce((sum, c) => sum + c.probability, 0) / companyContacts.length)}%
                    </p>
                    <p className="text-xs text-gray-500">Avg Probability</p>
                  </Card>
                </div>
              </div>

              {/* Recent Interactions */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Recent Interactions</h4>
                <div className="space-y-2">
                  {companyContacts.slice(0, 3).map((contact, i) => (
                    <Card key={i} className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <span className="text-xs text-gray-500">{contact.lastActivity}</span>
                      </div>
                      <p className="text-xs text-gray-600">{contact.lastContact}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Relationship Strength */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Relationship Strength</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Executive Level</span>
                      <span className="text-green-600 font-medium">Strong</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Team</span>
                      <span className="text-yellow-600 font-medium">Building</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Procurement</span>
                      <span className="text-gray-600 font-medium">Initial</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intel" className="px-4 pb-4 mt-4">
              {/* Competitive Intelligence */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Known Vendors</h4>
                <div className="space-y-2">
                  {getCompanyProducts().map((vendor, i) => (
                    <Badge key={i} variant="outline" className="mr-2">
                      {vendor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">AWS</Badge>
                  <Badge variant="secondary">Kubernetes</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Redis</Badge>
                </div>
              </div>

              {/* Recent News */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Recent News & Updates</h4>
                <div className="space-y-2">
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">2 days ago</p>
                    <p className="text-sm font-medium">Announced Q3 earnings beat expectations</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">1 week ago</p>
                    <p className="text-sm font-medium">Launched new AI-powered analytics feature</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500 mb-1">2 weeks ago</p>
                    <p className="text-sm font-medium">Expanded engineering team by 20%</p>
                  </Card>
                </div>
              </div>

              {/* Growth Indicators */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Growth Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hiring Velocity</span>
                    <Badge className="bg-green-50 text-green-700">+15% QoQ</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product Releases</span>
                    <span className="text-sm font-medium">3 this quarter</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Market Position</span>
                    <Badge className="bg-blue-50 text-blue-700">Leader</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="flex-shrink-0 p-4 border-t flex gap-2 bg-white">
          <Button variant="outline" className="flex-1" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>
      </motion.div>
    </>
  );
};