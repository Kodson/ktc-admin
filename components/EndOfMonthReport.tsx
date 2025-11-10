import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Loader2
} from 'lucide-react';
import { getCurrentMonthYear, generateAvailableMonths, formatCurrency, formatNumber } from '../utils/dateUtils';
import { useEndOfMonthReport } from '../hooks/useEndOfMonthReport';
import { toast } from 'sonner';

// Generate deterministic monthly pricing data based on selected month
const generateMonthlyPricingData = (selectedMonthData: any) => {
  if (!selectedMonthData) {
    // Default data for January
    return {
      pms: {
        basePrice: 17.50,
        weeklyPeriods: [
          {
            period: "Week 1",
            dateRange: "01-07 Jan",
            priceAdjustment: 0.00,
            quantity: 63450.36,
            salesValue: 0
          },
          {
            period: "Week 2", 
            dateRange: "08-14 Jan",
            priceAdjustment: 0.05,
            quantity: 65773.90,
            salesValue: 0
          },
          {
            period: "Week 3",
            dateRange: "15-21 Jan", 
            priceAdjustment: 0.10,
            quantity: 68934.57,
            salesValue: 0
          },
          {
            period: "Week 4",
            dateRange: "22-31 Jan", 
            priceAdjustment: 0.15,
            quantity: 72341.28,
            salesValue: 0
          }
        ]
      },
      ago: {
        basePrice: 19.20,
        weeklyPeriods: [
          {
            period: "Week 1",
            dateRange: "01-07 Jan", 
            priceAdjustment: 0.00,
            quantity: 149128.97,
            salesValue: 0
          },
          {
            period: "Week 2",
            dateRange: "08-14 Jan",
            priceAdjustment: 0.08,
            quantity: 154691.34,
            salesValue: 0
          },
          {
            period: "Week 3",
            dateRange: "15-21 Jan",
            priceAdjustment: 0.16,
            quantity: 160122.33,
            salesValue: 0
          },
          {
            period: "Week 4",
            dateRange: "22-31 Jan",
            priceAdjustment: 0.24,
            quantity: 165876.54,
            salesValue: 0
          }
        ]
      }
    };
  }

  // Use month and year as seed for deterministic data
  const seed = selectedMonthData.monthIndex + (selectedMonthData.year * 12);
  const monthName = selectedMonthData.month.slice(0, 3);
  const daysInMonth = getDaysInMonth(selectedMonthData.monthIndex, selectedMonthData.year);
  
  // Deterministic base prices
  const pmsBasePrice = 17.00 + ((seed % 100) / 100); // 17.00-18.00
  const agoBasePrice = 18.50 + ((seed % 150) / 100); // 18.50-20.00
  
  // Generate week periods based on month days
  const generateWeekPeriods = (fuelType: 'pms' | 'ago') => {
    const baseQuantity = fuelType === 'pms' ? 60000 : 140000;
    const weeklyPeriods = [];
    
    for (let week = 1; week <= 4; week++) {
      const weekSeed = seed + (week * 7);
      const startDay = (week - 1) * 7 + 1;
      const endDay = week === 4 ? daysInMonth : week * 7;
      
      // Deterministic adjustments and quantities
      const priceAdjustment = ((weekSeed % 20) / 100); // 0-0.20 adjustment
      const quantityVariation = 1 + ((weekSeed % 30) - 15) / 100; // ±15% variation
      const quantity = baseQuantity * quantityVariation;
      
      weeklyPeriods.push({
        period: `Week ${week}`,
        dateRange: `${startDay.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')} ${monthName}`,
        priceAdjustment,
        quantity,
        salesValue: 0
      });
    }
    
    return weeklyPeriods;
  };

  return {
    pms: {
      basePrice: pmsBasePrice,
      weeklyPeriods: generateWeekPeriods('pms')
    },
    ago: {
      basePrice: agoBasePrice,
      weeklyPeriods: generateWeekPeriods('ago')
    }
  };
};

// Monthly report data structure (similar to weekly but cumulative)
const monthlyReportData = {
  monthInfo: {
    month: 'JAN',
    year: '2025',
    dateRange: '(01 - 31/01/25)'
  },
  
  // Main totals section (monthly cumulative)
  totals: {
    pms: {
      openingStock: 62400.00,
      supply: 36000.00,
      availableStock: 98400.00,
      salesCost: 270500.11,
      salesUnitPrice: 4754285.12,
      unitPrice: 17.57,
      closingStock: 27899.89,
      closingDispensing: 28200.00,
      undergroundGains: 300.11,
      pumpGains: 154.05
    },
    ago: {
      openingStock: 126400.00,
      supply: 71400.00,
      availableStock: 197800.00,
      salesCost: 629819.18,
      salesUnitPrice: 12145687.45,
      unitPrice: 19.32,
      closingStock: 67980.82,
      closingDispensing: 68500.00,
      undergroundGains: 519.18,
      pumpGains: 212.60
    },
    rate: {
      openingStock: 13.70,
      supply: 0,
      availableStock: 13.70,
      salesCost: 59960,
      salesUnitPrice: 59960,
      closingStock: 0,
      closingDispensing: 0,
      undergroundGains: 0,
      pumpGains: 0
    },
    pms_value: {
      openingStock: 1092880.00,
      availableStock: 1722880.00,
      salesCost: 4734775.92,
      salesUnitPrice: 4754285.12,
      undergroundGains: 5265.93,
      pumpGains: 2699.63
    },
    ago_value: {
      openingStock: 2426880.00,
      availableStock: 3800240.00,
      salesCost: 12100528.26,
      salesUnitPrice: 12145687.45,
      undergroundGains: 9969.06,
      pumpGains: 4088.14
    },
    total: {
      openingStock: 3519760.00,
      availableStock: 5523120.00,
      salesCost: 16895264.18,
      salesUnitPrice: 16959932.57,
      undergroundGains: 15234.99,
      pumpGains: 6787.77
    }
  },
  
  // Summary data for calculations (monthly)
  summaryData: {
    openingStockValue: 2702600.00,
    totalSupplyValue: 1496000.00,
    availableStockValue: 4198600.00,
    salesValue: 16959932.57,
    closingStockValue: 3287592.00,
    expectedProfit: 5280581.05,
    salesProfit: 1084668.39,
    undergroundGains: 819.29,
    winFallValue: 11997.72,
    profitMarginVariance: 32435.72,
    profitMarginPercentage: 6.4,
    operationalEfficiencyExpected: 4287278.40,
    operationalEfficiencyAdjusted: 819.29,
    creditSales: 0.00,
    actualVariance: 1.35
  }
};


