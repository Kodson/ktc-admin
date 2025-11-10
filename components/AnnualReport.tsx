import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ShareModal } from './ShareModal';
import { useAnnualReport } from '../hooks/useAnnualReport';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText,
  Download,
  Calendar,
  Printer,
  Share2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Utility functions for year calculations
const getCurrentYear = () => new Date().getFullYear();

// Generate available years for selection
const generateAvailableYears = () => {
  const currentYear = getCurrentYear();
  const years = [];
  
  // Generate years from 2020 to current year
  for (let year = 2020; year <= currentYear; year++) {
    years.push({
      value: year.toString(),
      label: year.toString(),
      year: year
    });
  }
  
  return years.reverse(); // Most recent first
};

// Base annual data patterns for different years
const yearlyDataPatterns = {
  2024: {
    baseVolumes: { pms: 28000, ago: 42000 },
    growthTrend: 'stable',
    seasonality: [1.1, 0.95, 0.88, 0.82, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2],
    completeness: 12 // Full year
  },
  2023: {
    baseVolumes: { pms: 26000, ago: 39000 },
    growthTrend: 'growth',
    seasonality: [0.9, 0.92, 0.95, 0.98, 1.0, 1.05, 1.1, 1.15, 1.2, 1.18, 1.15, 1.1],
    completeness: 12 // Full year
  },
  2022: {
    baseVolumes: { pms: 24000, ago: 36000 },
    growthTrend: 'volatile',
    seasonality: [0.85, 0.9, 1.1, 1.15, 0.95, 0.88, 0.92, 1.05, 1.08, 1.12, 1.0, 0.95],
    completeness: 12 // Full year
  },
  2021: {
    baseVolumes: { pms: 22000, ago: 34000 },
    growthTrend: 'recovery',
    seasonality: [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25],
    completeness: 12 // Full year
  },
  2020: {
    baseVolumes: { pms: 20000, ago: 32000 },
    growthTrend: 'decline',
    seasonality: [1.2, 1.15, 1.0, 0.6, 0.4, 0.5, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0],
    completeness: 12 // Full year
  }
};

// Generate dynamic annual data based on selected year
const generateAnnualSalesData = (selectedYear: number) => {
  const currentYear = getCurrentYear();
  const currentMonth = new Date().getMonth(); // 0-based (0 = January)
  
  // Determine data completeness
  let completeness = 12;
  if (selectedYear === currentYear) {
    completeness = currentMonth + 1; // Current month + 1 (to include current month)
  }
  
  // Get pattern or use fallback
  const pattern = yearlyDataPatterns[selectedYear as keyof typeof yearlyDataPatterns] || {
    baseVolumes: { pms: 25000, ago: 38000 },
    growthTrend: 'stable',
    seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    completeness: selectedYear === currentYear ? completeness : 12
  };
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  // Add December of previous year as starting point for current year
  if (selectedYear === currentYear && currentMonth >= 0) {
    const prevYearPattern = yearlyDataPatterns[(selectedYear - 1) as keyof typeof yearlyDataPatterns] || pattern;
    const prevPms = prevYearPattern.baseVolumes.pms * (prevYearPattern.seasonality[11] || 1.0) * (0.95 + Math.random() * 0.1);
    const prevAgo = prevYearPattern.baseVolumes.ago * (prevYearPattern.seasonality[11] || 1.0) * (0.95 + Math.random() * 0.1);
    
    data.push({
      month: `Dec ${(selectedYear - 1).toString().slice(-2)}`,
      monthShort: `Dec_${(selectedYear - 1).toString().slice(-2)}`,
      pmsAgo: prevPms + prevAgo,
      pms: prevPms,
      ago: prevAgo,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    });
  }
  
  // Generate monthly data
  for (let i = 0; i < 12; i++) {
    const hasData = i < completeness;
    
    if (hasData) {
      const seasonalFactor = pattern.seasonality[i] || 1.0;
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random variation
      
      const pms = pattern.baseVolumes.pms * seasonalFactor * randomVariation;
      const ago = pattern.baseVolumes.ago * seasonalFactor * randomVariation;
      const pmsAgo = pms + ago;
      
      // Calculate differences from previous month
      const prevData = data[data.length - 1];
      const diffPmsAgo = prevData ? pmsAgo - prevData.pmsAgo : null;
      const diffPms = prevData ? pms - prevData.pms : null;
      const diffAgo = prevData ? ago - prevData.ago : null;
      
      data.push({
        month: monthNames[i],
        monthShort: monthNames[i],
        pmsAgo: pmsAgo,
        pms: pms,
        ago: ago,
        diffPmsAgo: diffPmsAgo,
        diffPms: diffPms,
        diffAgo: diffAgo
      });
    } else {
      data.push({
        month: monthNames[i],
        monthShort: monthNames[i],
        pmsAgo: null,
        pms: null,
        ago: null,
        diffPmsAgo: null,
        diffPms: null,
        diffAgo: null
      });
    }
  }
  
  return {
    year: selectedYear.toString(),
    data: data,
    completeness: completeness,
    pattern: pattern
  };
};

