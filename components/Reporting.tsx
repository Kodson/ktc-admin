import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
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
  AlertTriangle
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
  { metric: 'Highest Daily Sales', value: '₵25,500', date: 'Dec 7, 2024', performance: '+15%' },
  { metric: 'Peak Vehicle Count', value: '45 vehicles', date: 'Dec 7, 2024', performance: '+12%' },
  { metric: 'Best Profit Margin', value: '24.8%', date: 'Dec 5, 2024', performance: '+3.2%' },
  { metric: 'Lowest Expenses', value: '₵17,200', date: 'Dec 3, 2024', performance: '-8%' }
];

export function Reporting() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [reportType, setReportType] = useState('summary');

  const getCurrentKPI = () => {
    switch (activeTab) {
      case 'weekly': return kpiData.weekly;
      case 'monthly': return kpiData.monthly;
      case 'annual': return kpiData.annual;
      default: return kpiData.weekly;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'weekly': return weeklyData;
      case 'weekly-sales': return weeklyData;
      case 'monthly': return monthlyData;
      case 'annual': return annualData;
      default: return weeklyData;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExport = (format: string) => {
    console.log(`Exporting ${activeTab} report as ${format}`);
    // Implementation for export functionality
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
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="weekly-sales">Weekly Sales Analysis</TabsTrigger>
          <TabsTrigger value="monthly">End of Month Report</TabsTrigger>
          <TabsTrigger value="annual">Annual Report</TabsTrigger>
        </TabsList>

        {/* Weekly Report */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">Weekly Performance Report</h2>
              <p className="text-sm text-muted-foreground">Dec 2-8, 2024 • 7 days analysis</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Daily Sales Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Sales']} />
                    <Bar dataKey="sales" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vehicle Count Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Vehicle Traffic Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="vehicles" stroke="#666666" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Vehicles</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Avg/Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyData.map((day) => (
                    <TableRow key={day.day}>
                      <TableCell className="font-medium">{day.day}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(day.sales)}</TableCell>
                      <TableCell className="text-right">{day.transactions}</TableCell>
                      <TableCell className="text-right">{day.vehicles}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.revenue / day.vehicles)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{performer.metric}</p>
                      <p className="text-sm text-muted-foreground">{performer.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{performer.value}</p>
                      <p className="text-sm text-green-600">{performer.performance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Sales Analysis */}
        <TabsContent value="weekly-sales" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">Weekly Sales Analysis</h2>
              <p className="text-sm text-muted-foreground">Detailed sales performance and trends</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales vs Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Sales vs Revenue Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stackId="1" stroke="#000000" fill="#000000" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="revenue" stackId="2" stroke="#666666" fill="#666666" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Mix */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={productMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {productMix.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(125300)}</div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">+8.5%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">342</div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">+12.3%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(366.37)}</div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">+3.2%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">22.7%</div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <Badge className="mt-2 bg-orange-100 text-orange-800">+1.8%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* End of Month Report */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">End of Month Report</h2>
              <p className="text-sm text-muted-foreground">November 2024 • Complete monthly analysis</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                    <Bar dataKey="sales" fill="#000000" />
                    <Bar dataKey="profit" fill="#666666" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: expense.color }}></div>
                        <span className="font-medium">{expense.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(expense.amount)}</div>
                        <div className="text-sm text-muted-foreground">{expense.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(520000)}</p>
                  <Badge className="bg-green-100 text-green-800">+12.3%</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(75800)}</p>
                  <Badge className="bg-red-100 text-red-800">+5.2%</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(107000)}</p>
                  <Badge className="bg-blue-100 text-blue-800">+15.7%</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">20.6%</p>
                  <Badge className="bg-purple-100 text-purple-800">+2.1%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Fuel className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">1,065</div>
                  <p className="text-sm text-muted-foreground">Total Vehicles Served</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Droplets className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">245</div>
                  <p className="text-sm text-muted-foreground">Washing Bay Services</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">91.8%</div>
                  <p className="text-sm text-muted-foreground">Operational Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Report */}
        <TabsContent value="annual" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">Cumulative Annual Report</h2>
              <p className="text-sm text-muted-foreground">2024 Year-end comprehensive analysis</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          {/* Annual Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#000000" fill="#000000" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="profit" stackId="2" stroke="#666666" fill="#666666" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="expenses" stackId="3" stroke="#999999" fill="#999999" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Annual KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Annual Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(5810000)}</div>
                <p className="text-xs text-muted-foreground">+15.7% YoY growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Annual Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(1232000)}</div>
                <p className="text-xs text-muted-foreground">21.2% profit margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">15,630</div>
                <p className="text-xs text-muted-foreground">1,302 avg/month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">93.5%</div>
                <p className="text-xs text-muted-foreground">Operational excellence</p>
              </CardContent>
            </Card>
          </div>

          {/* Quarterly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quarter</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Vehicles</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Q1 2024</TableCell>
                    <TableCell className="text-right">{formatCurrency(1350000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(285000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(205000)}</TableCell>
                    <TableCell className="text-right">3,650</TableCell>
                    <TableCell className="text-right text-green-600">+12.5%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q2 2024</TableCell>
                    <TableCell className="text-right">{formatCurrency(1470000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(311000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(218000)}</TableCell>
                    <TableCell className="text-right">3,950</TableCell>
                    <TableCell className="text-right text-green-600">+15.2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q3 2024</TableCell>
                    <TableCell className="text-right">{formatCurrency(1480000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(315000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(210000)}</TableCell>
                    <TableCell className="text-right">3,900</TableCell>
                    <TableCell className="text-right text-green-600">+18.7%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q4 2024</TableCell>
                    <TableCell className="text-right">{formatCurrency(1510000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(321000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(210000)}</TableCell>
                    <TableCell className="text-right">4,130</TableCell>
                    <TableCell className="text-right text-green-600">+16.8%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Year-end Summary */}
          <Card>
            <CardHeader>
              <CardTitle>2024 Year-end Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Key Achievements</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Exceeded annual revenue target by 15.7%
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Maintained 93.5% operational efficiency
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Served 15,630 vehicles successfully
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Achieved 21.2% profit margin
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Areas for Improvement</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Optimize Q3 operational efficiency
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Reduce utility expenses in peak months
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Expand washing bay services
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Implement predictive maintenance
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}