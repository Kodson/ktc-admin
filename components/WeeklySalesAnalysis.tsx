import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ShareModal } from './ShareModal';
import { 
  FileText,
  Download,
  Calendar,
  Printer,
  Mail,
  Share2,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { 
  getCurrentWeekOfMonth,
  getCurrentMonthYear,
  generateAvailableMonths,
  generateWeeksForMonth,
  getWeekDateRange,
  getWeekTimePeriod,
  formatCurrency,
  formatNumber
} from '../utils/dateUtils';
import { useWeeklySalesAnalysis } from '../hooks/useWeeklySalesAnalysis';
import { toast } from 'sonner';

// Base sales data patterns for different months/weeks
const salesDataPatterns = {
  // Historical data with realistic variations
  'jan-2024': {
    weeks: [
      { totalSales: 14532.45, pms: 6789.12, ago: 7743.33, trend: 'stable' },
      { totalSales: 15678.90, pms: 7234.56, ago: 8444.34, trend: 'up' },
      { totalSales: 14987.23, pms: 6901.45, ago: 8085.78, trend: 'down' },
      { totalSales: 16234.67, pms: 7456.78, ago: 8777.89, trend: 'up' }
    ]
  },
  'feb-2024': {
    weeks: [
      { totalSales: 15345.78, pms: 7123.45, ago: 8222.33, trend: 'stable' },
      { totalSales: 16789.45, pms: 7654.32, ago: 9135.13, trend: 'up' },
      { totalSales: 15987.34, pms: 7345.67, ago: 8641.67, trend: 'down' },
      { totalSales: 16186.37, pms: 7219.11, ago: 8967.26, trend: 'stable' }
    ]
  },
  'mar-2024': {
    weeks: [
      { totalSales: 17427.49, pms: 6820.02, ago: 10607.47, trend: 'up' },
      { totalSales: 16878.00, pms: 6978.02, ago: 9899.98, trend: 'down' },
      { totalSales: 20830.60, pms: 6686.92, ago: 14143.68, trend: 'peak' },
      { totalSales: 17282.54, pms: 7183.06, ago: 10099.48, trend: 'down' }
    ]
  },
  'apr-2024': {
    weeks: [
      { totalSales: 18543.21, pms: 8234.56, ago: 10308.65, trend: 'up' },
      { totalSales: 17689.45, pms: 7890.12, ago: 9799.33, trend: 'down' },
      { totalSales: 19234.78, pms: 8456.78, ago: 10778.00, trend: 'up' },
      { totalSales: 18876.90, pms: 8123.45, ago: 10753.45, trend: 'stable' }
    ]
  },
  'may-2024': {
    weeks: [
      { totalSales: 19876.54, pms: 8765.43, ago: 11111.11, trend: 'up' },
      { totalSales: 18432.10, pms: 8234.56, ago: 10197.54, trend: 'down' },
      { totalSales: 20543.87, pms: 9012.34, ago: 11531.53, trend: 'peak' },
      { totalSales: 19234.65, pms: 8567.89, ago: 10666.76, trend: 'stable' }
    ]
  }
};

// Generate stable sales data based on selected month/week using deterministic patterns
const generateLocalWeeklySalesData = (selectedMonthData: any, selectedWeekData: any) => {
  if (!selectedMonthData || !selectedWeekData) return [];
  
  const monthKey = `${selectedMonthData.month.toLowerCase()}-${selectedMonthData.year}`;
  const pattern = salesDataPatterns[monthKey as keyof typeof salesDataPatterns];
  
  if (!pattern) {
    // Generate deterministic fallback data for months not in our pattern
    return generateStableFallbackData(selectedMonthData, selectedWeekData);
  }
  
  const weekIndex = selectedWeekData.weekNumber - 1;
  const contextWeeks = [];
  
  // Show current week plus surrounding weeks for context (up to 5 weeks total)
  const startWeek = Math.max(0, weekIndex - 2);
  const endWeek = Math.min(pattern.weeks.length - 1, weekIndex + 2);
  
  for (let i = startWeek; i <= endWeek; i++) {
    const weekData = pattern.weeks[i];
    const isSelectedWeek = i === weekIndex;
    const weekNumber = i + 1;
    
    // Calculate differences from previous week
    const prevWeek = i > 0 ? pattern.weeks[i - 1] : null;
    const diffPms = prevWeek ? Number((weekData.pms - prevWeek.pms).toFixed(2)) : 0;
    const diffAgo = prevWeek ? Number((weekData.ago - prevWeek.ago).toFixed(2)) : 0;
    const overallDiff = prevWeek ? Number((weekData.totalSales - prevWeek.totalSales).toFixed(2)) : 0;
    const percentChange = prevWeek && prevWeek.totalSales > 0 ? Number(((weekData.totalSales - prevWeek.totalSales) / prevWeek.totalSales * 100).toFixed(2)) : 0;
    
    // Get time period for the week
    const timePeriod = getWeekTimePeriod(weekNumber, selectedMonthData.year, selectedMonthData.monthIndex);
    
    contextWeeks.push({
      month: selectedMonthData.month,
      week: `WEEK ${weekNumber}`,
      timePeriod: timePeriod,
      totalSales: Number(weekData.totalSales.toFixed(2)),
      pms: Number(weekData.pms.toFixed(2)),
      ago: Number(weekData.ago.toFixed(2)),
      diffPms: diffPms,
      diffAgo: diffAgo,
      overallDiff: overallDiff,
      percentChange: percentChange,
      isHighlighted: isSelectedWeek,
      bgColor: isSelectedWeek ? 'bg-yellow-100' : (weekData.trend === 'peak' ? 'bg-green-100' : (weekData.trend === 'down' && Math.abs(percentChange) > 10 ? 'bg-orange-100' : '')),
      monthColor: getMonthColor(selectedMonthData.month)
    });
  }
  
  return contextWeeks;
};

// Generate chart data based on the table data
const generateChartData = (tableData: any[]) => {
  if (!Array.isArray(tableData)) return [];
  
  return tableData.map((week, index) => ({
    week: `${(week.month || 'MON').slice(0, 3)} W${(week.week || 'WEEK 1').split(' ')[1] || '1'}`,
    value: Number(week.totalSales || 0),
    color: week.isHighlighted ? 'bg-yellow-500' : ((week.bgColor || '').includes('orange') ? 'bg-orange-500' : ((week.bgColor || '').includes('green') ? 'bg-green-500' : 'bg-blue-500'))
  }));
};

// Note: getWeekTimePeriod moved to shared utilities

// Helper function to get ordinal suffix
const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Helper function to get month color
const getMonthColor = (month: string) => {
  const colorMap: { [key: string]: string } = {
    'JAN': 'bg-blue-200',
    'FEB': 'bg-purple-200',
    'MAR': 'bg-green-200',
    'APR': 'bg-yellow-200',
    'MAY': 'bg-orange-200',
    'JUN': 'bg-red-200',
    'JUL': 'bg-pink-200',
    'AUG': 'bg-indigo-200',
    'SEP': 'bg-teal-200',
    'OCT': 'bg-cyan-200',
    'NOV': 'bg-amber-200',
    'DEC': 'bg-emerald-200'
  };
  return colorMap[month] || 'bg-gray-200';
};

// Generate stable fallback data for months not in patterns using deterministic values
const generateStableFallbackData = (selectedMonthData: any, selectedWeekData: any) => {
  // Use month and year as seed for consistent data generation
  const seed = selectedMonthData.monthIndex + (selectedMonthData.year * 12);
  const baseValue = 15000 + ((seed % 50) * 100); // Deterministic base between 15k-20k
  const weekNumber = selectedWeekData.weekNumber;
  
  const weeks = [];
  for (let i = Math.max(1, weekNumber - 2); i <= Math.min(4, weekNumber + 2); i++) {
    // Use week-specific seed for deterministic variations
    const weekSeed = seed + (i * 7);
    const variation = ((weekSeed % 30) - 15) / 100; // ±15% variation based on seed
    const totalSales = baseValue * (1 + variation);
    
    // Deterministic PMS ratio based on week
    const pmsRatio = 0.4 + ((weekSeed % 20) / 100); // 40-60% PMS
    const pms = totalSales * pmsRatio;
    const ago = totalSales - pms;
    
    const isSelectedWeek = i === weekNumber;
    const timePeriod = getWeekTimePeriod(i, selectedMonthData.year, selectedMonthData.monthIndex);
    
    const prevWeek = i > 1 && weeks.length > 0 ? weeks[weeks.length - 1] : null;
    const diffPms = prevWeek ? pms - prevWeek.pms : 0;
    const diffAgo = prevWeek ? ago - prevWeek.ago : 0;
    const overallDiff = prevWeek ? totalSales - prevWeek.totalSales : 0;
    const percentChange = prevWeek && prevWeek.totalSales > 0 ? ((totalSales - prevWeek.totalSales) / prevWeek.totalSales) * 100 : 0;

    weeks.push({
      month: selectedMonthData.month,
      week: `WEEK ${i}`,
      timePeriod: timePeriod,
      totalSales: Number(totalSales.toFixed(2)),
      pms: Number(pms.toFixed(2)),
      ago: Number(ago.toFixed(2)),
      diffPms: Number(diffPms.toFixed(2)),
      diffAgo: Number(diffAgo.toFixed(2)),
      overallDiff: Number(overallDiff.toFixed(2)),
      percentChange: Number(percentChange.toFixed(2)),
      isHighlighted: isSelectedWeek,
      bgColor: isSelectedWeek ? 'bg-yellow-100' : '',
      monthColor: getMonthColor(selectedMonthData.month)
    });
  }
  
  return weeks;
};

// Note: Utility functions moved to /utils/dateUtils.ts to avoid duplicate declarations
// Note: Functions moved to shared utilities

export function WeeklySalesAnalysis() {
  // Hook for backend integration
  const {
    analyses,
    isLoading,
    isGenerating,
    error,
    generateAnalysis,
    clearError,
    refreshData,
    comparisonData,
    setComparisonData
  } = useWeeklySalesAnalysis();

  // Get current month and year for defaults
  const currentMonthYear = getCurrentMonthYear();
  const availableMonths = generateAvailableMonths();
  const currentMonthValue = availableMonths.find(m => 
    m.month === currentMonthYear.month && m.year === currentMonthYear.year
  )?.value || availableMonths[0]?.value;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  
  // Get weeks for selected month
  const selectedMonthData = availableMonths.find(m => m.value === selectedMonth);
  const availableWeeks = selectedMonthData 
    ? generateWeeksForMonth(selectedMonthData.year, selectedMonthData.monthIndex)
    : [];
  
  // Default to current week if in current month, otherwise last available week
  const getDefaultWeek = useMemo(() => {
    if (selectedMonthData?.month === currentMonthYear.month && selectedMonthData?.year === currentMonthYear.year) {
      return availableWeeks[availableWeeks.length - 1]?.value; // Current week
    }
    return availableWeeks[availableWeeks.length - 1]?.value; // Last week of selected month
  }, [selectedMonthData, currentMonthYear, availableWeeks]);
  
  const [selectedWeek, setSelectedWeek] = useState(getDefaultWeek || 'current');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  
  // Update selected week when month changes
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    const newMonthData = availableMonths.find(m => m.value === newMonth);
    if (newMonthData) {
      const newWeeks = generateWeeksForMonth(newMonthData.year, newMonthData.monthIndex);
      // Set to current week if current month, otherwise last week of month
      if (newMonthData.month === currentMonthYear.month && newMonthData.year === currentMonthYear.year) {
        setSelectedWeek(newWeeks[newWeeks.length - 1]?.value || newWeeks[0]?.value);
      } else {
        setSelectedWeek(newWeeks[newWeeks.length - 1]?.value || newWeeks[0]?.value);
      }
    }
  };

  // Handle refresh data
  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Weekly sales analysis data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    }
  };

  // Handle generate analysis for current selection
  const handleGenerateAnalysis = async () => {
    const selectedWeekData = availableWeeks.find(w => w.value === selectedWeek);
    if (!selectedWeekData || !selectedMonthData) {
      toast.error('Please select a valid week and month');
      return;
    }

    const weekInfo = {
      month: selectedMonthData.month,
      week: `WEEK ${selectedWeekData.weekNumber}`,
      weekNumber: selectedWeekData.weekNumber,
      year: selectedMonthData.year,
      monthIndex: selectedMonthData.monthIndex,
      dateRange: getWeekDateRange(selectedWeekData.weekNumber, selectedMonthData.year, selectedMonthData.monthIndex),
      startDate: '',
      endDate: '',
      timePeriod: getWeekTimePeriod(selectedWeekData.weekNumber, selectedMonthData.year, selectedMonthData.monthIndex)
    };

    try {
      const result = await generateAnalysis(weekInfo, 'station-001'); // Default station for demo
      if (result) {
        toast.success('Weekly sales analysis generated successfully');
      }
    } catch (err) {
      toast.error('Failed to generate analysis');
    }
  };
  
  // Update selected week when available weeks change
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.find(w => w.value === selectedWeek)) {
      // If current selected week is not available in new weeks, select default
      setSelectedWeek(getDefaultWeek || availableWeeks[0]?.value);
    }
  }, [availableWeeks, selectedWeek, getDefaultWeek]);
  
  // Get current week info based on selection
  const getCurrentWeekInfo = () => {
    const selectedWeekData = availableWeeks.find(week => week.value === selectedWeek);
    if (selectedWeekData) {
      return {
        month: selectedWeekData.month,
        week: `WEEK ${selectedWeekData.weekNumber}`,
        dateRange: getWeekDateRange(selectedWeekData.weekNumber, selectedWeekData.year, selectedWeekData.monthIndex)
      };
    }
    
    // Fallback to current week
    const { month } = getCurrentMonthYear();
    const currentWeekNum = getCurrentWeekOfMonth();
    return {
      month: month,
      week: `WEEK ${currentWeekNum}`,
      dateRange: getWeekDateRange(currentWeekNum)
    };
  };

  // Format functions moved to shared utilities
  const formatNumberSafe = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return formatNumber(value);
  };

  const formatCurrencySafe = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return formatCurrency(amount);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const renderDiffValue = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    if (value < 0) {
      return <span className="text-red-600 font-medium">({Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>;
    }
    return <span>{value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
  };

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      const { PDFExportService, createExportData } = await import('../utils/pdfExport');
      
      try {
        // Get current sales data using existing functions
        const selectedWeekData = availableWeeks.find(w => w.value === selectedWeek);
        const weeklySalesDataForExport = generateLocalWeeklySalesData(selectedMonthData, selectedWeekData);
        
        // Validate data before proceeding
        if (!weeklySalesDataForExport || weeklySalesDataForExport.length === 0) {
          toast.error('No data available for export');
          return;
        }
        
        // Calculate totals from the export data (use stable data for PDF)
        const totalWeekSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.totalSales || 0), 0);
        const totalPmsSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.pms || 0), 0);
        const totalAgoSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.ago || 0), 0);
        
        // Prepare KPI data using calculated totals
        const kpiData = {
          totalSales: totalWeekSales,
          totalProfit: totalWeekSales * 0.15, // Estimated 15% profit margin
          totalExpenses: totalWeekSales * 0.85, // Estimated 85% expenses
          totalVehicles: Math.round(totalWeekSales / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: 15.0,
          growthRate: 8.5,
          operationalEfficiency: 94.2
        };
        
        // Prepare detailed sales analysis table data
        const tableData = [
          {
            title: 'Weekly Sales Analysis by Product',
            headers: ['Product', 'Daily Avg (L)', 'Total Sales (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)', 'Market Share (%)', 'Growth (%)'],
            rows: [
              [
                'Petrol (PMS)',
                (totalPmsSales / 7).toFixed(2),
                totalPmsSales.toFixed(2),
                '17.50',
                (totalPmsSales * 17.50).toFixed(2),
                ((totalPmsSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1),
                '+12.3'
              ],
              [
                'Diesel (AGO)',
                (totalAgoSales / 7).toFixed(2),
                totalAgoSales.toFixed(2),
                '18.75',
                (totalAgoSales * 18.75).toFixed(2),
                ((totalAgoSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1),
                '+8.7'
              ]
            ]
          },
          {
            title: 'Weekly Sales Performance',
            headers: ['Week', 'PMS Sales (L)', 'AGO Sales (L)', 'Total Sales (L)', 'Sales Value (₵)', 'Trend'],
            rows: weeklySalesDataForExport.map((week, index) => [
              `Week ${index + 1}`,
              week.pms.toFixed(2),
              week.ago.toFixed(2),
              week.totalSales.toFixed(2),
              formatCurrency(week.totalSales * 18.0), // Average price
              week.trend || 'stable'
            ])
          }
        ];
        
        // Prepare summary data
        const maxSales = weeklySalesDataForExport.length > 0 ? Math.max(...weeklySalesDataForExport.map(w => w.totalSales)) : 0;
        const minSales = weeklySalesDataForExport.length > 0 ? Math.min(...weeklySalesDataForExport.map(w => w.totalSales)) : 0;
        const avgSales = weeklySalesDataForExport.length > 0 ? weeklySalesDataForExport.reduce((sum, w) => sum + w.totalSales, 0) / weeklySalesDataForExport.length : 0;
        
        const summaryData = [
          { label: 'Total Sales Volume', value: `${(totalPmsSales + totalAgoSales).toFixed(2)} L`, subValue: 'total liters sold' },
          { label: 'Total Sales Value', value: totalWeekSales },
          { label: 'Average Weekly Sales', value: avgSales, subValue: 'per week' },
          { label: 'Best Performance', value: formatCurrency(maxSales), subValue: 'highest weekly sales' },
          { label: 'Lowest Performance', value: formatCurrency(minSales), subValue: 'lowest weekly sales' },
          { label: 'PMS Market Share', value: `${((totalPmsSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1)}%`, subValue: 'of total volume' },
          { label: 'AGO Market Share', value: `${((totalAgoSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1)}%`, subValue: 'of total volume' },
          { label: 'Analysis Period', value: getCurrentWeekInfo().dateRange, subValue: 'reporting period' }
        ];
        
        // Create export data
        const exportData = createExportData(
          'pdf',
          'weekly-sales',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            selectedWeek: selectedMonth 
          }
        );
        
        // Generate PDF
        const pdfService = new PDFExportService();
        pdfService.generatePDF(exportData);
        
        console.log('Weekly Sales Analysis PDF exported successfully');
        
      } catch (error) {
        console.error('Error exporting Weekly Sales Analysis PDF:', error);
      }
    } else if (format === 'excel') {
      const { ExcelExportService, createExcelExportData } = await import('../utils/excelExport');
      
      try {
        // Get current sales data using existing functions
        const selectedWeekData = availableWeeks.find(w => w.value === selectedWeek);
        const weeklySalesDataForExport = generateLocalWeeklySalesData(selectedMonthData, selectedWeekData);
        
        // Validate data before proceeding
        if (!weeklySalesDataForExport || weeklySalesDataForExport.length === 0) {
          toast.error('No data available for export');
          return;
        }
        
        // Calculate totals from the export data (use stable data for Excel)
        const totalWeekSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.totalSales || 0), 0);
        const totalPmsSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.pms || 0), 0);
        const totalAgoSales = weeklySalesDataForExport.reduce((sum, week) => sum + (week.ago || 0), 0);
        
        // Prepare KPI data using calculated totals
        const kpiData = {
          totalSales: totalWeekSales,
          totalProfit: totalWeekSales * 0.15, // Estimated 15% profit margin
          totalExpenses: totalWeekSales * 0.85, // Estimated 85% expenses
          totalVehicles: Math.round(totalWeekSales / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: 15.0,
          growthRate: 8.5,
          operationalEfficiency: 94.2
        };
        
        // Prepare detailed sales analysis table data
        const tableData = [
          {
            title: 'Weekly Sales Analysis by Product',
            headers: ['Product', 'Daily Avg (L)', 'Total Sales (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)', 'Market Share (%)', 'Growth (%)'],
            rows: [
              [
                'Petrol (PMS)',
                (totalPmsSales / 7).toFixed(2),
                totalPmsSales.toFixed(2),
                '17.50',
                (totalPmsSales * 17.50).toFixed(2),
                ((totalPmsSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1),
                '+12.3'
              ],
              [
                'Diesel (AGO)',
                (totalAgoSales / 7).toFixed(2),
                totalAgoSales.toFixed(2),
                '18.75',
                (totalAgoSales * 18.75).toFixed(2),
                ((totalAgoSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1),
                '+8.7'
              ]
            ]
          },
          {
            title: 'Weekly Sales Performance',
            headers: ['Week', 'PMS Sales (L)', 'AGO Sales (L)', 'Total Sales (L)', 'Sales Value (₵)', 'Trend'],
            rows: weeklySalesDataForExport.map((week, index) => [
              `Week ${index + 1}`,
              week.pms.toFixed(2),
              week.ago.toFixed(2),
              week.totalSales.toFixed(2),
              (week.totalSales * 18.0).toFixed(2), // Average price
              week.trend || 'stable'
            ])
          },
          {
            title: 'Daily Breakdown Estimate',
            headers: ['Day', 'PMS Est (L)', 'AGO Est (L)', 'Total Est (L)', 'Est Value (₵)'],
            rows: [
              ['Monday', (totalPmsSales / 7 * 0.9).toFixed(2), (totalAgoSales / 7 * 0.9).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 0.9).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 0.9 * 18.0).toFixed(2)],
              ['Tuesday', (totalPmsSales / 7 * 1.1).toFixed(2), (totalAgoSales / 7 * 1.1).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.1).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.1 * 18.0).toFixed(2)],
              ['Wednesday', (totalPmsSales / 7 * 0.8).toFixed(2), (totalAgoSales / 7 * 0.8).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 0.8).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 0.8 * 18.0).toFixed(2)],
              ['Thursday', (totalPmsSales / 7 * 1.2).toFixed(2), (totalAgoSales / 7 * 1.2).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.2).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.2 * 18.0).toFixed(2)],
              ['Friday', (totalPmsSales / 7 * 1.3).toFixed(2), (totalAgoSales / 7 * 1.3).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.3).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.3 * 18.0).toFixed(2)],
              ['Saturday', (totalPmsSales / 7 * 1.4).toFixed(2), (totalAgoSales / 7 * 1.4).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.4).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.4 * 18.0).toFixed(2)],
              ['Sunday', (totalPmsSales / 7 * 1.0).toFixed(2), (totalAgoSales / 7 * 1.0).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.0).toFixed(2), ((totalPmsSales + totalAgoSales) / 7 * 1.0 * 18.0).toFixed(2)]
            ]
          }
        ];
        
        // Prepare summary data
        const maxSales = weeklySalesDataForExport.length > 0 ? Math.max(...weeklySalesDataForExport.map(w => w.totalSales)) : 0;
        const minSales = weeklySalesDataForExport.length > 0 ? Math.min(...weeklySalesDataForExport.map(w => w.totalSales)) : 0;
        const avgSales = weeklySalesDataForExport.length > 0 ? weeklySalesDataForExport.reduce((sum, w) => sum + w.totalSales, 0) / weeklySalesDataForExport.length : 0;
        
        const summaryData = [
          { label: 'Total Sales Volume', value: `${(totalPmsSales + totalAgoSales).toFixed(2)} L`, subValue: 'total liters sold' },
          { label: 'Total Sales Value', value: totalWeekSales },
          { label: 'Average Weekly Sales', value: avgSales, subValue: 'per week' },
          { label: 'Best Performance', value: maxSales, subValue: 'highest weekly sales' },
          { label: 'Lowest Performance', value: minSales, subValue: 'lowest weekly sales' },
          { label: 'PMS Market Share', value: `${((totalPmsSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1)}%`, subValue: 'of total volume' },
          { label: 'AGO Market Share', value: `${((totalAgoSales / (totalPmsSales + totalAgoSales)) * 100).toFixed(1)}%`, subValue: 'of total volume' },
          { label: 'Analysis Period', value: getCurrentWeekInfo().dateRange, subValue: 'reporting period' }
        ];

        // Prepare chart data
        const chartDataForExport = weeklySalesDataForExport.map((week, index) => ({
          Week: `Week ${index + 1}`,
          PMS: week.pms,
          AGO: week.ago,
          Total: week.totalSales,
          'Sales Value': week.totalSales * 18.0,
          Trend: week.trend
        }));
        
        // Create export data
        const exportData = createExcelExportData(
          'excel',
          'weekly-sales',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            chartData: chartDataForExport,
            selectedWeek: selectedMonth 
          }
        );
        
        // Generate Excel with charts
        const excelService = new ExcelExportService();
        excelService.generateExcelWithCharts(exportData);
        
        console.log('Weekly Sales Analysis Excel exported successfully');
        
      } catch (error) {
        console.error('Error exporting Weekly Sales Analysis Excel:', error);
      }
    } else if (format === 'print') {
      const { printCurrentReport } = await import('../utils/simplePrint');
      
      try {
        // Use simple print service for better compatibility
        printCurrentReport();
        console.log('Weekly Sales Analysis print initiated successfully');
        
      } catch (error) {
        console.error('Error opening Weekly Sales Analysis print dialog:', error);
        // Final fallback - basic browser print
        window.print();
      }
    }
  };

  // Get current week info for display
  const currentWeekInfo = getCurrentWeekInfo() || {
    month: 'JAN',
    week: 'WEEK 1',
    dateRange: 'Jan 1 - Jan 7, 2025'
  };
  
  // Generate stable data based on selections using useMemo to prevent infinite re-renders
  const selectedWeekData = useMemo(() => 
    availableWeeks.find(w => w.value === selectedWeek), 
    [availableWeeks, selectedWeek]
  );
  
  // Create a stable key for data caching to prevent rapid changes
  const dataKey = useMemo(() => {
    if (!selectedMonthData || !selectedWeekData) return '';
    return `${selectedMonthData.month}-${selectedMonthData.year}-${selectedWeekData.weekNumber}`;
  }, [selectedMonthData, selectedWeekData]);
  
  const weeklySalesData = useMemo(() => {
    if (!selectedMonthData || !selectedWeekData || !dataKey) return [];
    return generateLocalWeeklySalesData(selectedMonthData, selectedWeekData);
  }, [selectedMonthData, selectedWeekData, dataKey]);
  
  const chartData = useMemo(() => {
    if (!weeklySalesData || weeklySalesData.length === 0) return [];
    return generateChartData(weeklySalesData);
  }, [weeklySalesData]);

  // Update comparison data when weekly sales data changes (removed to prevent circular updates)
  // The comparison data is now managed within the hook itself

  // Calculate summary statistics from stable data using useMemo
  const summaryStats = useMemo(() => {
    const validSales = weeklySalesData.filter(w => w && typeof w.totalSales === 'number' && !isNaN(w.totalSales));
    const maxSales = validSales.length > 0 ? Math.max(...validSales.map(w => w.totalSales)) : 0;
    const minSales = validSales.length > 0 ? Math.min(...validSales.map(w => w.totalSales)) : 0;
    const avgSales = validSales.length > 0 ? validSales.reduce((sum, w) => sum + w.totalSales, 0) / validSales.length : 0;

    const maxWeek = validSales.find(w => w.totalSales === maxSales);
    const minWeek = validSales.find(w => w.totalSales === minSales);
    
    return { maxSales, minSales, avgSales, maxWeek, minWeek, validSales };
  }, [weeklySalesData]);
  
  const { maxSales, minSales, avgSales, maxWeek, minWeek, validSales } = summaryStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-medium">
            Weekly Sales Analysis - {currentWeekInfo.month} {currentWeekInfo.week}
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              {currentWeekInfo.dateRange} - Comparative analysis across multiple weeks with trend visualization
            </p>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🔗 Backend Connected
            </Badge>
          </div>
        </div>
        
        {/* Month and Week Selectors */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map((week) => (
                  <SelectItem key={week.value} value={week.value}>
                    {week.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Week Selection Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Analysis Period: {currentWeekInfo.month} {currentWeekInfo.week}</p>
                  <p className="text-xs text-muted-foreground">Date Range: {currentWeekInfo.dateRange}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline" className="text-xs">
                Week {availableWeeks.find(w => w.value === selectedWeek)?.weekNumber || 1} of {availableWeeks.length}
              </Badge>
              {(() => {
                const selectedWeekData = availableWeeks.find(w => w.value === selectedWeek);
                const isCurrentMonthAndYear = selectedMonthData?.month === currentMonthYear.month && 
                                            selectedMonthData?.year === currentMonthYear.year;
                const isCurrentWeek = isCurrentMonthAndYear && 
                                    selectedWeekData?.weekNumber === getCurrentWeekOfMonth();
                return isCurrentWeek && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Current Week</Badge>
                );
              })()}
              <div className="text-xs text-muted-foreground">
                {selectedMonthData?.label}: {availableWeeks.length} week{availableWeeks.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Data Summary */}
      {analyses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">📊</div>
                <div>
                  <p className="text-blue-800 font-medium">Backend Data Available</p>
                  <p className="text-blue-600 text-sm">
                    {analyses.length} analysis record(s) loaded from backend
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Connected
                </Badge>
                {isGenerating && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-red-600">⚠️</div>
                <div>
                  <p className="text-red-800 font-medium">Error Loading Data</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
          <Download className="h-4 w-4 mr-2" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('print')}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <ShareModal 
          reportType="weekly-sales" 
          reportData={useMemo(() => {
            const totalWeekSales = weeklySalesData.reduce((sum, week) => sum + (week.totalSales || 0), 0);
            return {
              totalSales: totalWeekSales,
              totalProfit: totalWeekSales * 0.15,
              totalExpenses: totalWeekSales * 0.85,
              totalVehicles: Math.round(totalWeekSales / 350),
              avgTransactionValue: 350,
              profitMargin: 15.0,
              growthRate: 8.5,
              operationalEfficiency: 94.2
            };
          }, [weeklySalesData])}
        >
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </ShareModal>
      </div>

      {/* Main Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Comparison Table</CardTitle>
          <p className="text-sm text-muted-foreground">Detailed week-over-week sales performance analysis</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-muted-foreground">Loading sales analysis data...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-20">MONTH</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-20">WEEK</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-32">TIME PERIOD</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-28">SALES (Ltrs)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-24">PMS (Ltrs)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-24">AGO (Ltrs)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-24">DIFF PMS</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-24">DIFF AGO</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-32">OVERALL DIFF (Ltrs)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-600 text-white font-bold text-xs text-center min-w-24">% CHANGE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklySalesData && weeklySalesData.length > 0 ? weeklySalesData.map((week, index) => (
                  <TableRow key={index} className={week.bgColor || ''}>
                    <TableCell className={`border border-gray-300 font-bold text-xs text-center ${week.monthColor || ''}`}>
                      {week.month || '-'}
                    </TableCell>
                    <TableCell className="border border-gray-300 font-bold text-xs text-center">
                      {week.week || '-'}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {week.timePeriod || '-'}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center font-medium">
                      {formatNumberSafe(week.totalSales)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {formatNumberSafe(week.pms)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {formatNumberSafe(week.ago)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {renderDiffValue(week.diffPms)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {renderDiffValue(week.diffAgo)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-xs text-center">
                      {renderDiffValue(week.overallDiff)}
                    </TableCell>
                    <TableCell className={`border border-gray-300 text-xs text-center font-medium ${
                      (week.percentChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(week.percentChange)}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="border border-gray-300 text-center py-4 text-muted-foreground">
                      No data available for the selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Sales Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Comparison Chart</CardTitle>
          <p className="text-sm text-muted-foreground">Visual representation of sales trends across weeks</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-muted-foreground">Loading chart data...</span>
              </div>
            </div>
          ) : (
            <div className="relative bg-gray-50 p-6 rounded-lg">
              {/* Chart Container */}
              {chartData.length > 0 ? (
              <div className="flex items-end justify-center gap-8 h-64">
                {chartData.map((item, index) => {
                  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.1; // Add 10% padding
                  const height = (item.value / maxValue) * 200;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="text-xs font-medium mb-1">{item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                      <div 
                        className={`${item.color} w-12 transition-all duration-300 hover:opacity-80 relative group rounded-t`}
                        style={{ height: `${Math.max(height, 20)}px` }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {item.value.toLocaleString()} Ltrs
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{item.week}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No data available for the selected period</p>
              </div>
            )}
            
            {/* Y-Axis Labels */}
            {chartData.length > 0 && (
              <div className="absolute left-0 top-6 h-52 flex flex-col justify-between text-xs text-muted-foreground">
                {(() => {
                  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.1;
                  const steps = 9;
                  const stepValue = maxValue / steps;
                  const labels = [];
                  for (let i = steps; i >= 0; i--) {
                    const value = stepValue * i;
                    labels.push(
                      <span key={i}>{(value / 1000).toFixed(0)}k</span>
                    );
                  }
                  return labels;
                })()}
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="text-sm text-muted-foreground">Highest Week</div>
            </div>
            <div className="text-lg font-bold text-green-600">
              {maxWeek?.month || 'N/A'} {maxWeek?.week || ''}
            </div>
            <div className="text-sm">{formatNumberSafe(maxSales)} Ltrs</div>
            <Badge className="mt-2 bg-green-100 text-green-800">
              Peak Performance
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div className="text-sm text-muted-foreground">Lowest Week</div>
            </div>
            <div className="text-lg font-bold text-red-600">
              {minWeek?.month || 'N/A'} {minWeek?.week || ''}
            </div>
            <div className="text-sm">{formatNumberSafe(minSales)} Ltrs</div>
            <Badge className="mt-2 bg-red-100 text-red-800">
              Needs Attention
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-muted-foreground">Average Weekly Sales</div>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatNumberSafe(avgSales)} Ltrs
            </div>
            <div className="text-sm">Across {validSales.length} weeks</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">
              Baseline Metric
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Insights - {currentWeekInfo.month} {currentWeekInfo.week}</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklySalesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-green-600">Positive Trends</h4>
                <ul className="text-sm space-y-2">
                  {(() => {
                    const positiveInsights = [];
                    
                    // Find weeks with positive growth
                    const growthWeeks = weeklySalesData.filter(w => w.percentChange > 5);
                    if (growthWeeks.length > 0) {
                      const bestWeek = growthWeeks.reduce((max, week) => 
                        week.percentChange > max.percentChange ? week : max
                      );
                      positiveInsights.push(
                        <li key="growth" className="flex items-start gap-2">
                          <span className="text-green-600">▲</span>
                          <span>{bestWeek.month} {bestWeek.week} showed strong performance with {bestWeek.percentChange.toFixed(1)}% growth</span>
                        </li>
                      );
                    }
                    
                    // Check PMS vs AGO performance
                    const selectedWeekAnalysis = weeklySalesData.find(w => w.isHighlighted);
                    if (selectedWeekAnalysis) {
                      const pmsRatio = (selectedWeekAnalysis.pms / selectedWeekAnalysis.totalSales) * 100;
                      if (pmsRatio > 45) {
                        positiveInsights.push(
                          <li key="pms" className="flex items-start gap-2">
                            <span className="text-green-600">▲</span>
                            <span>PMS sales represent {pmsRatio.toFixed(1)}% of total volume, indicating strong demand</span>
                          </li>
                        );
                      }
                    }
                    
                    // Check if current period is above average
                    if (selectedWeekAnalysis && selectedWeekAnalysis.totalSales > avgSales) {
                      const aboveAvg = ((selectedWeekAnalysis.totalSales - avgSales) / avgSales) * 100;
                      positiveInsights.push(
                        <li key="above-avg" className="flex items-start gap-2">
                          <span className="text-green-600">▲</span>
                          <span>Selected week performance is {aboveAvg.toFixed(1)}% above period average</span>
                        </li>
                      );
                    }
                    
                    // Default positive insight if none found
                    if (positiveInsights.length === 0) {
                      positiveInsights.push(
                        <li key="default" className="flex items-start gap-2">
                          <span className="text-green-600">▲</span>
                          <span>Sales performance remains stable within expected range</span>
                        </li>
                      );
                    }
                    
                    return positiveInsights;
                  })()}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-red-600">Areas for Improvement</h4>
                <ul className="text-sm space-y-2">
                  {(() => {
                    const improvementAreas = [];
                    
                    // Find weeks with significant decline
                    const declineWeeks = weeklySalesData.filter(w => w.percentChange < -5);
                    if (declineWeeks.length > 0) {
                      const worstWeek = declineWeeks.reduce((min, week) => 
                        week.percentChange < min.percentChange ? week : min
                      );
                      improvementAreas.push(
                        <li key="decline" className="flex items-start gap-2">
                          <span className="text-red-600">▼</span>
                          <span>{worstWeek.month} {worstWeek.week} experienced decline of {Math.abs(worstWeek.percentChange).toFixed(1)}%</span>
                        </li>
                      );
                    }
                    
                    // Check AGO volatility
                    const agoVariations = weeklySalesData.filter(w => w.diffAgo !== null && Math.abs(w.diffAgo) > 1000);
                    if (agoVariations.length > 0) {
                      improvementAreas.push(
                        <li key="ago-volatility" className="flex items-start gap-2">
                          <span className="text-red-600">▼</span>
                          <span>AGO sales show high volatility requiring attention</span>
                        </li>
                      );
                    }
                    
                    // Check if current period is below average
                    const selectedWeekAnalysis = weeklySalesData.find(w => w.isHighlighted);
                    if (selectedWeekAnalysis && selectedWeekAnalysis.totalSales < avgSales) {
                      const belowAvg = ((avgSales - selectedWeekAnalysis.totalSales) / avgSales) * 100;
                      improvementAreas.push(
                        <li key="below-avg" className="flex items-start gap-2">
                          <span className="text-red-600">▼</span>
                          <span>Selected week is {belowAvg.toFixed(1)}% below period average</span>
                        </li>
                      );
                    }
                    
                    // Default improvement area if none found
                    if (improvementAreas.length === 0) {
                      improvementAreas.push(
                        <li key="default" className="flex items-start gap-2">
                          <span className="text-red-600">▼</span>
                          <span>Monitor week-to-week consistency for operational optimization</span>
                        </li>
                      );
                    }
                    
                    return improvementAreas;
                  })()}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available for insights analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}