// Get trend analysis based on data
const getTrendAnalysis = (salesData: any) => {
  const validData = salesData.data.filter((item: any) => item.pmsAgo !== null);
  if (validData.length < 2) return { trend: 'insufficient_data', direction: 'neutral' };
  
  const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
  const secondHalf = validData.slice(Math.floor(validData.length / 2));
  
  const firstAvg = firstHalf.reduce((sum: number, item: any) => sum + item.pmsAgo, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum: number, item: any) => sum + item.pmsAgo, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(change) < 5) return { trend: 'stable', direction: 'neutral', change: change };
  if (change > 15) return { trend: 'strong_growth', direction: 'up', change: change };
  if (change > 5) return { trend: 'growth', direction: 'up', change: change };
  if (change < -15) return { trend: 'strong_decline', direction: 'down', change: change };
  if (change < -5) return { trend: 'decline', direction: 'down', change: change };
  
  return { trend: 'stable', direction: 'neutral', change: change };
};

// Calculate totals for dynamic data
const calculateDynamicTotals = (salesData: any) => {
  const validData = salesData.data.filter((item: any) => item.pmsAgo !== null);
  
  return {
    totalPmsAgo: validData.reduce((sum: number, item: any) => sum + (item.pmsAgo || 0), 0),
    totalPms: validData.reduce((sum: number, item: any) => sum + (item.pms || 0), 0),
    totalAgo: validData.reduce((sum: number, item: any) => sum + (item.ago || 0), 0),
    averagePmsAgo: validData.length > 0 ? validData.reduce((sum: number, item: any) => sum + (item.pmsAgo || 0), 0) / validData.length : 0,
    averagePms: validData.length > 0 ? validData.reduce((sum: number, item: any) => sum + (item.pms || 0), 0) / validData.length : 0,
    averageAgo: validData.length > 0 ? validData.reduce((sum: number, item: any) => sum + (item.ago || 0), 0) / validData.length : 0,
    validMonths: validData.length
  };
};

// Annual sales data structure following the image format (fallback for old code compatibility)
const annualSalesData = {
  year: '2025',
  data: [
    {
      month: 'Dec 24',
      monthShort: 'Dec_24',
      pmsAgo: 79720.73,
      pms: 32814.95,
      ago: 46905.78,
      diffPmsAgo: null, // No previous data for first entry
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Jan',
      monthShort: 'Jan',
      pmsAgo: 78958.07,
      pms: 32798.27,
      ago: 46159.80,
      diffPmsAgo: -762.66,
      diffPms: -16.68,
      diffAgo: -745.98
    },
    {
      month: 'Feb',
      monthShort: 'Feb',
      pmsAgo: 70922.76,
      pms: 29431.52,
      ago: 41491.24,
      diffPmsAgo: -8035.31,
      diffPms: -3366.75,
      diffAgo: -4668.56
    },
    {
      month: 'Mar',
      monthShort: 'Mar',
      pmsAgo: 63834.73,
      pms: 24637.48,
      ago: 39197.25,
      diffPmsAgo: -7088.03,
      diffPms: -4794.04,
      diffAgo: -2293.99
    },
    {
      month: 'Apr',
      monthShort: 'Apr',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'May',
      monthShort: 'May',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Jun',
      monthShort: 'Jun',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Jul',
      monthShort: 'Jul',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Aug',
      monthShort: 'Aug',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Sep',
      monthShort: 'Sep',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Oct',
      monthShort: 'Oct',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Nov',
      monthShort: 'Nov',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    },
    {
      month: 'Dec',
      monthShort: 'Dec',
      pmsAgo: null,
      pms: null,
      ago: null,
      diffPmsAgo: null,
      diffPms: null,
      diffAgo: null
    }
  ]
};



