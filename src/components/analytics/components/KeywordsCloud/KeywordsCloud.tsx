"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLORS } from '../../utils/colors';

interface KeywordsCloudProps {
  data: any;
}

export const KeywordsCloud = ({ data }: KeywordsCloudProps) => {
  const { keywords, objections } = useMemo(() => {
    if (!data?.callIntelligence || data.callIntelligence.length === 0) {
      return {
        keywords: [
          { text: 'No Data', value: 1, sentiment: 'neutral' }
        ],
        objections: ['No objections data', 'No objections data', 'No objections data']
      };
    }

    // Extract keywords from call intelligence data
    const keywordCounts: { [key: string]: { count: number, sentiment: string } } = {};
    const objectionsList: string[] = [];

    data.callIntelligence.forEach((call: any) => {
      // Process keywords_mentioned (assuming it's a JSON array)
      if (call.keywords_mentioned) {
        try {
          const keywords = Array.isArray(call.keywords_mentioned) 
            ? call.keywords_mentioned 
            : JSON.parse(call.keywords_mentioned);
          
          keywords.forEach((keyword: any) => {
            const text = typeof keyword === 'string' ? keyword : keyword.keyword || keyword.text;
            if (text) {
              if (!keywordCounts[text]) {
                keywordCounts[text] = { count: 0, sentiment: 'neutral' };
              }
              keywordCounts[text].count++;
              // Determine sentiment based on call sentiment
              const callSentiment = parseFloat(call.sentiment_score) || 5;
              keywordCounts[text].sentiment = callSentiment > 7 ? 'positive' : callSentiment < 4 ? 'negative' : 'neutral';
            }
          });
        } catch (e) {
          // Handle parsing errors
        }
      }

      // Process objections_raised
      if (call.objections_raised) {
        try {
          const objections = Array.isArray(call.objections_raised) 
            ? call.objections_raised 
            : JSON.parse(call.objections_raised);
          
          objections.forEach((objection: any) => {
            const text = typeof objection === 'string' ? objection : objection.objection || objection.text;
            if (text) {
              objectionsList.push(text);
            }
          });
        } catch (e) {
          // Handle parsing errors
        }
      }
    });

    // Convert to array and sort by frequency
    const keywordsArray = Object.entries(keywordCounts)
      .map(([text, data]) => ({
        text,
        value: data.count,
        sentiment: data.sentiment
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Take top 8 keywords

    // Count objections and get top 3
    const objectionCounts: { [key: string]: number } = {};
    objectionsList.forEach(obj => {
      objectionCounts[obj] = (objectionCounts[obj] || 0) + 1;
    });

    const topObjections = Object.entries(objectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([text, count]) => text);

    return {
      keywords: keywordsArray.length > 0 ? keywordsArray : [
        { text: 'No keywords', value: 1, sentiment: 'neutral' }
      ],
      objections: topObjections.length > 0 ? topObjections : [
        'No objections data'
      ]
    };
  }, [data]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return COLORS.success;
      case 'negative': return COLORS.danger;
      default: return COLORS.gray[500];
    }
  };

  // Calculate keyword frequency distribution for horizontal bar chart
  const keywordDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    keywords.forEach((keyword: any) => {
      const category = keyword.sentiment === 'positive' ? 'Positive Keywords' : 
                       keyword.sentiment === 'negative' ? 'Negative Keywords' : 
                       'Neutral Keywords';
      distribution[category] = (distribution[category] || 0) + keyword.value;
    });
    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
      fill: category === 'Positive Keywords' ? COLORS.success :
            category === 'Negative Keywords' ? COLORS.danger :
            COLORS.gray[400]
    }));
  }, [keywords]);

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Keywords Analysis</CardTitle>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Word Cloud */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Keywords Cloud</h4>
          <div className="flex flex-wrap gap-2 justify-center items-center min-h-[150px]">
            {keywords.map((keyword: any) => (
              <motion.div
                key={keyword.text}
                whileHover={{ scale: 1.15 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border cursor-pointer"
                style={{
                  fontSize: `${Math.max(11, Math.min(24, keyword.value / 1.5))}px`,
                  borderColor: getSentimentColor(keyword.sentiment),
                  backgroundColor: `${getSentimentColor(keyword.sentiment)}15`,
                  fontWeight: keyword.value > 10 ? '600' : '400'
                }}
              >
                <span style={{ color: getSentimentColor(keyword.sentiment) }}>
                  {keyword.text}
                </span>
                {keyword.value > 10 && (
                  <span className="text-xs opacity-60" style={{ color: getSentimentColor(keyword.sentiment) }}>
                    {keyword.value}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Sentiment Distribution Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Keyword Sentiment Distribution</h4>
          <div className="space-y-2">
            {keywordDistribution.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24">{item.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.count / Math.max(...keywordDistribution.map(d => d.count))) * 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-2"
                    style={{ backgroundColor: item.fill }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};