// Note: Utility functions moved to /utils/dateUtils.ts to avoid duplicate declarations

// Note: generateAvailableMonths moved to shared utilities

// Base monthly report data patterns for different months
const monthlyDataPatterns = {
  'jan-2024': {
    monthInfo: { month: 'JAN', year: '2024', dateRange: '(01 - 31/01/24)' },
    totals: {
      pms: { openingStock: 58400.00, supply: 32000.00, availableStock: 90400.00, salesCost: 245500.11, unitPrice: 17.25 },
      ago: { openingStock: 116400.00, supply: 65400.00, availableStock: 181800.00, salesCost: 589819.18, unitPrice: 18.95 }
    },
    summaryData: {
      openingStockValue: 2502600.00, totalSupplyValue: 1396000.00, availableStockValue: 3898600.00,
      salesValue: 15759932.57, closingStockValue: 3087592.00, expectedProfit: 4980581.05
    }
  },
  'feb-2024': {
    monthInfo: { month: 'FEB', year: '2024', dateRange: '(01 - 29/02/24)' },
    totals: {
      pms: { openingStock: 60400.00, supply: 34000.00, availableStock: 94400.00, salesCost: 255500.11, unitPrice: 17.35 },
      ago: { openingStock: 120400.00, supply: 68400.00, availableStock: 188800.00, salesCost: 609819.18, unitPrice: 19.05 }
    },
    summaryData: {
      openingStockValue: 2602600.00, totalSupplyValue: 1446000.00, availableStockValue: 4048600.00,
      salesValue: 16159932.57, closingStockValue: 3187592.00, expectedProfit: 5180581.05
    }
  },
  'mar-2024': {
    monthInfo: { month: 'MAR', year: '2024', dateRange: '(01 - 31/03/24)' },
    totals: {
      pms: { openingStock: 62400.00, supply: 36000.00, availableStock: 98400.00, salesCost: 270500.11, unitPrice: 17.50 },
      ago: { openingStock: 126400.00, supply: 71400.00, availableStock: 197800.00, salesCost: 629819.18, unitPrice: 19.20 }
    },
    summaryData: {
      openingStockValue: 2702600.00, totalSupplyValue: 1496000.00, availableStockValue: 4198600.00,
      salesValue: 16659932.57, closingStockValue: 3287592.00, expectedProfit: 5380581.05
    }
  },
  'apr-2024': {
    monthInfo: { month: 'APR', year: '2024', dateRange: '(01 - 30/04/24)' },
    totals: {
      pms: { openingStock: 64400.00, supply: 38000.00, availableStock: 102400.00, salesCost: 285500.11, unitPrice: 17.65 },
      ago: { openingStock: 130400.00, supply: 74400.00, availableStock: 204800.00, salesCost: 649819.18, unitPrice: 19.35 }
    },
    summaryData: {
      openingStockValue: 2802600.00, totalSupplyValue: 1546000.00, availableStockValue: 4348600.00,
      salesValue: 17159932.57, closingStockValue: 3387592.00, expectedProfit: 5580581.05
    }
  },
  'may-2024': {
    monthInfo: { month: 'MAY', year: '2024', dateRange: '(01 - 31/05/24)' },
    totals: {
      pms: { openingStock: 66400.00, supply: 40000.00, availableStock: 106400.00, salesCost: 300500.11, unitPrice: 17.80 },
      ago: { openingStock: 134400.00, supply: 77400.00, availableStock: 211800.00, salesCost: 669819.18, unitPrice: 19.50 }
    },
    summaryData: {
      openingStockValue: 2902600.00, totalSupplyValue: 1596000.00, availableStockValue: 4498600.00,
      salesValue: 17659932.57, closingStockValue: 3487592.00, expectedProfit: 5780581.05
    }
  }
};

// Generate stable monthly data based on selected month using deterministic patterns  
const generateStableMonthlyReportData = (selectedMonthData: any) => {
  if (!selectedMonthData) return monthlyReportData; // Fallback to default data
  
  const monthKey = `${selectedMonthData.month.toLowerCase()}-${selectedMonthData.year}`;
  const pattern = monthlyDataPatterns[monthKey as keyof typeof monthlyDataPatterns];
  
  if (!pattern) {
    // Generate deterministic fallback data for months not in our patterns
    return generateDeterministicFallbackData(selectedMonthData);
  }
  
  // Return the specific monthly pattern with calculated values
  return {
    monthInfo: pattern.monthInfo,
    totals: {
      ...monthlyReportData.totals,
      pms: { ...monthlyReportData.totals.pms, ...pattern.totals.pms },
      ago: { ...monthlyReportData.totals.ago, ...pattern.totals.ago }
    },
    summaryData: { ...monthlyReportData.summaryData, ...pattern.summaryData }
  };
};

