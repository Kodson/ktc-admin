import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { WeeklyReport } from './WeeklyReport';
import { WeeklySalesAnalysis } from './WeeklySalesAnalysis';
import { EndOfMonthReport } from './EndOfMonthReport';
import { AnnualReport } from './AnnualReport';
import { ShareModal } from './ShareModal';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Printer,
  Mail,
  Share2,
  Car,
  Fuel,
  Droplets,
  Zap,
  Building,
  Users,
  Clock,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';

// Mock data for reports
const weeklyData = [
  { day: 'Mon', sales: 12500, transactions: 45, vehicles: 25, revenue: 14200 },
  { day: 'Tue', sales: 15200, transactions: 52, vehicles: 30, revenue: 16800 },
  { day: 'Wed', sales: 11800, transactions: 42, vehicles: 22, revenue: 13500 },
  { day: 'Thu', sales: 18500, transactions: 65, vehicles: 35, revenue: 20100 },
  { day: 'Fri', sales: 22000, transactions: 78, vehicles: 40, revenue: 24500 },
  { day: 'Sat', sales: 25500, transactions: 85, vehicles: 45, revenue: 28200 },
  { day: 'Sun', sales: 19800, transactions: 68, vehicles: 38, revenue: 22100 }
];

const monthlyData = [
  { week: 'Week 1', sales: 125000, profit: 25000, expenses: 18000, vehicles: 250 },
  { week: 'Week 2', sales: 132000, profit: 28000, expenses: 19500, vehicles: 280 },
  { week: 'Week 3', sales: 118000, profit: 22000, expenses: 17200, vehicles: 225 },
  { week: 'Week 4', sales: 145000, profit: 32000, expenses: 21000, vehicles: 310 }
];

const annualData = [
  { month: 'Jan', sales: 450000, profit: 95000, expenses: 68000, vehicles: 1200 },
  { month: 'Feb', sales: 420000, profit: 88000, expenses: 65000, vehicles: 1150 },
  { month: 'Mar', sales: 480000, profit: 102000, expenses: 72000, vehicles: 1300 },
  { month: 'Apr', sales: 465000, profit: 98000, expenses: 70000, vehicles: 1250 },
  { month: 'May', sales: 510000, profit: 108000, expenses: 75000, vehicles: 1380 },
  { month: 'Jun', sales: 495000, profit: 105000, expenses: 73000, vehicles: 1320 },
  { month: 'Jul', sales: 520000, profit: 112000, expenses: 78000, vehicles: 1420 },
  { month: 'Aug', sales: 485000, profit: 103000, expenses: 71000, vehicles: 1290 },
  { month: 'Sep', sales: 475000, profit: 100000, expenses: 69000, vehicles: 1260 },
  { month: 'Oct', sales: 505000, profit: 107000, expenses: 74000, vehicles: 1350 },
  { month: 'Nov', sales: 490000, profit: 104000, expenses: 72000, vehicles: 1310 },
  { month: 'Dec', sales: 515000, profit: 110000, expenses: 76000, vehicles: 1390 }
];

const productMix = [
  { name: 'Petrol', value: 45, color: '#000000' },
  { name: 'Diesel', value: 35, color: '#666666' },
  { name: 'Washing Bay', value: 12, color: '#999999' },
  { name: 'Other Services', value: 8, color: '#cccccc' }
];

const kpiData = {
  weekly: {
    totalSales: 125300,
    totalProfit: 28500,
    totalExpenses: 19200,
    totalVehicles: 235,
    avgTransactionValue: 285.50,
    profitMargin: 22.7,
    growthRate: 8.5,
    operationalEfficiency: 94.2
  },
  monthly: {
    totalSales: 520000,
    totalProfit: 107000,
    totalExpenses: 75800,
    totalVehicles: 1065,
    avgTransactionValue: 288.30,
    profitMargin: 20.6,
    growthRate: 12.3,
    operationalEfficiency: 91.8
  },
  annual: {
    totalSales: 5810000,
    totalProfit: 1232000,
    totalExpenses: 843000,
    totalVehicles: 15630,
    avgTransactionValue: 291.20,
    profitMargin: 21.2,
    growthRate: 15.7,
    operationalEfficiency: 93.5
  }
};

