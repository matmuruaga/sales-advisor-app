// Professional Color Palette for Analytics Dashboard
export const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#9333EA',
  pink: '#EC4899',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  chart: {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#9333EA',
    pink: '#EC4899',
    indigo: '#4F46E5',
    teal: '#14B8A6'
  },
  sentiment: {
    positive: '#10B981',
    neutral: '#6B7280',
    negative: '#EF4444'
  },
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
  }
};

export const CHART_COLORS = [
  COLORS.chart.blue,
  COLORS.chart.green,
  COLORS.chart.yellow,
  COLORS.chart.purple,
  COLORS.chart.pink,
  COLORS.chart.indigo,
  COLORS.chart.teal,
  COLORS.chart.red
];

export default COLORS;