// Generate deterministic fallback data for months not in patterns using seeded values
const generateDeterministicFallbackData = (selectedMonthData: any) => {
  // Use month and year as seed for consistent data generation
  const seed = selectedMonthData.monthIndex + (selectedMonthData.year * 12);
  const baseMultiplier = 0.9 + ((seed % 20) / 100); // Deterministic ±10% variation
  
  // Deterministic price calculations based on seed
  const pmsPrice = 17.00 + ((seed % 100) / 100); // Price between 17.00-18.00
  const agoPrice = 18.50 + ((seed % 100) / 100); // Price between 18.50-19.50
  
  return {
    monthInfo: {
      month: selectedMonthData.month,
      year: selectedMonthData.year.toString(),
      dateRange: `(01 - ${getDaysInMonth(selectedMonthData.monthIndex, selectedMonthData.year)}/${(selectedMonthData.monthIndex + 1).toString().padStart(2, '0')}/${selectedMonthData.year.toString().slice(-2)})`
    },
    totals: {
      ...monthlyReportData.totals,
      pms: {
        ...monthlyReportData.totals.pms,
        openingStock: monthlyReportData.totals.pms.openingStock * baseMultiplier,
        supply: monthlyReportData.totals.pms.supply * baseMultiplier,
        availableStock: monthlyReportData.totals.pms.availableStock * baseMultiplier,
        salesCost: monthlyReportData.totals.pms.salesCost * baseMultiplier,
        unitPrice: pmsPrice
      },
      ago: {
        ...monthlyReportData.totals.ago,
        openingStock: monthlyReportData.totals.ago.openingStock * baseMultiplier,
        supply: monthlyReportData.totals.ago.supply * baseMultiplier,
        availableStock: monthlyReportData.totals.ago.availableStock * baseMultiplier,
        salesCost: monthlyReportData.totals.ago.salesCost * baseMultiplier,
        unitPrice: agoPrice
      }
    },
    summaryData: {
      ...monthlyReportData.summaryData,
      openingStockValue: monthlyReportData.summaryData.openingStockValue * baseMultiplier,
      totalSupplyValue: monthlyReportData.summaryData.totalSupplyValue * baseMultiplier,
      availableStockValue: monthlyReportData.summaryData.availableStockValue * baseMultiplier,
      salesValue: monthlyReportData.summaryData.salesValue * baseMultiplier,
      closingStockValue: monthlyReportData.summaryData.closingStockValue * baseMultiplier,
      expectedProfit: monthlyReportData.summaryData.expectedProfit * baseMultiplier
    }
  };
};

