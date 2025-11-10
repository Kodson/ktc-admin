import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { ShareModal } from './ShareModal';
import { 
  FileText,
  Download,
  Calendar,
  Printer,
  Mail,
  Share2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { 
  getCurrentWeekOfMonth,
  getCurrentMonthYear,
  generateAvailableMonths,
  generateWeeksForMonth,
  generateWeeksUpToCurrent,
  getWeekDateRange,
  formatCurrency,
  formatNumber
} from '../utils/dateUtils';



// Note: Utility functions moved to /utils/dateUtils.ts to avoid duplicate declarations

export function WeeklyReport() {
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
  const getDefaultWeek = () => {
    if (selectedMonthData?.month === currentMonthYear.month && selectedMonthData?.year === currentMonthYear.year) {
      return availableWeeks[availableWeeks.length - 1]?.value; // Current week
    }
    return availableWeeks[availableWeeks.length - 1]?.value; // Last week of selected month
  };
  
  const [selectedWeek, setSelectedWeek] = useState(getDefaultWeek() || 'current');
  
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

  // Dynamic pricing data structure - creates columns based on number of price changes
const pricingPeriodsData = {
  pms: {
    basePrice: 17.50,
    priceChanges: [
      {
        period: "Period 1",
        dateRange: "Mon-Tue",
        priceAdjustment: 0.00,  // 17.50
        quantity: 15912.81,     // Combined Mon+Tue quantities
        salesValue: 0           // Will be calculated
      },
      {
        period: "Period 2", 
        dateRange: "Wed-Thu",
        priceAdjustment: 0.10,  // 17.60
        quantity: 16433.90,     // Combined Wed+Thu quantities
        salesValue: 0           // Will be calculated
      },
      {
        period: "Period 3",
        dateRange: "Fri-Sun", 
        priceAdjustment: 0.25,  // 17.75
        quantity: 27234.57,     // Combined Fri+Sat+Sun quantities
        salesValue: 0           // Will be calculated
      }
    ]
  },
  ago: {
    basePrice: 19.20,
    priceChanges: [
      {
        period: "Period 1",
        dateRange: "Mon-Tue", 
        priceAdjustment: 0.00,  // 19.20
        quantity: 37282.97,     // Combined Mon+Tue quantities
        salesValue: 0           // Will be calculated
      },
      {
        period: "Period 2",
        dateRange: "Wed-Thu",
        priceAdjustment: 0.20,  // 19.40
        quantity: 38691.34,     // Combined Wed+Thu quantities  
        salesValue: 0           // Will be calculated
      },
      {
        period: "Period 3",
        dateRange: "Fri-Sun",
        priceAdjustment: 0.40,  // 19.60
        quantity: 64122.33,     // Combined Fri+Sat+Sun quantities
        salesValue: 0           // Will be calculated
      }
    ]
  }
};

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

  // Get week-specific data variation (for demonstration)
  const getWeekSpecificMultiplier = () => {
    const selectedWeekData = availableWeeks.find(week => week.value === selectedWeek);
    const weekNumber = selectedWeekData?.weekNumber || getCurrentWeekOfMonth();
    
    // Create some variation between weeks (90% to 110% of base values)
    const baseMultiplier = 0.9 + (weekNumber * 0.05);
    return Math.min(baseMultiplier, 1.1);
  };

  const currentWeekInfo = getCurrentWeekInfo();

// Weekly report data structure matching the exact format from the image
const weeklyReportData = {
  weekInfo: {
    month: currentWeekInfo.month,
    week: currentWeekInfo.week,
    dateRange: currentWeekInfo.dateRange
  },
  
  // Main totals section
  totals: {
    pms: {
      openingStock: 15400.00,
      supply: 9000.00,
      availableStock: 24400.00,
      salesCost: 7662.36,
      salesUnitPrice: 134596.28,
      unitPrice: 615.38,
      closingStock: 16797.64,
      closingDispensing: 16840.00,
      undergroundGains: 42.36,
      pumpGains: 19.01
    },
    ago: {
      openingStock: 31600.00,
      supply: 17850.00,
      availableStock: 51450.00,
      salesCost: 18047.41,
      salesUnitPrice: 315829.18,
      unitPrice: 845.18,
      closingStock: 31402.59,
      closingDispensing: 31500.00,
      undergroundGains: 97.41,
      pumpGains: 26.60
    },
    rate: {
      openingStock: 13.70,
      supply: 0,
      availableStock: 13.70,
      salesCost: 14990,
      salesUnitPrice: 14990,
      closingStock: 0,
      closingDispensing: 0,
      undergroundGains: 0,
      pumpGains: 0
    },
    pms_value: {
      openingStock: 214850.00,
      supply: 0,
      availableStock: 106095.00,
      salesCost: 102771.90,
      salesUnitPrice: 9070.70,
      closingStock: 0,
      closingDispensing: 0,
      undergroundGains: 254431.40,
      pumpGains: 634.98
    },
    ago_value: {
      openingStock: 460320.00,
      supply: 0,
      availableStock: 147823.19,
      salesCost: 156271.90,
      salesUnitPrice: 9070.70,
      closingStock: 0,
      closingDispensing: 0,
      undergroundGains: 817388.20,
      pumpGains: 2344.80
    },
    total: {
      openingStock: 675170.00,
      supply: 0,
      availableStock: 253918.19,
      salesCost: 259043.80,
      salesUnitPrice: 18141.40,
      closingStock: 0,
      closingDispensing: 0,
      undergroundGains: 1071819.60,
      pumpGains: 2979.78
    }
  },

  // Summary data for calculations
  summaryData: {
    openingStockValue: 675150.00,
    totalSupplyValue: 373950.00,
    availableStockValue: 1049100.00,
    salesValue: 450425.46,
    closingStockValue: 869719.80,
    expectedProfit: 1320145.26,
    salesProfit: 271045.26,
    undergroundGains: 139.77,
    winFallValue: 2999.18,
    profitMarginVariance: 8108.93,
    profitMarginPercentage: 1.8,
    operationalEfficiencyExpected: 1071819.60,
    operationalEfficiencyAdjusted: 140.12,
    creditSales: 0.00,
    actualVariance: 0.35
  },

  // Dynamic calculations
  getDynamicSalesValue: function() {
    const pmsTotalSales = pricingPeriodsData.pms.priceChanges.reduce((total, period, index) => {
      const price = pricingPeriodsData.pms.basePrice + period.priceAdjustment;
      return total + (period.quantity * price);
    }, 0);

    const agoTotalSales = pricingPeriodsData.ago.priceChanges.reduce((total, period, index) => {
      const price = pricingPeriodsData.ago.basePrice + period.priceAdjustment;
      return total + (period.quantity * price);
    }, 0);

    return pmsTotalSales + agoTotalSales;
  }
};
  
  // Update selected week when available weeks change
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.find(w => w.value === selectedWeek)) {
      // If current selected week is not available in new weeks, select default
      setSelectedWeek(getDefaultWeek() || availableWeeks[0]?.value);
    }
  }, [availableWeeks, selectedWeek]);

  // Calculate dynamic pricing based on period
  const calculatePeriodPrice = (fuelType: 'pms' | 'ago', periodIndex: number) => {
    const basePrice = pricingPeriodsData[fuelType].basePrice;
    const adjustment = pricingPeriodsData[fuelType].priceChanges[periodIndex]?.priceAdjustment || 0;
    return basePrice + adjustment;
  };

  // Calculate sales @ unit price for a specific period
  const calculatePeriodSalesAtUnitPrice = (fuelType: 'pms' | 'ago', periodIndex: number) => {
    const periodData = pricingPeriodsData[fuelType].priceChanges[periodIndex];
    if (!periodData) return 0;
    
    const price = calculatePeriodPrice(fuelType, periodIndex);
    const multiplier = getWeekSpecificMultiplier();
    return periodData.quantity * price * multiplier;
  };

  // Calculate total sales @ unit price across all periods
  const calculateTotalSalesAtUnitPrice = (fuelType: 'pms' | 'ago') => {
    return pricingPeriodsData[fuelType].priceChanges.reduce((total, _, index) => {
      return total + calculatePeriodSalesAtUnitPrice(fuelType, index);
    }, 0);
  };

  // Get number of price change periods
  const getNumberOfPricePeriods = () => {
    return pricingPeriodsData.pms.priceChanges.length; // Assuming PMS and AGO have same number of periods
  };

  // Get period data for display
  const getPeriodData = (periodIndex: number) => {
    const pmsPeriod = pricingPeriodsData.pms.priceChanges[periodIndex];
    const agoPeriod = pricingPeriodsData.ago.priceChanges[periodIndex];
    return {
      pms: pmsPeriod,
      ago: agoPeriod,
      pmsPrice: calculatePeriodPrice('pms', periodIndex),
      agoPrice: calculatePeriodPrice('ago', periodIndex),
      pmsSalesValue: calculatePeriodSalesAtUnitPrice('pms', periodIndex),
      agoSalesValue: calculatePeriodSalesAtUnitPrice('ago', periodIndex)
    };
  };

  // Get average unit price across all periods
  const getAverageUnitPrice = (fuelType: 'pms' | 'ago') => {
    const totalPrice = pricingPeriodsData[fuelType].priceChanges.reduce((sum, _, index) => {
      return sum + calculatePeriodPrice(fuelType, index);
    }, 0);
    return totalPrice / getNumberOfPricePeriods();
  };

  // Format functions moved to shared utilities

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      const { PDFExportService, createExportData } = await import('../utils/pdfExport');
      
      try {
        // Calculate dynamic sales values
        const totalPmsSales = calculateTotalSalesAtUnitPrice('pms');
        const totalAgoSales = calculateTotalSalesAtUnitPrice('ago');
        const totalSalesValue = totalPmsSales + totalAgoSales;
        
        // Prepare KPI data using existing calculations
        const kpiData = {
          totalSales: totalSalesValue,
          totalProfit: weeklyReportData.summaryData.expectedProfit,
          totalExpenses: weeklyReportData.summaryData.totalSupplyValue,
          totalVehicles: Math.round(totalSalesValue / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: (weeklyReportData.summaryData.expectedProfit / totalSalesValue) * 100,
          growthRate: 8.5,
          operationalEfficiency: 94.2
        };
        
        // Prepare table data - weekly operations breakdown
        const tableData = [
          {
            title: 'Weekly Stock and Sales Summary',
            headers: ['Product', 'Opening Stock (L)', 'Supply (L)', 'Available (L)', 'Sales (L)', 'Closing Stock (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              [
                'Petrol (PMS)',
                formatNumber(weeklyReportData.totals.pms.openingStock),
                formatNumber(weeklyReportData.totals.pms.supply),
                formatNumber(weeklyReportData.totals.pms.availableStock),
                formatNumber(weeklyReportData.totals.pms.salesCost),
                formatNumber(weeklyReportData.totals.pms.closingStock),
                getAverageUnitPrice('pms').toFixed(2),
                formatCurrency(totalPmsSales)
              ],
              [
                'Diesel (AGO)',
                formatNumber(weeklyReportData.totals.ago.openingStock),
                formatNumber(weeklyReportData.totals.ago.supply),
                formatNumber(weeklyReportData.totals.ago.availableStock),
                formatNumber(weeklyReportData.totals.ago.salesCost),
                formatNumber(weeklyReportData.totals.ago.closingStock),
                getAverageUnitPrice('ago').toFixed(2),
                formatCurrency(totalAgoSales)
              ]
            ]
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Total Opening Stock Value', value: weeklyReportData.summaryData.openingStockValue },
          { label: 'Total Supply Value', value: weeklyReportData.summaryData.totalSupplyValue },
          { label: 'Total Available Stock Value', value: weeklyReportData.summaryData.availableStockValue },
          { label: 'Total Sales Value', value: totalSalesValue },
          { label: 'Total Closing Stock Value', value: weeklyReportData.summaryData.closingStockValue },
          { label: 'Expected Profit', value: weeklyReportData.summaryData.expectedProfit, subValue: 'for the week' },
          { label: 'Price Periods', value: getNumberOfPricePeriods(), subValue: 'pricing changes during week' }
        ];
        
        // Create export data
        const exportData = createExportData(
          'pdf',
          'weekly-operations',
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
        
        console.log('Weekly Operations PDF exported successfully');
        
      } catch (error) {
        console.error('Error exporting Weekly Operations PDF:', error);
      }
    } else if (format === 'excel') {
      const { ExcelExportService, createExcelExportData } = await import('../utils/excelExport');
      
      try {
        // Calculate dynamic sales values
        const totalPmsSales = calculateTotalSalesAtUnitPrice('pms');
        const totalAgoSales = calculateTotalSalesAtUnitPrice('ago');
        const totalSalesValue = totalPmsSales + totalAgoSales;
        
        // Prepare KPI data using existing calculations
        const kpiData = {
          totalSales: totalSalesValue,
          totalProfit: weeklyReportData.summaryData.expectedProfit,
          totalExpenses: weeklyReportData.summaryData.totalSupplyValue,
          totalVehicles: Math.round(totalSalesValue / 350), // Estimated vehicles
          avgTransactionValue: 350,
          profitMargin: (weeklyReportData.summaryData.expectedProfit / totalSalesValue) * 100,
          growthRate: 8.5,
          operationalEfficiency: 94.2
        };
        
        // Prepare table data - weekly operations breakdown
        const tableData = [
          {
            title: 'Weekly Stock and Sales Summary',
            headers: ['Product', 'Opening Stock (L)', 'Supply (L)', 'Available (L)', 'Sales (L)', 'Closing Stock (L)', 'Avg Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              [
                'Petrol (PMS)',
                formatNumber(weeklyReportData.totals.pms.openingStock),
                formatNumber(weeklyReportData.totals.pms.supply),
                formatNumber(weeklyReportData.totals.pms.availableStock),
                formatNumber(weeklyReportData.totals.pms.salesCost),
                formatNumber(weeklyReportData.totals.pms.closingStock),
                getAverageUnitPrice('pms').toFixed(2),
                totalPmsSales.toFixed(2)
              ],
              [
                'Diesel (AGO)',
                formatNumber(weeklyReportData.totals.ago.openingStock),
                formatNumber(weeklyReportData.totals.ago.supply),
                formatNumber(weeklyReportData.totals.ago.availableStock),
                formatNumber(weeklyReportData.totals.ago.salesCost),
                formatNumber(weeklyReportData.totals.ago.closingStock),
                getAverageUnitPrice('ago').toFixed(2),
                totalAgoSales.toFixed(2)
              ]
            ]
          },
          {
            title: 'Price Periods Breakdown',
            headers: ['Period', 'Product', 'Quantity (L)', 'Unit Price (₵)', 'Sales Value (₵)'],
            rows: [
              ...Array.from({ length: getNumberOfPricePeriods() }, (_, index) => [
                [`Period ${index + 1}`, 'PMS', formatNumber(pricingPeriodsData.pms.priceChanges[index]?.quantity || 0), calculatePeriodPrice('pms', index).toFixed(2), calculatePeriodSalesAtUnitPrice('pms', index).toFixed(2)],
                [`Period ${index + 1}`, 'AGO', formatNumber(pricingPeriodsData.ago.priceChanges[index]?.quantity || 0), calculatePeriodPrice('ago', index).toFixed(2), calculatePeriodSalesAtUnitPrice('ago', index).toFixed(2)]
              ]).flat()
            ]
          }
        ];
        
        // Prepare summary data
        const summaryData = [
          { label: 'Total Opening Stock Value', value: weeklyReportData.summaryData.openingStockValue },
          { label: 'Total Supply Value', value: weeklyReportData.summaryData.totalSupplyValue },
          { label: 'Total Available Stock Value', value: weeklyReportData.summaryData.availableStockValue },
          { label: 'Total Sales Value', value: totalSalesValue },
          { label: 'Total Closing Stock Value', value: weeklyReportData.summaryData.closingStockValue },
          { label: 'Expected Profit', value: weeklyReportData.summaryData.expectedProfit, subValue: 'for the week' },
          { label: 'Price Periods', value: getNumberOfPricePeriods(), subValue: 'pricing changes during week' },
          { label: 'PMS Average Price', value: `₵${getAverageUnitPrice('pms').toFixed(2)}`, subValue: 'per liter' },
          { label: 'AGO Average Price', value: `₵${getAverageUnitPrice('ago').toFixed(2)}`, subValue: 'per liter' }
        ];

        // Prepare chart data
        const chartData = [
          { Product: 'PMS', 'Opening Stock': weeklyReportData.totals.pms.openingStock, 'Supply': weeklyReportData.totals.pms.supply, 'Sales': weeklyReportData.totals.pms.salesCost, 'Closing Stock': weeklyReportData.totals.pms.closingStock },
          { Product: 'AGO', 'Opening Stock': weeklyReportData.totals.ago.openingStock, 'Supply': weeklyReportData.totals.ago.supply, 'Sales': weeklyReportData.totals.ago.salesCost, 'Closing Stock': weeklyReportData.totals.ago.closingStock }
        ];
        
        // Create export data
        const exportData = createExcelExportData(
          'excel',
          'weekly-operations',
          'current',
          kpiData,
          { 
            tableData, 
            summaryData,
            chartData,
            selectedWeek: selectedMonth 
          }
        );
        
        // Generate Excel with charts
        const excelService = new ExcelExportService();
        excelService.generateExcelWithCharts(exportData);
        
        console.log('Weekly Operations Excel exported successfully');
        
      } catch (error) {
        console.error('Error exporting Weekly Operations Excel:', error);
      }
    } else if (format === 'print') {
      const { printCurrentReport } = await import('../utils/simplePrint');
      
      try {
        // Use simple print service for better compatibility
        printCurrentReport();
        console.log('Weekly Operations print initiated successfully');
        
      } catch (error) {
        console.error('Error opening Weekly Operations print dialog:', error);
        // Final fallback - basic browser print
        window.print();
      }
    }
  };

 

  return (
    <div className="p-6 space-y-6 main-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-medium">
            {currentWeekInfo.month} {currentWeekInfo.week} {currentWeekInfo.dateRange}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Accra Central Station - Weekly Operations Report</p>
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 no-print">
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
          reportType="weekly-operations" 
          reportData={{
            totalSales: calculateTotalSalesAtUnitPrice('pms') + calculateTotalSalesAtUnitPrice('ago'),
            totalProfit: weeklyReportData.summaryData.expectedProfit,
            totalExpenses: weeklyReportData.summaryData.totalSupplyValue,
            totalVehicles: Math.round((calculateTotalSalesAtUnitPrice('pms') + calculateTotalSalesAtUnitPrice('ago')) / 350),
            avgTransactionValue: 350,
            profitMargin: (weeklyReportData.summaryData.expectedProfit / (calculateTotalSalesAtUnitPrice('pms') + calculateTotalSalesAtUnitPrice('ago'))) * 100,
            growthRate: 8.5,
            operationalEfficiency: 94.2
          }}
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

      {/* Week Selection Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Selected Period: {currentWeekInfo.month} {currentWeekInfo.week}</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dynamic Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculateTotalSalesAtUnitPrice('pms') + calculateTotalSalesAtUnitPrice('ago'))}
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">
              Based on {getNumberOfPricePeriods()} price periods
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PMS Sales @ Unit Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalSalesAtUnitPrice('pms'))}</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Avg Price: ₵{getAverageUnitPrice('pms').toFixed(2)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AGO Sales @ Unit Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(calculateTotalSalesAtUnitPrice('ago'))}</div>
            <Badge className="mt-2 bg-purple-100 text-purple-800">Avg Price: ₵{getAverageUnitPrice('ago').toFixed(2)}</Badge>
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
                    {weeklyReportData.weekInfo.month} {weeklyReportData.weekInfo.week} {weeklyReportData.weekInfo.dateRange}
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
                          {/* Dynamic SALES @ UNIT PRICE columns based on price periods */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const periodData = getPeriodData(index);
                            return (
                              <TableHead 
                                key={`sales-unit-price-${index}`}
                                className="border border-gray-300 text-center font-bold bg-yellow-200 text-xs sm:text-sm min-w-32"
                              >
                                SALES @ UNIT PRICE ({periodData.pms.period})
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
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.supply)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.salesCost)}</TableCell>
                          {/* Dynamic SALES @ UNIT PRICE columns for PMS */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const periodSalesValue = calculatePeriodSalesAtUnitPrice('pms', index);
                            return (
                              <TableCell 
                                key={`pms-period-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm font-medium"
                              >
                                {formatCurrency(periodSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.closingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.closingDispensing)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms.pumpGains)}</TableCell>
                        </TableRow>
                        
                        {/* AGO Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">AGO</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.supply)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.salesCost)}</TableCell>
                          {/* Dynamic SALES @ UNIT PRICE columns for AGO */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const periodSalesValue = calculatePeriodSalesAtUnitPrice('ago', index);
                            return (
                              <TableCell 
                                key={`ago-period-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm font-medium"
                              >
                                {formatCurrency(periodSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.closingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.closingDispensing)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago.pumpGains)}</TableCell>
                        </TableRow>

                        {/* Rate Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">Rate ₵</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.rate.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.rate.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.rate.salesCost)}</TableCell>
                          {/* Dynamic price columns for Rate row */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => (
                            <TableCell 
                              key={`rate-period-${index}`}
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
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms_value.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms_value.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms_value.salesCost)}</TableCell>
                          {/* Dynamic PMS Value columns */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const periodSalesValue = calculatePeriodSalesAtUnitPrice('pms', index);
                            return (
                              <TableCell 
                                key={`pms-value-period-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm"
                              >
                                {formatCurrency(periodSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms_value.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.pms_value.pumpGains)}</TableCell>
                        </TableRow>

                        {/* AGO Value Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">AGO Value</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago_value.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago_value.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago_value.salesCost)}</TableCell>
                          {/* Dynamic AGO Value columns */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const periodSalesValue = calculatePeriodSalesAtUnitPrice('ago', index);
                            return (
                              <TableCell 
                                key={`ago-value-period-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 text-xs sm:text-sm"
                              >
                                {formatCurrency(periodSalesValue)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago_value.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.ago_value.pumpGains)}</TableCell>
                        </TableRow>

                        {/* Total Row */}
                        <TableRow>
                          <TableCell className="border border-gray-300 font-bold bg-gray-50 text-xs sm:text-sm">TOTAL</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.total.openingStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.total.availableStock)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-yellow-100 font-bold text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.total.salesCost)}</TableCell>
                          {/* Dynamic Total columns */}
                          {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                            const pmsPeriodSales = calculatePeriodSalesAtUnitPrice('pms', index);
                            const agoPeriodSales = calculatePeriodSalesAtUnitPrice('ago', index);
                            const totalPeriodSales = pmsPeriodSales + agoPeriodSales;
                            return (
                              <TableCell 
                                key={`total-period-${index}`}
                                className="border border-gray-300 text-center bg-yellow-100 font-bold text-xs sm:text-sm"
                              >
                                {formatCurrency(totalPeriodSales)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center font-bold text-xs sm:text-sm">-</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-blue-100 font-bold text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.total.undergroundGains)}</TableCell>
                          <TableCell className="border border-gray-300 text-center bg-red-100 font-bold text-xs sm:text-sm">{formatNumber(weeklyReportData.totals.total.pumpGains)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Comprehensive Summary Table */}
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
                    <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs min-w-24">SALES PROFIT</TableHead>
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
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(675150.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(373950.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(1049100.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(450425.46)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center text-xs font-medium">{formatCurrency(598674.54)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-medium">{formatCurrency(1049100.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-medium">{formatCurrency(179751.51)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-medium">{formatCurrency(139.77)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-medium bg-red-300">{formatCurrency(45.61)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(1250.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(850.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs font-medium">{formatCurrency(320.50)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-orange-100 text-xs font-medium">{formatCurrency(320.50)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs font-medium">{formatCurrency(1250.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-pink-100 text-xs font-medium">{formatCurrency(850.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(448305.00)}</TableCell>
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
                    <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(447985.00)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Pricing Periods Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Period-based price calculations and sales @ unit price computations</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold text-xs">Period</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-bold text-center text-xs">Date Range</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs">PMS Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-blue-200 font-bold text-center text-xs">PMS Quantity (L)</TableHead>
                  <TableHead className="border border-gray-300 bg-yellow-200 font-bold text-center text-xs">PMS Sales @ Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs">AGO Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-green-200 font-bold text-center text-xs">AGO Quantity (L)</TableHead>
                  <TableHead className="border border-gray-300 bg-purple-200 font-bold text-center text-xs">AGO Sales @ Unit Price (₵)</TableHead>
                  <TableHead className="border border-gray-300 bg-red-200 font-bold text-center text-xs">Period Total (₵)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: getNumberOfPricePeriods() }, (_, index) => {
                  const periodData = getPeriodData(index);
                  const periodTotal = periodData.pmsSalesValue + periodData.agoSalesValue;

                  return (
                    <TableRow key={index}>
                      <TableCell className="border border-gray-300 font-medium text-xs">{periodData.pms.period}</TableCell>
                      <TableCell className="border border-gray-300 text-center text-xs">{periodData.pms.dateRange}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">{formatNumber(periodData.pmsPrice)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs">{formatNumber(periodData.pms.quantity)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-medium">{formatCurrency(periodData.pmsSalesValue)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">{formatNumber(periodData.agoPrice)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-green-100 text-xs">{formatNumber(periodData.ago.quantity)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-medium">{formatCurrency(periodData.agoSalesValue)}</TableCell>
                      <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">{formatCurrency(periodTotal)}</TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals Row */}
                <TableRow className="bg-gray-200">
                  <TableCell className="border border-gray-300 font-bold text-xs">TOTALS</TableCell>
                  <TableCell className="border border-gray-300 text-center text-xs font-bold">All Periods</TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    ₵{(pricingPeriodsData.pms.priceChanges.reduce((sum, period, index) => 
                      sum + calculatePeriodPrice('pms', index), 0) / getNumberOfPricePeriods()).toFixed(2)} (Avg)
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-blue-100 text-xs font-bold">
                    {formatNumber(pricingPeriodsData.pms.priceChanges.reduce((sum, period) => sum + period.quantity, 0))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-yellow-100 text-xs font-bold">
                    {formatCurrency(calculateTotalSalesAtUnitPrice('pms'))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-bold">
                    ₵{(pricingPeriodsData.ago.priceChanges.reduce((sum, period, index) => 
                      sum + calculatePeriodPrice('ago', index), 0) / getNumberOfPricePeriods()).toFixed(2)} (Avg)
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-green-100 text-xs font-bold">
                    {formatNumber(pricingPeriodsData.ago.priceChanges.reduce((sum, period) => sum + period.quantity, 0))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-purple-100 text-xs font-bold">
                    {formatCurrency(calculateTotalSalesAtUnitPrice('ago'))}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center bg-red-100 text-xs font-bold">
                    {formatCurrency(calculateTotalSalesAtUnitPrice('pms') + calculateTotalSalesAtUnitPrice('ago'))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Dynamic Pricing Explanation */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Dynamic Pricing Periods Logic</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">PMS Pricing:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Base Price: ₵{pricingPeriodsData.pms.basePrice}</li>
                  <li>Price periods: {getNumberOfPricePeriods()}</li>
                  <li>Adjustments: ₵0.00 - ₵0.25</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">AGO Pricing:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Base Price: ₵{pricingPeriodsData.ago.basePrice}</li>
                  <li>Price periods: {getNumberOfPricePeriods()}</li>
                  <li>Adjustments: ₵0.00 - ₵0.40</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Formula:</strong> Sales @ Unit Price = Period Quantity × (Base Price + Period Adjustment)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              <strong>Columns Generated:</strong> {getNumberOfPricePeriods()} SALES @ UNIT PRICE columns based on JSON price changes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(weeklyReportData.summaryData.salesValue)}</div>
            <Badge className="mt-2 bg-green-100 text-green-800">PMS + AGO</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(weeklyReportData.summaryData.salesProfit)}</div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Actual Profit</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closing Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{formatCurrency(weeklyReportData.summaryData.closingStockValue)}</div>
            <Badge className="mt-2 bg-purple-100 text-purple-800">Total Stock</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{weeklyReportData.summaryData.profitMarginPercentage}%</div>
            <Badge className="mt-2 bg-orange-100 text-orange-800">Efficiency</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Week & Pricing System</CardTitle>
          <p className="text-sm text-muted-foreground">JSON-based configuration with dynamic week selection</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Week Selection Configuration</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                <pre>{JSON.stringify({
                  currentWeek: getCurrentWeekOfMonth(),
                  availableWeeks: availableWeeks.length,
                  selectedWeek: currentWeekInfo.week,
                  dateRange: currentWeekInfo.dateRange,
                  weekMultiplier: getWeekSpecificMultiplier().toFixed(2)
                }, null, 2)}</pre>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Dynamic System Features</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Auto Week Detection:</strong> Shows weeks 1 through current week of month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Dynamic Columns:</strong> {getNumberOfPricePeriods()} SALES @ UNIT PRICE columns generated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Week Variation:</strong> Data adjusts by {((getWeekSpecificMultiplier() - 1) * 100).toFixed(1)}% for selected week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Date Calculation:</strong> Automatic date ranges for each week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Current Week Indicator:</strong> Highlights current week status</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}