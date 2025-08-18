import re

with open('src/components/analytics/AnalyticsPage.tsx', 'r') as f:
    content = f.read()

# Remove SentimentDashboard component definition
pattern1 = r'const SentimentDashboard = \({ data }\: { data: any }\) => {[\s\S]*?^};$'
content = re.sub(pattern1, '// SentimentDashboard component removed - now imported', content, flags=re.MULTILINE)

# Remove KeywordsCloud component definition  
pattern2 = r'const KeywordsCloud = \({ data }\: { data: any }\) => {[\s\S]*?^};$'
content = re.sub(pattern2, '// KeywordsCloud component removed - now imported', content, flags=re.MULTILINE)

# Remove TeamPerformanceMatrix component definition
pattern3 = r'const TeamPerformanceMatrix = \({ data, loading }\: { data: any; loading\?: boolean }\) => {[\s\S]*?^};$'
content = re.sub(pattern3, '// TeamPerformanceMatrix component removed - now imported', content, flags=re.MULTILINE)

# Remove ActivityFeed component definition
pattern4 = r'const ActivityFeed = \({ activities }\: { activities: any }\) => {[\s\S]*?^};$'
content = re.sub(pattern4, '// ActivityFeed component removed - now imported', content, flags=re.MULTILINE)

# Remove CoachingInsights component definition
pattern5 = r'const CoachingInsights = \({ insights }\: { insights: any }\) => {[\s\S]*?^};$'
content = re.sub(pattern5, '// CoachingInsights component removed - now imported', content, flags=re.MULTILINE)

print(f"Patterns found and will be replaced")
print(f"File will be cleaned up")

with open('src/components/analytics/AnalyticsPage_cleaned.tsx', 'w') as f:
    f.write(content)