// Helper function to get days in month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export function EndOfMonthReport() {
  // Hook for backend integration
  const {
    reports,
    isLoading,
    isGenerating,
    error,
    generateReport,
    clearError,
    refreshData,
    comparisonData,
    setComparisonData
  } = useEndOfMonthReport();

  // Get current month and year for defaults
  const currentMonthYear = getCurrentMonthYear();
  const availableMonths = generateAvailableMonths();
  const currentMonthValue = availableMonths.find(m => 
    m.month === currentMonthYear.month && m.year === currentMonthYear.year
  )?.value || availableMonths[0]?.value;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  
  // Get selected month data with memoization
  const selectedMonthData = useMemo(() => 
    availableMonths.find(m => m.value === selectedMonth), 
    [availableMonths, selectedMonth]
  );
  
  // Create a stable key for data caching to prevent rapid changes
  const dataKey = useMemo(() => {
    if (!selectedMonthData) return '';
    return `${selectedMonthData.month}-${selectedMonthData.year}`;
  }, [selectedMonthData]);

  // Handle refresh data
  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('End of month report data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    }
  };

  // Handle generate report for current selection
  const handleGenerateReport = async () => {
    if (!selectedMonthData) {
      toast.error('Please select a valid month');
      return;
    }

    const monthInfo = {
      month: selectedMonthData.month,
      year: selectedMonthData.year,
      monthIndex: selectedMonthData.monthIndex,
      dateRange: `01 - ${getDaysInMonth(selectedMonthData.monthIndex, selectedMonthData.year)}/${(selectedMonthData.monthIndex + 1).toString().padStart(2, '0')}/${selectedMonthData.year.toString().slice(-2)}`,
      totalDays: getDaysInMonth(selectedMonthData.monthIndex, selectedMonthData.year),
      businessDays: Math.floor(getDaysInMonth(selectedMonthData.monthIndex, selectedMonthData.year) * 0.71), // Approx 71% business days
      timePeriod: `${selectedMonthData.month} ${selectedMonthData.year}`
    };

    try {
      const result = await generateReport(monthInfo, 'station-001'); // Default station for demo
      if (result) {
        toast.success('End of month report generated successfully');
      }
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };
  
  // Generate stable monthly report data based on selection using memoization
  const dynamicMonthlyReportData = useMemo(() => {
    if (!selectedMonthData || !dataKey) return monthlyReportData;
    return generateStableMonthlyReportData(selectedMonthData);
  }, [selectedMonthData, dataKey]);
  
  // Generate stable pricing data with memoization
  const monthlyPricingData = useMemo(() => {
    if (!selectedMonthData || !dataKey) return generateMonthlyPricingData(null);
    return generateMonthlyPricingData(selectedMonthData);
  }, [selectedMonthData, dataKey]);

  // Memoized calculation functions to prevent recalculations
  const calculateWeeklyPrice = useCallback((fuelType: 'pms' | 'ago', weekIndex: number) => {
    const basePrice = monthlyPricingData[fuelType].basePrice;
    const adjustment = monthlyPricingData[fuelType].weeklyPeriods[weekIndex]?.priceAdjustment || 0;
    return basePrice + adjustment;
  }, [monthlyPricingData]);

  const calculateWeeklySalesAtUnitPrice = useCallback((fuelType: 'pms' | 'ago', weekIndex: number) => {
    const weekData = monthlyPricingData[fuelType].weeklyPeriods[weekIndex];
    if (!weekData) return 0;
    
    const price = calculateWeeklyPrice(fuelType, weekIndex);
    return weekData.quantity * price;
  }, [monthlyPricingData, calculateWeeklyPrice]);

  const calculateTotalMonthlySalesAtUnitPrice = useCallback((fuelType: 'pms' | 'ago') => {
    return monthlyPricingData[fuelType].weeklyPeriods.reduce((total, _, index) => {
      return total + calculateWeeklySalesAtUnitPrice(fuelType, index);
    }, 0);
  }, [monthlyPricingData, calculateWeeklySalesAtUnitPrice]);

  const getNumberOfWeeklyPeriods = useCallback(() => {
    return monthlyPricingData.pms.weeklyPeriods.length;
  }, [monthlyPricingData]);

  const getWeeklyPeriodData = useCallback((weekIndex: number) => {
    const pmsWeek = monthlyPricingData.pms.weeklyPeriods[weekIndex];
    const agoWeek = monthlyPricingData.ago.weeklyPeriods[weekIndex];
    return {
      pms: pmsWeek,
      ago: agoWeek,
      pmsPrice: calculateWeeklyPrice('pms', weekIndex),
      agoPrice: calculateWeeklyPrice('ago', weekIndex),
      pmsSalesValue: calculateWeeklySalesAtUnitPrice('pms', weekIndex),
      agoSalesValue: calculateWeeklySalesAtUnitPrice('ago', weekIndex)
    };
  }, [monthlyPricingData, calculateWeeklyPrice, calculateWeeklySalesAtUnitPrice]);

  const getAverageMonthlyUnitPrice = useCallback((fuelType: 'pms' | 'ago') => {
    const totalPrice = monthlyPricingData[fuelType].weeklyPeriods.reduce((sum, _, index) => {
      return sum + calculateWeeklyPrice(fuelType, index);
    }, 0);
    return totalPrice / getNumberOfWeeklyPeriods();
  }, [monthlyPricingData, calculateWeeklyPrice, getNumberOfWeeklyPeriods]);

  // Memoized total sales calculations for consistent use across components
  const totalSalesData = useMemo(() => {
    const pmsTotalSales = calculateTotalMonthlySalesAtUnitPrice('pms');
    const agoTotalSales = calculateTotalMonthlySalesAtUnitPrice('ago');
    const totalMonthlySales = pmsTotalSales + agoTotalSales;
    
    return {
      pmsTotalSales,
      agoTotalSales,
      totalMonthlySales
    };
  }, [calculateTotalMonthlySalesAtUnitPrice]);

  const formatCurrency = useCallback((amount: number | string) => {
    if (!amount && amount !== 0) return '';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₵${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const formatNumber = useCallback((value: number | string) => {
    if (!value && value !== 0) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      const { PDFExportService, createExportData } = await import('../utils/pdfExport');
      
      try {
        // Use stable memoized data to ensure consistency
        const currentData = dynamicMonthlyReportData;
        const { pmsTotalSales, agoTotalSales, totalMonthlySales } = totalSalesData;
        
        // Prepare KPI data
        const kpiData = {
          totalSales: totalMonthlySales,
          totalProfit: currentData.summaryData.expectedProfit,
          totalExpenses: currentData.summaryData.totalSupplyValue,
          totalVehicles: Math.round(totalMonthlySales / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: (currentData.summaryData.expectedProfit / totalMonthlySales) * 100,
          growthRate: 12.3,
          operationalEfficiency: 91.8
        };
        
        // Prepare table data
        const tableData = [
          {
            title: 'Monthly Stock and Sales Summary',
            headers: ['Product', 'Opening Stock (L)', 'Supply (L)', 'Available (L)', 'Sales (L)', 'Closing Stock (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              [
                'Petrol (PMS)',
                formatNumber(currentData.totals.pms.openingStock),
                formatNumber(currentData.totals.pms.supply),
                formatNumber(currentData.totals.pms.availableStock),
                formatNumber(currentData.totals.pms.salesCost),
                formatNumber(currentData.totals.pms.closingStock),
                getAverageMonthlyUnitPrice('pms').toFixed(2),
                formatCurrency(pmsTotalSales)
              ],
              [
                'Diesel (AGO)',
                formatNumber(currentData.totals.ago.openingStock),
                formatNumber(currentData.totals.ago.supply),
                formatNumber(currentData.totals.ago.availableStock),
                formatNumber(currentData.totals.ago.salesCost),
                formatNumber(currentData.totals.ago.closingStock),
                getAverageMonthlyUnitPrice('ago').toFixed(2),
                formatCurrency(agoTotalSales)
              ]
            ]
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Total Opening Stock Value', value: currentData.summaryData.openingStockValue },
          { label: 'Total Supply Value', value: currentData.summaryData.totalSupplyValue },
          { label: 'Total Available Stock Value', value: currentData.summaryData.availableStockValue },
          { label: 'Total Sales Value', value: totalMonthlySales },
          { label: 'Total Closing Stock Value', value: currentData.summaryData.closingStockValue },
          { label: 'Expected Profit', value: currentData.summaryData.expectedProfit, subValue: 'for the month' },
          { label: 'Weekly Periods', value: getNumberOfWeeklyPeriods(), subValue: 'pricing periods in month' },
          { label: 'Operating Days', value: getDaysInMonth(selectedMonthData?.monthIndex || 0, selectedMonthData?.year || new Date().getFullYear()), subValue: 'days in month' }
        ];
        
        // Create export data
        const exportData = createExportData(
          'pdf',
          'monthly',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            selectedMonth: selectedMonth 
          }
        );
        
        // Generate PDF
        const pdfService = new PDFExportService();
        pdfService.generatePDF(exportData);
        
        console.log('End of Month PDF exported successfully');
        
      } catch (error) {
        console.error('Error exporting End of Month PDF:', error);
      }
    } else if (format === 'excel') {
      const { ExcelExportService, createExcelExportData } = await import('../utils/excelExport');
      
      try {
        // Use stable memoized data to ensure consistency
        const currentData = dynamicMonthlyReportData;
        const { pmsTotalSales, agoTotalSales, totalMonthlySales } = totalSalesData;
        
        // Prepare KPI data
        const kpiData = {
          totalSales: totalMonthlySales,
          totalProfit: currentData.summaryData.expectedProfit,
          totalExpenses: currentData.summaryData.totalSupplyValue,
          totalVehicles: Math.round(totalMonthlySales / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: (currentData.summaryData.expectedProfit / totalMonthlySales) * 100,
          growthRate: 12.3,
          operationalEfficiency: 91.8
        };
        
        // Prepare table data
        const tableData = [
          {
            title: 'Monthly Stock and Sales Summary',
            headers: ['Product', 'Opening Stock (L)', 'Supply (L)', 'Available (L)', 'Sales (L)', 'Closing Stock (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              [
                'Petrol (PMS)',
                formatNumber(currentData.totals.pms.openingStock),
                formatNumber(currentData.totals.pms.supply),
                formatNumber(currentData.totals.pms.availableStock),
                formatNumber(currentData.totals.pms.salesCost),
                formatNumber(currentData.totals.pms.closingStock),
                getAverageMonthlyUnitPrice('pms').toFixed(2),
                pmsTotalSales.toFixed(2)
              ],
              [
                'Diesel (AGO)',
                formatNumber(currentData.totals.ago.openingStock),
                formatNumber(currentData.totals.ago.supply),
                formatNumber(currentData.totals.ago.availableStock),
                formatNumber(currentData.totals.ago.salesCost),
                formatNumber(currentData.totals.ago.closingStock),
                getAverageMonthlyUnitPrice('ago').toFixed(2),
                agoTotalSales.toFixed(2)
              ]
            ]
          },
          {
            title: 'Weekly Breakdown',
            headers: ['Week', 'Product', 'Quantity (L)', 'Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              ...Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => [
                [`Week ${index + 1}`, 'PMS', formatNumber(currentData.totals.pms.salesCost / getNumberOfWeeklyPeriods()), calculateWeeklyPrice('pms', index).toFixed(2), calculateWeeklySalesAtUnitPrice('pms', index).toFixed(2)],
                [`Week ${index + 1}`, 'AGO', formatNumber(currentData.totals.ago.salesCost / getNumberOfWeeklyPeriods()), calculateWeeklyPrice('ago', index).toFixed(2), calculateWeeklySalesAtUnitPrice('ago', index).toFixed(2)]
              ]).flat()
            ]
          },
          {
            title: 'Monthly Financial Summary',
            headers: ['Category', 'Amount (₵)', 'Percentage', 'Notes'],
            rows: [
              ['Opening Stock Value', formatCurrency(currentData.summaryData.openingStockValue), ((currentData.summaryData.openingStockValue / totalMonthlySales) * 100).toFixed(1) + '%', 'Beginning of month inventory'],
              ['Supply Value', formatCurrency(currentData.summaryData.totalSupplyValue), ((currentData.summaryData.totalSupplyValue / totalMonthlySales) * 100).toFixed(1) + '%', 'Monthly procurement cost'],
              ['Sales Value', formatCurrency(totalMonthlySales), '100.0%', 'Total monthly revenue'],
              ['Expected Profit', formatCurrency(currentData.summaryData.expectedProfit), ((currentData.summaryData.expectedProfit / totalMonthlySales) * 100).toFixed(1) + '%', 'Projected monthly profit'],
              ['Closing Stock Value', formatCurrency(currentData.summaryData.closingStockValue), ((currentData.summaryData.closingStockValue / totalMonthlySales) * 100).toFixed(1) + '%', 'End of month inventory']
            ]
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Total Opening Stock Value', value: currentData.summaryData.openingStockValue },
          { label: 'Total Supply Value', value: currentData.summaryData.totalSupplyValue },
          { label: 'Total Available Stock Value', value: currentData.summaryData.availableStockValue },
          { label: 'Total Sales Value', value: totalMonthlySales },
          { label: 'Total Closing Stock Value', value: currentData.summaryData.closingStockValue },
          { label: 'Expected Profit', value: currentData.summaryData.expectedProfit, subValue: 'for the month' },
          { label: 'Weekly Periods', value: getNumberOfWeeklyPeriods(), subValue: 'pricing periods in month' },
          { label: 'Operating Days', value: getDaysInMonth(selectedMonthData?.monthIndex || 0, selectedMonthData?.year || new Date().getFullYear()), subValue: 'days in month' },
          { label: 'PMS Monthly Sales', value: pmsTotalSales, subValue: 'liters sold' },
          { label: 'AGO Monthly Sales', value: agoTotalSales, subValue: 'liters sold' }
        ];

        // Prepare chart data
        const chartData = [
          { Product: 'PMS', 'Opening Stock': currentData.totals.pms.openingStock, 'Supply': currentData.totals.pms.supply, 'Sales': currentData.totals.pms.salesCost, 'Closing Stock': currentData.totals.pms.closingStock, 'Sales Value': pmsTotalSales },
          { Product: 'AGO', 'Opening Stock': currentData.totals.ago.openingStock, 'Supply': currentData.totals.ago.supply, 'Sales': currentData.totals.ago.salesCost, 'Closing Stock': currentData.totals.ago.closingStock, 'Sales Value': agoTotalSales }
        ];
        
        // Create export data
        const exportData = createExcelExportData(
          'excel',
          'monthly',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            chartData,
            selectedMonth: selectedMonth 
          }
        );
        
        // Generate Excel with charts
        const excelService = new ExcelExportService();
        excelService.generateExcelWithCharts(exportData);
        
        console.log('End of Month Excel exported successfully');
        
      } catch (error) {
        console.error('Error exporting End of Month Excel:', error);
      }
    } else if (format === 'print') {
      const { printCurrentReport } = await import('../utils/simplePrint');
      
      try {
        // Use simple print service for better compatibility
        printCurrentReport();
        console.log('End of Month print initiated successfully');
        
      } catch (error) {
        console.error('Error opening End of Month print dialog:', error);
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
          <h1 className="text-xl sm:text-2xl font-medium">
            {dynamicMonthlyReportData.monthInfo.month} {dynamicMonthlyReportData.monthInfo.year} {dynamicMonthlyReportData.monthInfo.dateRange}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Accra Central Station - Monthly Operations Report</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
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
          reportType="monthly" 
          reportData={useMemo(() => ({
            totalSales: totalSalesData.totalMonthlySales,
            totalProfit: dynamicMonthlyReportData.summaryData.expectedProfit,
            totalExpenses: dynamicMonthlyReportData.summaryData.totalSupplyValue,
            totalVehicles: Math.round(totalSalesData.totalMonthlySales / 350),
            avgTransactionValue: 350,
            profitMargin: (dynamicMonthlyReportData.summaryData.expectedProfit / totalSalesData.totalMonthlySales) * 100,
            growthRate: 12.3,
            operationalEfficiency: 91.8
          }), [totalSalesData, dynamicMonthlyReportData])}
        >
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </ShareModal>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Month Selection Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Selected Period: {dynamicMonthlyReportData.monthInfo.month} {dynamicMonthlyReportData.monthInfo.year}</p>
                  <p className="text-xs text-muted-foreground">Date Range: {dynamicMonthlyReportData.monthInfo.dateRange}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                Monthly Report - {getNumberOfWeeklyPeriods()} weeks
              </Badge>
              {(() => {
                const isCurrentMonth = selectedMonthData?.month === currentMonthYear.month && 
                                     selectedMonthData?.year === currentMonthYear.year;
                return isCurrentMonth ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">Current Month</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">End of Month</Badge>
                );
              })()}
              <div className="text-xs text-muted-foreground">
                Cumulative: {getDaysInMonth(selectedMonthData?.monthIndex || 0, selectedMonthData?.year || new Date().getFullYear())} days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSalesData.totalMonthlySales)}
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">
              Based on {getNumberOfWeeklyPeriods()} weeks
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PMS Monthly Sales @ Unit Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalesData.pmsTotalSales)}</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Avg Price: ₵{getAverageMonthlyUnitPrice('pms').toFixed(2)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AGO Monthly Sales @ Unit Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalSalesData.agoTotalSales)}</div>
            <Badge className="mt-2 bg-purple-100 text-purple-800">Avg Price: ₵{getAverageMonthlyUnitPrice('ago').toFixed(2)}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Header Section */}
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold text-center border border-gray-300" colSpan={2}>
                    {dynamicMonthlyReportData.monthInfo.month} {dynamicMonthlyReportData.monthInfo.year} {dynamicMonthlyReportData.monthInfo.dateRange}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Main Data Section */}
                <TableRow>
                  <TableCell className="p-0 border-none" colSpan={2}>
                    <Table className="border-collapse">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-50 text-xs sm:text-sm min-w-24">
                            TOTALS
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-100 text-xs sm:text-sm min-w-28">
                            OPENING STOCK
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-100 text-xs sm:text-sm min-w-24">
                            SUPPLY
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-100 text-xs sm:text-sm min-w-28">
                            AVAILABLE STOCK
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-yellow-200 text-xs sm:text-sm min-w-28">
                            SALES @ COST
                          </TableHead>
                          {/* Dynamic SALES @ UNIT PRICE columns based on weekly periods */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekData = getWeeklyPeriodData(index);
                            return (
                              <TableHead 
                                key={`sales-unit-price-${index}`}
                                className="border border-gray-300 text-center font-bold bg-yellow-200 text-xs sm:text-sm min-w-32"
                              >
                                SALES @ UNIT PRICE ({weekData.pms.period})
                              </TableHead>
                            );
                          })}
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-100 text-xs sm:text-sm min-w-32">
                            CLOSING STOCK PER METRE
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-gray-100 text-xs sm:text-sm min-w-32">
                            CLOSING DISPENSING
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-blue-200 text-xs sm:text-sm min-w-36">
                            UNDERGROUND GAINS/(LOSS)
                          </TableHead>
                          <TableHead className="border border-gray-300 text-center font-bold bg-red-200 text-xs sm:text-sm min-w-36">
                            PUMP GAINS FROM SALES
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* PMS Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">PMS</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.supply)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.salesCost)}</TableCell>
                          {/* Dynamic SALES @ UNIT PRICE columns for PMS */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekData = getWeeklyPeriodData(index);
                            return (
                              <TableCell 
                                key={`pms-week-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm font-medium"
                              >
                                {formatCurrency(weekData.pmsSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.closingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.closingDispensing)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.pms.pumpGains)}</TableCell>
                        </TableRow>
                        
                        {/* AGO Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">AGO</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.supply)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.salesCost)}</TableCell>
                          {/* Dynamic SALES @ UNIT PRICE columns for AGO */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekData = getWeeklyPeriodData(index);
                            return (
                              <TableCell 
                                key={`ago-week-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm font-medium"
                              >
                                {formatCurrency(weekData.agoSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.closingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.closingDispensing)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(dynamicMonthlyReportData.totals.ago.pumpGains)}</TableCell>
                        </TableRow>

                        {/* Rate Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">Rate ₵</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.rate.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.rate.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.rate.salesCost)}</TableCell>
                          {/* Dynamic rate columns */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => (
                            <TableCell 
                              key={`rate-week-${index}`}
                              className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm"
                            >
                              -
                            </TableCell>
                          ))}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">-</TableCell>
                        </TableRow>

                        {/* PMS Value Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">PMS Value</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.pms_value.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.pms_value.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.pms_value.salesCost)}</TableCell>
                          {/* Dynamic PMS Value columns */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekSalesValue = calculateWeeklySalesAtUnitPrice('pms', index);
                            return (
                              <TableCell 
                                key={`pms-value-week-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm"
                              >
                                {formatCurrency(weekSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.pms_value.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.pms_value.pumpGains)}</TableCell>
                        </TableRow>

                        {/* AGO Value Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">AGO Value</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.ago_value.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.ago_value.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.ago_value.salesCost)}</TableCell>
                          {/* Dynamic AGO Value columns */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekSalesValue = calculateWeeklySalesAtUnitPrice('ago', index);
                            return (
                              <TableCell 
                                key={`ago-value-week-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm"
                              >
                                {formatCurrency(weekSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.ago_value.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.ago_value.pumpGains)}</TableCell>
                        </TableRow>

                        {/* Total Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">TOTAL</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.total.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.total.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 font-bold text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.total.salesCost)}</TableCell>
                          {/* Dynamic Total columns */}
                          {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                            const weekData = getWeeklyPeriodData(index);
                            const totalWeekSales = weekData.pmsSalesValue + weekData.agoSalesValue;
                            return (
                              <TableCell 
                                key={`total-week-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 font-bold text-xs sm:text-sm"
                              >
                                {formatCurrency(totalWeekSales)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 font-bold text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.total.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 font-bold text-xs sm:text-sm">{formatNumber(monthlyReportData.totals.total.pumpGains)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Monthly Summary Table (Same as Weekly but Monthly Data) */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="mt-4">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-xs min-w-48">DESCRIPTION</TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-32">OPENING STOCK VALUE (PMS+AGO)</TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-32">TOTAL SUPPLY VALUE</TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-32">AVAILABLE STOCK VALUE</TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-32">SALES VALUE (PMS+AGO)</TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs min-w-32">CLOSING STOCK VALUE (PMS+AGO)</TableHead>
                    <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs min-w-36">EXPECTED PROFIT</TableHead>
                    <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs min-w-24">CURRENT PROFIT</TableHead>
                    <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs min-w-36">UNDERGROUND GAINS/(LOSS)</TableHead>
                    <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs min-w-32">WIN/FALL VALUE</TableHead>
                    <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs min-w-24">SHORT-FALL</TableHead>
                    <TableHead className="border border-gray-300 bg-purple-200 font-bold text-center text-xs min-w-24">VARIANCES</TableHead>
                    <TableHead className="border border-gray-300 bg-purple-200 font-bold text-center text-xs min-w-24">MARGINS</TableHead>
                    <TableHead className="border border-gray-300 bg-orange-200 font-bold text-center text-xs min-w-32">UNDERGROUND EXPECTED</TableHead>
                    <TableHead className="border border-gray-300 bg-orange-200 font-bold text-center text-xs min-w-32">ADJUSTED GAINS/(LOSS)</TableHead>
                    <TableHead className="border border-gray-300 bg-pink-200 font-bold text-center text-xs min-w-24">CREDIT SALES</TableHead>
                    <TableHead className="border border-gray-300 bg-pink-200 font-bold text-center text-xs min-w-24">ACTUAL VARIANCE</TableHead>
                    <TableHead className="border border-gray-300 bg-yellow-200 font-bold text-center text-xs min-w-32">CLOSING STATEMENT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* OPENING STOCK VALUE (PMS+AGO) */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">OPENING STOCK VALUE (PMS+AGO)</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.openingStockValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* TOTAL SUPPLY VALUE */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">TOTAL SUPPLY VALUE</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.totalSupplyValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* AVAILABLE STOCK VALUE */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">AVAILABLE STOCK VALUE</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.availableStockValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* SALES VALUE */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">SALES VALUE</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.salesValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* CLOSING STOCK VALUE (PMS+AGO) */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">CLOSING STOCK VALUE (PMS+AGO)</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.closingStockValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* EXPECTED PROFIT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">EXPECTED PROFIT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.expectedProfit)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* CURRENT PROFIT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">CURRENT PROFIT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-medium">{formatCurrency(dynamicMonthlyReportData.summaryData.salesProfit)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* UNDERGROUND GAINS/(LOSS) */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">UNDERGROUND GAINS/(LOSS)</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-medium">{formatCurrency(monthlyReportData.summaryData.undergroundGains)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* WIN/SHORT-FALL */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">WIN/SHORT-FALL</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-medium bg-red-300">{formatCurrency(monthlyReportData.summaryData.winFallValue)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* ADVANCES */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">ADVANCES</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(50000.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* CREDITS */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">CREDITS</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(34000.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* MOMO/SHORTAGE */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">MOMO/SHORTAGE</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs font-medium">{formatCurrency(1282.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* MOMO/SHORTAGE PAYMENT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">MOMO/SHORTAGE PAYMENT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs font-medium">{formatCurrency(1282.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* ADVANCES PAYMENT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">ADVANCES PAYMENT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs font-medium">{formatCurrency(50000.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* CREDITS PAYMENT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">CREDITS PAYMENT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs font-medium">{formatCurrency(34000.00)}</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs">-</TableCell>
                  </TableRow>

                  {/* EXPECTED LODGEMENT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">EXPECTED LODGEMENT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(1796220.00)}</TableCell>
                  </TableRow>

                  {/* ACTUAL LODGEMENT */}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium text-xs">ACTUAL LODGEMENT</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs">-</TableCell>
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(1791940.00)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Pricing Periods Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Weekly price calculations and monthly cumulative sales analysis</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold text-xs">Week</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs">Date Range</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs">PMS Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs">PMS Quantity (L)</TableHead>
                  <TableHead className="border border-gray-300 bg-yellow-200 font-bold text-center text-xs">PMS Sales @ Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs">AGO Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs">AGO Quantity (L)</TableHead>
                  <TableHead className="border border-gray-300 bg-purple-200 font-bold text-center text-xs">AGO Sales @ Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs">Weekly Total (₵)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: getNumberOfWeeklyPeriods() }, (_, index) => {
                  const weekData = getWeeklyPeriodData(index);
                  const weekTotal = weekData.pmsSalesValue + weekData.agoSalesValue;

                  return (
                    <TableRow key={index}>
                      <TableCell className="border border-gray-300 font-medium text-xs">{weekData.pms.period}</TableCell>
                      <TableCell className="border border-gray-300 text-center text-xs">{weekData.pms.dateRange}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">{formatNumber(weekData.pmsPrice)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">{formatNumber(weekData.pms.quantity)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(weekData.pmsSalesValue)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">{formatNumber(weekData.agoPrice)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">{formatNumber(weekData.ago.quantity)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(weekData.agoSalesValue)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">{formatCurrency(weekTotal)}</TableCell>
                    </TableRow>
                  );
                })}
                {/* Monthly Totals Row */}
                <TableRow className="bg-gray-200">
                  <TableCell className="border border-gray-300 font-bold text-xs">MONTHLY TOTALS</TableCell>
                  <TableCell className="border border-gray-300 text-center text-xs font-bold">All Weeks</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    ₵{(monthlyPricingData.pms.weeklyPeriods.reduce((sum, period, index) => 
                      sum + calculateWeeklyPrice('pms', index), 0) / getNumberOfWeeklyPeriods()).toFixed(2)} (Avg)
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    {formatNumber(monthlyPricingData.pms.weeklyPeriods.reduce((sum, period) => sum + period.quantity, 0))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-bold">
                    {formatCurrency(calculateTotalMonthlySalesAtUnitPrice('pms'))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-bold">
                    ₵{(monthlyPricingData.ago.weeklyPeriods.reduce((sum, period, index) => 
                      sum + calculateWeeklyPrice('ago', index), 0) / getNumberOfWeeklyPeriods()).toFixed(2)} (Avg)
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-bold">
                    {formatNumber(monthlyPricingData.ago.weeklyPeriods.reduce((sum, period) => sum + period.quantity, 0))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-bold">
                    {formatCurrency(calculateTotalMonthlySalesAtUnitPrice('ago'))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">
                    {formatCurrency(calculateTotalMonthlySalesAtUnitPrice('pms') + calculateTotalMonthlySalesAtUnitPrice('ago'))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Monthly Pricing Explanation */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Monthly Pricing Periods Logic</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">PMS Monthly Pricing:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Base Price: ₵{monthlyPricingData.pms.basePrice}</li>
                  <li>Weekly periods: {getNumberOfWeeklyPeriods()}</li>
                  <li>Price progression: ₵0.00 - ₵0.15</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">AGO Monthly Pricing:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Base Price: ₵{monthlyPricingData.ago.basePrice}</li>
                  <li>Weekly periods: {getNumberOfWeeklyPeriods()}</li>
                  <li>Price progression: ₵0.00 - ₵0.24</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Formula:</strong> Weekly Sales @ Unit Price = Weekly Quantity × (Base Price + Weekly Adjustment)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              <strong>Monthly Total:</strong> Sum of all {getNumberOfWeeklyPeriods()} weekly sales @ unit price calculations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report System Information</CardTitle>
          <p className="text-sm text-muted-foreground">JSON-based configuration with monthly aggregation</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Monthly Aggregation Configuration</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                <pre>{JSON.stringify({
                  selectedMonth: dynamicMonthlyReportData.monthInfo.month,
                  selectedYear: dynamicMonthlyReportData.monthInfo.year,
                  totalWeeks: getNumberOfWeeklyPeriods(),
                  dateRange: dynamicMonthlyReportData.monthInfo.dateRange,
                  totalSales: formatCurrency(calculateTotalMonthlySalesAtUnitPrice('pms') + calculateTotalMonthlySalesAtUnitPrice('ago')),
                  avgPMSPrice: getAverageMonthlyUnitPrice('pms').toFixed(2),
                  avgAGOPrice: getAverageMonthlyUnitPrice('ago').toFixed(2),
                  isCurrentMonth: selectedMonthData?.month === currentMonthYear.month && selectedMonthData?.year === currentMonthYear.year
                }, null, 2)}</pre>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Monthly Report Features</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Monthly Aggregation:</strong> Cumulative data from {getNumberOfWeeklyPeriods()} weeks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Weekly Periods:</strong> {getNumberOfWeeklyPeriods()} SALES @ UNIT PRICE columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Price Progression:</strong> Weekly price adjustments throughout month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Financial Analysis:</strong> 18-column comprehensive breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Monthly Totals:</strong> Complete end-of-month position</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}