const expenseBreakdown = [
  { category: 'Utilities', amount: 8500, percentage: 35, color: '#000000' },
  { category: 'Staff Wages', amount: 6200, percentage: 26, color: '#333333' },
  { category: 'Maintenance', amount: 3800, percentage: 16, color: '#666666' },
  { category: 'Supplies', amount: 2900, percentage: 12, color: '#999999' },
  { category: 'Other', amount: 2600, percentage: 11, color: '#cccccc' }
];

const topPerformers = [
  { metric: 'Highest Daily Sales', value: '₵25,500.00', date: 'Dec 7, 2024', performance: '+15%' },
  { metric: 'Peak Vehicle Count', value: '45 vehicles', date: 'Dec 7, 2024', performance: '+12%' },
  { metric: 'Best Profit Margin', value: '24.8%', date: 'Dec 5, 2024', performance: '+3.2%' },
  { metric: 'Lowest Expenses', value: '₵17,200.00', date: 'Dec 3, 2024', performance: '-8%' }
];

export function Reporting() {
  const [activeTab, setActiveTab] = useState('weekly-operations');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [reportType, setReportType] = useState('summary');

  const getCurrentKPI = () => {
    switch (activeTab) {
      case 'weekly-operations': return kpiData.weekly;
      case 'weekly-sales': return kpiData.weekly;
      case 'monthly': return kpiData.monthly;
      case 'annual': return kpiData.annual;
      default: return kpiData.weekly;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'weekly-operations': return weeklyData;
      case 'weekly-sales': return weeklyData;
      case 'monthly': return monthlyData;
      case 'annual': return annualData;
      default: return weeklyData;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      const { PDFExportService, createExportData } = await import('../utils/pdfExport');
      
      try {
        // Get current KPI data
        const currentKPI = getCurrentKPI();
        
        // Prepare table data based on active tab
        let additionalData: any = {};
        
        if (activeTab === 'weekly-operations' || activeTab === 'weekly-sales') {
          // Weekly data
          additionalData.tableData = [{
            title: 'Weekly Performance Breakdown',
            headers: ['Day', 'Sales', 'Transactions', 'Vehicles', 'Revenue', 'Avg/Vehicle'],
            rows: weeklyData.map(day => [
              day.day,
              day.sales,
              day.transactions,
              day.vehicles,
              day.revenue,
              Math.round(day.revenue / day.vehicles * 100) / 100
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Week Total Sales', value: currentKPI.totalSales },
            { label: 'Week Total Profit', value: currentKPI.totalProfit },
            { label: 'Week Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Transaction Value', value: currentKPI.avgTransactionValue },
            { label: 'Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Operational Efficiency', value: `${currentKPI.operationalEfficiency}%`, subValue: 'efficiency score' }
          ];
        } else if (activeTab === 'monthly') {
          // Monthly data
          additionalData.tableData = [{
            title: 'Monthly Performance by Week',
            headers: ['Week', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: monthlyData.map(week => [
              week.week,
              week.sales,
              week.profit,
              week.expenses,
              week.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Month Total Sales', value: currentKPI.totalSales },
            { label: 'Month Total Profit', value: currentKPI.totalProfit },
            { label: 'Month Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Month Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Net Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Growth Rate', value: `${currentKPI.growthRate}%`, subValue: 'vs previous month' }
          ];
        } else if (activeTab === 'annual') {
          // Annual data
          additionalData.tableData = [{
            title: 'Annual Performance by Month',
            headers: ['Month', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: annualData.map(month => [
              month.month,
              month.sales,
              month.profit,
              month.expenses,
              month.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Annual Total Sales', value: currentKPI.totalSales },
            { label: 'Annual Total Profit', value: currentKPI.totalProfit },
            { label: 'Annual Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Annual Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Monthly Sales', value: Math.round(currentKPI.totalSales / 12) },
            { label: 'Year-over-Year Growth', value: `${currentKPI.growthRate}%`, subValue: 'annual growth rate' }
          ];
        }
        
        // Create export data
        const exportData = createExportData(
          'pdf',
          activeTab,
          selectedPeriod,
          currentKPI,
          additionalData
        );
        
        // Generate PDF
        const pdfService = new PDFExportService();
        pdfService.generatePDF(exportData);
        
        // Show success message (you can add a toast notification here)
        console.log('PDF exported successfully');
        
      } catch (error) {
        console.error('Error exporting PDF:', error);
        // Show error message (you can add a toast notification here)
      }
    } else if (format === 'excel') {
      const { ExcelExportService, createExcelExportData } = await import('../utils/excelExport');
      
      try {
        // Get current KPI data
        const currentKPI = getCurrentKPI();
        
        // Prepare table data based on active tab (reuse same logic as PDF)
        let additionalData: any = {};
        
        if (activeTab === 'weekly-operations' || activeTab === 'weekly-sales') {
          // Weekly data
          additionalData.tableData = [{
            title: 'Weekly Performance Breakdown',
            headers: ['Day', 'Sales', 'Transactions', 'Vehicles', 'Revenue', 'Avg/Vehicle'],
            rows: weeklyData.map(day => [
              day.day,
              day.sales,
              day.transactions,
              day.vehicles,
              day.revenue,
              Math.round(day.revenue / day.vehicles * 100) / 100
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Week Total Sales', value: currentKPI.totalSales },
            { label: 'Week Total Profit', value: currentKPI.totalProfit },
            { label: 'Week Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Transaction Value', value: currentKPI.avgTransactionValue },
            { label: 'Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Operational Efficiency', value: `${currentKPI.operationalEfficiency}%`, subValue: 'efficiency score' }
          ];

          // Add chart data for weekly reports
          additionalData.chartData = weeklyData.map(day => ({
            Day: day.day,
            Sales: day.sales,
            Revenue: day.revenue,
            Vehicles: day.vehicles,
            Transactions: day.transactions
          }));
        } else if (activeTab === 'monthly') {
          // Monthly data
          additionalData.tableData = [{
            title: 'Monthly Performance by Week',
            headers: ['Week', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: monthlyData.map(week => [
              week.week,
              week.sales,
              week.profit,
              week.expenses,
              week.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Month Total Sales', value: currentKPI.totalSales },
            { label: 'Month Total Profit', value: currentKPI.totalProfit },
            { label: 'Month Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Month Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Net Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Growth Rate', value: `${currentKPI.growthRate}%`, subValue: 'vs previous month' }
          ];

          // Add chart data for monthly reports
          additionalData.chartData = monthlyData.map(week => ({
            Week: week.week,
            Sales: week.sales,
            Profit: week.profit,
            Expenses: week.expenses,
            Vehicles: week.vehicles
          }));
        } else if (activeTab === 'annual') {
          // Annual data
          additionalData.tableData = [{
            title: 'Annual Performance by Month',
            headers: ['Month', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: annualData.map(month => [
              month.month,
              month.sales,
              month.profit,
              month.expenses,
              month.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Annual Total Sales', value: currentKPI.totalSales },
            { label: 'Annual Total Profit', value: currentKPI.totalProfit },
            { label: 'Annual Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Annual Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Monthly Sales', value: Math.round(currentKPI.totalSales / 12) },
            { label: 'Year-over-Year Growth', value: `${currentKPI.growthRate}%`, subValue: 'annual growth rate' }
          ];

          // Add chart data for annual reports
          additionalData.chartData = annualData.map(month => ({
            Month: month.month,
            Sales: month.sales,
            Profit: month.profit,
            Expenses: month.expenses,
            Vehicles: month.vehicles
          }));
        }
        
        // Create export data
        const exportData = createExcelExportData(
          'excel',
          activeTab,
          selectedPeriod,
          currentKPI,
          additionalData
        );
        
        // Generate Excel with charts
        const excelService = new ExcelExportService();
        excelService.generateExcelWithCharts(exportData);
        
        console.log('Excel exported successfully');
        
      } catch (error) {
        console.error('Error exporting Excel:', error);
        // Show error message (you can add a toast notification here)
      }
    } else if (format === 'print') {
      const { PrintService, createPrintData } = await import('../utils/printService');
      
      try {
        // Get current KPI data
        const currentKPI = getCurrentKPI();
        
        // Prepare table data based on active tab (reuse same logic as PDF/Excel)
        let additionalData: any = {};
        
        if (activeTab === 'weekly-operations' || activeTab === 'weekly-sales') {
          // Weekly data
          additionalData.tableData = [{
            title: 'Weekly Performance Breakdown',
            headers: ['Day', 'Sales', 'Transactions', 'Vehicles', 'Revenue', 'Avg/Vehicle'],
            rows: weeklyData.map(day => [
              day.day,
              day.sales,
              day.transactions,
              day.vehicles,
              day.revenue,
              Math.round(day.revenue / day.vehicles * 100) / 100
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Week Total Sales', value: currentKPI.totalSales },
            { label: 'Week Total Profit', value: currentKPI.totalProfit },
            { label: 'Week Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Transaction Value', value: currentKPI.avgTransactionValue },
            { label: 'Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Operational Efficiency', value: `${currentKPI.operationalEfficiency}%`, subValue: 'efficiency score' }
          ];
        } else if (activeTab === 'monthly') {
          // Monthly data
          additionalData.tableData = [{
            title: 'Monthly Performance by Week',
            headers: ['Week', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: monthlyData.map(week => [
              week.week,
              week.sales,
              week.profit,
              week.expenses,
              week.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Month Total Sales', value: currentKPI.totalSales },
            { label: 'Month Total Profit', value: currentKPI.totalProfit },
            { label: 'Month Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Month Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Net Profit Margin', value: `${currentKPI.profitMargin}%`, subValue: 'of total sales' },
            { label: 'Growth Rate', value: `${currentKPI.growthRate}%`, subValue: 'vs previous month' }
          ];
        } else if (activeTab === 'annual') {
          // Annual data
          additionalData.tableData = [{
            title: 'Annual Performance by Month',
            headers: ['Month', 'Sales', 'Profit', 'Expenses', 'Vehicles'],
            rows: annualData.map(month => [
              month.month,
              month.sales,
              month.profit,
              month.expenses,
              month.vehicles
            ])
          }];
          
          additionalData.summaryData = [
            { label: 'Annual Total Sales', value: currentKPI.totalSales },
            { label: 'Annual Total Profit', value: currentKPI.totalProfit },
            { label: 'Annual Total Expenses', value: currentKPI.totalExpenses },
            { label: 'Annual Total Vehicles', value: currentKPI.totalVehicles, subValue: 'vehicles served' },
            { label: 'Average Monthly Sales', value: Math.round(currentKPI.totalSales / 12) },
            { label: 'Year-over-Year Growth', value: `${currentKPI.growthRate}%`, subValue: 'annual growth rate' }
          ];
        }
        
        // Create print data
        const printData = createPrintData(
          'print',
          activeTab,
          selectedPeriod,
          currentKPI,
          additionalData
        );
        
        // Generate print document
        const printService = new PrintService();
        printService.printReport(printData);
        
        console.log('Print dialog opened successfully');
        
      } catch (error) {
        console.error('Error opening print dialog:', error);
        // Show error message (you can add a toast notification here)
      }
    } else {
      console.log(`Exporting ${activeTab} report as ${format}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Reports & Analytics</h1>
          <p className="text-muted-foreground">Accra Central Station - Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          
          {/* Export/Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Export as Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('print')}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Print Report</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Share Options</DropdownMenuLabel>
              <ShareModal reportType={activeTab} reportData={getCurrentKPI()}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share Report</span>
                </DropdownMenuItem>
              </ShareModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getCurrentKPI().totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{formatPercentage(getCurrentKPI().growthRate)}</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(getCurrentKPI().totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(getCurrentKPI().profitMargin)} profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getCurrentKPI().totalVehicles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(getCurrentKPI().avgTransactionValue)} per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatPercentage(getCurrentKPI().operationalEfficiency)}</div>
            <p className="text-xs text-muted-foreground">Operational efficiency score</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="weekly-operations">Weekly Operations</TabsTrigger>
          <TabsTrigger value="weekly-sales">Weekly Sales Analysis</TabsTrigger>
          <TabsTrigger value="monthly">End of Month Report</TabsTrigger>
          <TabsTrigger value="annual">Annual Report</TabsTrigger>
        </TabsList>

        {/* Weekly Operations Report */}
        <TabsContent value="weekly-operations" className="space-y-6">
          <WeeklyReport />
        </TabsContent>



        {/* Weekly Sales Analysis */}
        <TabsContent value="weekly-sales" className="space-y-6">
          <WeeklySalesAnalysis />
        </TabsContent>

        {/* End of Month Report */}
        <TabsContent value="monthly" className="space-y-6">
          <EndOfMonthReport />
        </TabsContent>

        {/* Annual Report */}
        <TabsContent value="annual" className="space-y-6">
          <AnnualReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}