export function AnnualReport() {
  const { user } = useAuth();
  
  // Get current year for default
  const currentYear = getCurrentYear();
  const availableYears = generateAvailableYears();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  // Backend integration
  const {
    currentReport,
    isLoading,
    isGenerating,
    error,
    generateReport,
    refreshData
  } = useAnnualReport();
  
  // Generate dynamic data based on selected year
  const annualSalesData = useMemo(() => {
    return generateAnnualSalesData(parseInt(selectedYear));
  }, [selectedYear]);
  
  // Calculate totals from dynamic data
  const totals = useMemo(() => {
    return calculateDynamicTotals(annualSalesData);
  }, [annualSalesData]);

  // Backend handlers
  const handleGenerateReport = async () => {
    try {
      const yearInfo = {
        year: parseInt(selectedYear),
        dateRange: `01/01/${selectedYear.slice(-2)} - 31/12/${selectedYear.slice(-2)}`,
        totalDays: parseInt(selectedYear) % 4 === 0 ? 366 : 365,
        businessDays: Math.floor((parseInt(selectedYear) % 4 === 0 ? 366 : 365) * 0.714),
        completedMonths: parseInt(selectedYear) === currentYear ? new Date().getMonth() + 1 : 12,
        timePeriod: `Year ${selectedYear}`
      };
      
      const stationId = user?.role === 'ROLE_STATION_MANAGER' ? user.stationId || 'station-001' : 'station-001';
      await generateReport(yearInfo, stationId);
    } catch (error) {
      console.error('Error generating annual report:', error);
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing annual report data:', error);
    }
  };

  // Get backend status
  const getBackendStatus = () => {
    if (isGenerating) {
      return { status: 'generating', label: 'Generating', color: 'bg-blue-100 text-blue-800', icon: Activity };
    }
    if (isLoading) {
      return { status: 'loading', label: 'Loading', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
    if (error) {
      return { status: 'error', label: 'Error', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    if (currentReport) {
      return { status: 'connected', label: 'Backend Connected', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    return { status: 'disconnected', label: 'Backend Ready', color: 'bg-gray-100 text-gray-800', icon: Activity };
  };

  const backendStatus = getBackendStatus();

  const formatNumber = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDifference = (value: number | null) => {
    if (value === null) return '-';
    const formatted = formatNumber(Math.abs(value));
    return value < 0 ? `(${formatted})` : formatted;
  };

  const getDifferenceStyle = (value: number | null) => {
    if (value === null) return 'text-gray-500';
    return value < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium';
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Prepare chart data from dynamic annual data
  const chartData = useMemo(() => {
    return annualSalesData.data
      .filter(item => item.pmsAgo !== null)
      .map(item => ({
        month: item.monthShort,
        'PMS + AGO': item.pmsAgo,
        'PMS': item.pms,
        'AGO': item.ago
      }));
  }, [annualSalesData]);

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      const { PDFExportService, createExportData } = await import('../utils/pdfExport');
      
      try {
        // Use existing annual sales data and calculated totals
        const currentData = annualSalesData;
        const currentTotals = totals;
        
        // Calculate annual KPIs from existing data
        const validMonths = currentData.data.filter(item => item.pmsAgo !== null);
        const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
        const totalSalesValue = totalSalesVolume * 18.0; // Average price estimate
        const estimatedProfit = totalSalesValue * 0.15; // 15% profit margin
        const estimatedExpenses = totalSalesValue * 0.85; // 85% expenses
        const estimatedVehicles = Math.round(totalSalesValue / 350);
        
        // Prepare KPI data
        const kpiData = {
          totalSales: totalSalesValue,
          totalProfit: estimatedProfit,
          totalExpenses: estimatedExpenses,
          totalVehicles: estimatedVehicles,
          avgTransactionValue: 350,
          profitMargin: 15.0,
          growthRate: parseInt(selectedYear) === getCurrentYear() ? 15.7 : 12.3,
          operationalEfficiency: 93.5
        };
        
        // Prepare table data
        const tableData = [
          {
            title: 'Annual Sales Performance by Month',
            headers: ['Month', 'PMS Sales (L)', 'AGO Sales (L)', 'Total Sales (L)', 'Est. Sales Value (₵)', 'Growth (%)'],
            rows: validMonths.map(month => [
              month.month,
              month.pms ? formatNumber(month.pms) : '-',
              month.ago ? formatNumber(month.ago) : '-',
              month.pmsAgo ? formatNumber(month.pmsAgo) : '-',
              month.pmsAgo ? formatCurrency(month.pmsAgo * 18.0) : '-',
              month.growth ? formatPercentage(month.growth) : '-'
            ])
          },
          {
            title: 'Quarterly Performance Summary',
            headers: ['Quarter', 'Total Volume (L)', 'Est. Sales Value (₵)', 'Market Trend'],
            rows: [
              ['Q1 (Jan-Mar)', formatNumber(currentTotals.q1Total), formatCurrency(currentTotals.q1Total * 18.0), 'Growing'],
              ['Q2 (Apr-Jun)', formatNumber(currentTotals.q2Total), formatCurrency(currentTotals.q2Total * 18.0), 'Stable'],
              ['Q3 (Jul-Sep)', formatNumber(currentTotals.q3Total), formatCurrency(currentTotals.q3Total * 18.0), 'Peak Season'],
              ['Q4 (Oct-Dec)', formatNumber(currentTotals.q4Total), formatCurrency(currentTotals.q4Total * 18.0), 'Steady']
            ]
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Annual Total Volume', value: `${formatNumber(currentTotals.grandTotal)} L`, subValue: 'total liters sold' },
          { label: 'Annual Sales Value', value: totalSalesValue },
          { label: 'Estimated Annual Profit', value: estimatedProfit },
          { label: 'Annual Vehicles Served', value: estimatedVehicles, subValue: 'total customers' },
          { label: 'Average Monthly Volume', value: `${formatNumber(currentTotals.grandTotal / 12)} L`, subValue: 'per month' },
          { label: 'Best Performing Quarter', value: 'Q3', subValue: 'highest sales volume' },
          { label: 'PMS vs AGO Ratio', value: '60:40', subValue: 'product mix' },
          { label: 'Year Performance', value: `${selectedYear}`, subValue: 'reporting year' }
        ];
        
        // Create export data
        const exportData = createExportData(
          'pdf',
          'annual',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            selectedYear: selectedYear 
          }
        );
        
        // Generate PDF
        const pdfService = new PDFExportService();
        pdfService.generatePDF(exportData);
        
        console.log('Annual PDF exported successfully');
        
      } catch (error) {
        console.error('Error exporting Annual PDF:', error);
      }
    } else if (format === 'excel') {
      const { ExcelExportService, createExcelExportData } = await import('../utils/excelExport');
      
      try {
        // Use existing annual sales data and calculated totals
        const currentData = annualSalesData;
        const currentTotals = totals;
        
        // Calculate annual KPIs from existing data
        const validMonths = currentData.data.filter(item => item.pmsAgo !== null);
        const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
        const totalSalesValue = totalSalesVolume * 18.0; // Average price estimate
        const estimatedProfit = totalSalesValue * 0.15; // 15% profit margin
        const estimatedExpenses = totalSalesValue * 0.85; // 85% expenses
        const estimatedVehicles = Math.round(totalSalesValue / 350);
        
        // Prepare KPI data
        const kpiData = {
          totalSales: totalSalesValue,
          totalProfit: estimatedProfit,
          totalExpenses: estimatedExpenses,
          totalVehicles: estimatedVehicles,
          avgTransactionValue: 350,
          profitMargin: 15.0,
          growthRate: parseInt(selectedYear) === getCurrentYear() ? 15.7 : 12.3,
          operationalEfficiency: 93.5
        };
        
        // Prepare table data
        const tableData = [
          {
            title: 'Annual Sales Performance by Month',
            headers: ['Month', 'PMS Sales (L)', 'AGO Sales (L)', 'Total Sales (L)', 'Est. Sales Value (₵)', 'Growth (%)'],
            rows: validMonths.map(month => [
              month.month,
              month.pms ? formatNumber(month.pms) : '-',
              month.ago ? formatNumber(month.ago) : '-',
              month.pmsAgo ? formatNumber(month.pmsAgo) : '-',
              month.pmsAgo ? (month.pmsAgo * 18.0).toFixed(2) : '-',
              month.growth ? formatPercentage(month.growth) : '-'
            ])
          },
          {
            title: 'Quarterly Performance Summary',
            headers: ['Quarter', 'Months', 'Total Volume (L)', 'Est. Sales Value (₵)', 'Market Trend', 'Performance'],
            rows: [
              ['Q1', 'Jan-Mar', formatNumber(currentTotals.q1Total), (currentTotals.q1Total * 18.0).toFixed(2), 'Growing', 'Strong'],
              ['Q2', 'Apr-Jun', formatNumber(currentTotals.q2Total), (currentTotals.q2Total * 18.0).toFixed(2), 'Stable', 'Good'],
              ['Q3', 'Jul-Sep', formatNumber(currentTotals.q3Total), (currentTotals.q3Total * 18.0).toFixed(2), 'Peak Season', 'Excellent'],
              ['Q4', 'Oct-Dec', formatNumber(currentTotals.q4Total), (currentTotals.q4Total * 18.0).toFixed(2), 'Steady', 'Good']
            ]
          },
          {
            title: 'Product Performance Analysis',
            headers: ['Product', 'Annual Volume (L)', 'Market Share (%)', 'Avg Price (₵)', 'Revenue (₵)', 'Growth Trend'],
            rows: [
              ['Petrol (PMS)', formatNumber(validMonths.reduce((sum, m) => sum + (m.pms || 0), 0)), '62.5%', '17.75', (validMonths.reduce((sum, m) => sum + (m.pms || 0), 0) * 17.75).toFixed(2), '+14.2%'],
              ['Diesel (AGO)', formatNumber(validMonths.reduce((sum, m) => sum + (m.ago || 0), 0)), '37.5%', '18.25', (validMonths.reduce((sum, m) => sum + (m.ago || 0), 0) * 18.25).toFixed(2), '+11.8%']
            ]
          },
          {
            title: 'Monthly Differences Analysis',
            headers: ['Month', 'Sales Volume (L)', 'Difference vs Previous', 'Percentage Change', 'Cumulative Total'],
            rows: (() => {
              let cumulative = 0;
              return currentData.data.map((month, index) => {
                const current = month.pmsAgo || 0;
                const previous = index > 0 ? (currentData.data[index - 1].pmsAgo || 0) : current;
                const difference = current - previous;
                const percentChange = previous > 0 ? ((difference / previous) * 100) : 0;
                cumulative += current;
                
                return [
                  month.monthShort,
                  current > 0 ? formatNumber(current) : '-',
                  index > 0 ? (difference >= 0 ? `+${formatNumber(difference)}` : formatNumber(difference)) : '-',
                  index > 0 ? (percentChange >= 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`) : '-',
                  formatNumber(cumulative)
                ];
              });
            })()
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Annual Total Volume', value: `${formatNumber(currentTotals.grandTotal)} L`, subValue: 'total liters sold' },
          { label: 'Annual Sales Value', value: totalSalesValue },
          { label: 'Estimated Annual Profit', value: estimatedProfit },
          { label: 'Annual Vehicles Served', value: estimatedVehicles, subValue: 'total customers' },
          { label: 'Average Monthly Volume', value: `${formatNumber(currentTotals.grandTotal / 12)} L`, subValue: 'per month' },
          { label: 'Best Performing Quarter', value: 'Q3', subValue: 'highest sales volume' },
          { label: 'PMS vs AGO Ratio', value: '62.5:37.5', subValue: 'product mix' },
          { label: 'Year Performance', value: `${selectedYear}`, subValue: 'reporting year' },
          { label: 'Peak Sales Month', value: validMonths.reduce((max, month) => (month.pmsAgo || 0) > (max.pmsAgo || 0) ? month : max, validMonths[0]).monthShort, subValue: 'highest monthly sales' },
          { label: 'Growth Rate', value: `${kpiData.growthRate}%`, subValue: 'year-over-year' }
        ];

        // Prepare chart data
        const chartData = validMonths.map(month => ({
          Month: month.monthShort,
          PMS: month.pms || 0,
          AGO: month.ago || 0,
          Total: month.pmsAgo || 0,
          'Sales Value': (month.pmsAgo || 0) * 18.0,
          'Growth %': month.growth || 0
        }));
        
        // Create export data
        const exportData = createExcelExportData(
          'excel',
          'annual',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            chartData,
            selectedYear: selectedYear 
          }
        );
        
        // Generate Excel with charts
        const excelService = new ExcelExportService();
        excelService.generateExcelWithCharts(exportData);
        
        console.log('Annual Excel exported successfully');
        
      } catch (error) {
        console.error('Error exporting Annual Excel:', error);
      }
    } else if (format === 'print') {
      const { printCurrentReport } = await import('../utils/simplePrint');
      
      try {
        // Use simple print service for better compatibility
        printCurrentReport();
        console.log('Annual print initiated successfully');
        
      } catch (error) {
        console.error('Error opening Annual print dialog:', error);
        // Final fallback - basic browser print
        window.print();
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-medium">
              ANNUAL REPORT - {annualSalesData.year}
            </h1>
            {/* Backend Status Badge */}
            <Badge className={`${backendStatus.color} border-0`}>
              <backendStatus.icon className="h-3 w-3 mr-1" />
              {backendStatus.label}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Accra Central Station - Monthly Sales Analysis in Liters</p>
        </div>
        
        {/* Year Selector and Backend Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Backend Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
          reportType="annual" 
          reportData={{
            totalSales: (() => {
              const validMonths = annualSalesData.data.filter(item => item.pmsAgo !== null);
              const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
              return totalSalesVolume * 18.0;
            })(),
            totalProfit: (() => {
              const validMonths = annualSalesData.data.filter(item => item.pmsAgo !== null);
              const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
              const totalSalesValue = totalSalesVolume * 18.0;
              return totalSalesValue * 0.15;
            })(),
            totalExpenses: (() => {
              const validMonths = annualSalesData.data.filter(item => item.pmsAgo !== null);
              const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
              const totalSalesValue = totalSalesVolume * 18.0;
              return totalSalesValue * 0.85;
            })(),
            totalVehicles: (() => {
              const validMonths = annualSalesData.data.filter(item => item.pmsAgo !== null);
              const totalSalesVolume = validMonths.reduce((sum, month) => sum + (month.pmsAgo || 0), 0);
              const totalSalesValue = totalSalesVolume * 18.0;
              return Math.round(totalSalesValue / 350);
            })(),
            avgTransactionValue: 350,
            profitMargin: 15.0,
            growthRate: parseInt(selectedYear) === getCurrentYear() ? 15.7 : 12.3,
            operationalEfficiency: 93.5
          }}
        >
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </ShareModal>
      </div>

      {/* Annual Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Annual Sales (PMS+AGO)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totals.totalPmsAgo)} L
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">
              {totals.validMonths} months data
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PMS Sales</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(totals.totalPms)} L</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Avg: {formatNumber(totals.averagePms)} L</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total AGO Sales</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(totals.totalAgo)} L</div>
            <Badge className="mt-2 bg-purple-100 text-purple-800">Avg: {formatNumber(totals.averageAgo)} L</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>MONTHLY SALES IN LITERS</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly breakdown with month-over-month differences</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-20">MONTH</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs min-w-28">PMS + AGO</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs min-w-24">PMS</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs min-w-24">AGO</TableHead>
                  <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs min-w-32">DIFF. (PMS+AGO)</TableHead>
                  <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs min-w-28">DIFF. PMS</TableHead>
                  <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs min-w-28">DIFF. AGO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {annualSalesData.data.map((monthData, index) => (
                  <TableRow key={index} className={monthData.pmsAgo === null ? 'bg-gray-50' : ''}>
                    <TableCell className="border border-gray-300 font-medium text-center text-xs">{monthData.month}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-50 text-xs font-medium">
                      {formatNumber(monthData.pmsAgo)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-50 text-xs font-medium">
                      {formatNumber(monthData.pms)}
                    </TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-50 text-xs font-medium">
                      {formatNumber(monthData.ago)}
                    </TableCell>
                    <TableCell className={`border border-gray-300 text-center bg-red-50 text-xs ${getDifferenceStyle(monthData.diffPmsAgo)}`}>
                      {formatDifference(monthData.diffPmsAgo)}
                    </TableCell>
                    <TableCell className={`border border-gray-300 text-center bg-red-50 text-xs ${getDifferenceStyle(monthData.diffPms)}`}>
                      {formatDifference(monthData.diffPms)}
                    </TableCell>
                    <TableCell className={`border border-gray-300 text-center bg-red-50 text-xs ${getDifferenceStyle(monthData.diffAgo)}`}>
                      {formatDifference(monthData.diffAgo)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                <TableRow className="bg-yellow-200 font-bold">
                  <TableCell className="border border-gray-300 font-bold text-center text-xs bg-yellow-300">TOTAL</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    {formatNumber(totals.totalPmsAgo)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    {formatNumber(totals.totalPms)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    {formatNumber(totals.totalAgo)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">-</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">-</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">-</TableCell>
                </TableRow>
                
                {/* Averages Row */}
                <TableRow className="bg-gray-200">
                  <TableCell className="border border-gray-300 text-center text-xs font-medium bg-gray-300">AVG</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-medium">
                    {totals.averagePmsAgo.toFixed(2)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-medium">
                    {totals.averagePms.toFixed(2)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-medium">
                    {totals.averageAgo.toFixed(2)}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Annual Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Sales Visualization</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly sales trends comparison by fuel type</p>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  domain={[0, chartData.length > 0 ? Math.max(...chartData.map(d => d['PMS + AGO'])) * 1.1 : 100000]}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="PMS + AGO" 
                  fill="#3b82f6" 
                  name="PMS + AGO"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="PMS" 
                  fill="#ef4444" 
                  name="PMS"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="AGO" 
                  fill="#1f2937" 
                  name="AGO"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Annual Summary Information */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Report Summary</CardTitle>
          <p className="text-sm text-muted-foreground">Key insights and performance indicators</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Sales Period</span>
                  <span className="font-medium">{totals.validMonths} months ({annualSalesData.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Highest Monthly Sales</span>
                  <span className="font-medium">{chartData.length > 0 ? formatNumber(Math.max(...chartData.map(d => d['PMS + AGO']))) : '0.00'} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lowest Monthly Sales</span>
                  <span className="font-medium">{chartData.length > 0 ? formatNumber(Math.min(...chartData.map(d => d['PMS + AGO']))) : '0.00'} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sales Trend</span>
                  {(() => {
                    const trend = annualSalesData.pattern?.growthTrend || 'stable';
                    const trendColors = {
                      'growth': 'bg-green-100 text-green-800',
                      'stable': 'bg-blue-100 text-blue-800',
                      'decline': 'bg-red-100 text-red-800',
                      'declining': 'bg-red-100 text-red-800',
                      'volatile': 'bg-yellow-100 text-yellow-800',
                      'recovery': 'bg-purple-100 text-purple-800'
                    };
                    return (
                      <Badge className={`text-xs ${trendColors[trend as keyof typeof trendColors] || 'bg-gray-100 text-gray-800'}`}>
                        {trend.charAt(0).toUpperCase() + trend.slice(1)}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Fuel Type Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">PMS Contribution</span>
                  <span className="font-medium">{((totals.totalPms / totals.totalPmsAgo) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">AGO Contribution</span>
                  <span className="font-medium">{((totals.totalAgo / totals.totalPmsAgo) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Remaining Months</span>
                  <span className="font-medium">{12 - totals.validMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data Completeness</span>
                  {(() => {
                    const completeness = Math.round((totals.validMonths / 12) * 100);
                    const getCompletenessColor = (percent: number) => {
                      if (percent >= 90) return 'bg-green-100 text-green-800';
                      if (percent >= 70) return 'bg-blue-100 text-blue-800';
                      if (percent >= 50) return 'bg-yellow-100 text-yellow-800';
                      return 'bg-red-100 text-red-800';
                    };
                    return (
                      <Badge className={`text-xs ${getCompletenessColor(completeness)}`}>
                        {completeness}% Complete
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}