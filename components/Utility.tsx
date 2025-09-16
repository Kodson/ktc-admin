import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Zap,
  Droplets,
  Wifi,
  Shield,
  Trash2,
  PieChart,
  Download,
  Plus,
  Search,
  Eye,
  Edit,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useUtilityManagement } from '../hooks/useUtilityManagement';

// Initial form data
const initialBillForm = {
  utility: '',
  provider: '',
  billNumber: '',
  dueDate: '',
  periodStart: '',
  periodEnd: '',
  consumption: '',
  unit: '',
  rate: '',
  amount: '',
  status: 'Pending',
  priority: 'Medium',
  notes: ''
};

export function Utility() {
  const {
    // Data
    bills,
    statistics,
    budgetData,
    monthlyData,
    pieData,
    
    // State
    isLoading,
    isSubmitting,
    //connectionStatus,
    lastError,
    filters,
    
    // Actions
    createUtilityBill,
    updateUtilityBill,
    //deleteUtilityBill,
    //payUtilityBill,
    exportUtilityData,
    updateFilters,
    
    // Utilities
    formatCurrency
  } = useUtilityManagement();
  
  // Modal states
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [isEditBillOpen, setIsEditBillOpen] = useState(false);
  // Removed unused isPayBillOpen state
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [billForm, setBillForm] = useState(initialBillForm);
  /*
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: ''
  });
*/
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getUtilityIcon = (utility: string) => {
    switch (utility.toLowerCase()) {
      case 'electricity':
        return <Zap className="h-4 w-4" />;
      case 'water':
        return <Droplets className="h-4 w-4" />;
      case 'internet':
        return <Wifi className="h-4 w-4" />;
      case 'security systems':
        return <Shield className="h-4 w-4" />;
      case 'waste management':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = filters.search ? (
      bill.provider.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.utility.toLowerCase().includes(filters.search.toLowerCase())
    ) : true;
    const matchesStatus = filters.status === 'all' || bill.status.toLowerCase() === filters.status?.toLowerCase();
    const matchesUtility = filters.utility === 'all' || bill.utility.toLowerCase() === filters.utility?.toLowerCase();
    const matchesPriority = filters.priority === 'all' || bill.priority.toLowerCase() === filters.priority?.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesUtility && matchesPriority;
  });

  const handleAddBill = async () => {
    const success = await createUtilityBill(billForm);
    if (success) {
      setBillForm(initialBillForm);
      setIsAddBillOpen(false);
    }
  };

  const handleEditBill = async () => {
    if (!selectedBill) return;
    
    const success = await updateUtilityBill({
      ...billForm,
      id: selectedBill.id
    });
    
    if (success) {
      setBillForm(initialBillForm);
      setIsEditBillOpen(false);
      setSelectedBill(null);
    }
  };
/*
  const handlePayBill = async () => {
    if (!selectedBill) return;
    
    const success = await payUtilityBill({
      id: selectedBill.id,
      paidBy: 'Current User',
      paidAt: new Date().toISOString(),
      paymentMethod: paymentForm.paymentMethod as any,
      transactionReference: paymentForm.transactionReference,
      notes: paymentForm.notes
    });
    
    if (success) {
      setPaymentForm({
        paymentMethod: 'Bank Transfer',
        transactionReference: '',
        notes: ''
      });
      setSelectedBill(null);
    }
  };
*/
  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };

  const handleEditBillClick = (bill: any) => {
    setSelectedBill(bill);
    const periodParts = bill.period.split(' - ');
    setBillForm({
      utility: bill.utility,
      provider: bill.provider,
      billNumber: bill.billNumber,
      dueDate: bill.dueDate,
      periodStart: periodParts[0] || '',
      periodEnd: periodParts[1] || '',
      consumption: bill.consumption.value !== 'N/A' ? bill.consumption.value.toString() : '',
      unit: bill.consumption.unit || '',
      rate: bill.consumption.rate ? bill.consumption.rate.toString() : '',
      amount: bill.amount.toString(),
      status: bill.status,
      priority: bill.priority,
      notes: ''
    });
    setIsEditBillOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setBillForm(prev => ({ ...prev, [field]: value }));
  };
/*
  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };
*/
  const handlePayBillClick = (bill: any) => {
  setSelectedBill(bill);
  // Removed setIsPayBillOpen, as modal is not rendered
  };

  const handleExportReport = async () => {
    await exportUtilityData('csv');
  };

  if (isLoading && bills.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm font-medium">Loading utility data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-medium">Utility Management</h1>
          <p className="text-sm text-muted-foreground">Track utility bills, consumption, and payments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-sm font-medium"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button 
            onClick={() => setIsAddBillOpen(true)}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-medium"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Bill</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="font-medium text-red-800 text-sm">Error: {lastError.message}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(statistics.thisMonth.amount)}</div>
            <p className="text-xs text-muted-foreground">{statistics.thisMonth.count} bills this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(statistics.pending.amount)}</div>
            <p className="text-xs text-muted-foreground">{statistics.pending.count} bills awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(statistics.overdue.amount)}</div>
            <p className="text-xs text-muted-foreground">{statistics.overdue.count} bills overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statistics.budgetStatus.toFixed(1)}%</div>
            <Progress value={statistics.budgetStatus} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Utility Costs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Monthly Utility Costs</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Utility spending and consumption trends over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utility Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Utility Breakdown</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Spending distribution by utility type</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Tooltip formatter={(value: any) => [formatCurrency(value), '']} />
                <RechartsPieChart data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Status by Utility Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Budget Status by Utility Type</CardTitle>
          <p className="text-sm text-muted-foreground">Current budget utilization across utility categories</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {budgetData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium text-sm">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.current)} / {formatCurrency(item.budget)}
                  </span>
                  <Badge variant="outline" className="font-medium text-sm">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Utility Bills Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium">Utility Bills</CardTitle>
              <p className="text-sm text-muted-foreground">Track and manage all utility bills</p>
            </div>
            <p className="text-sm text-muted-foreground">{filteredBills.length} of {bills.length} entries</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bill number, provider, utility..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters({ status: value as any })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.utility || 'all'} onValueChange={(value) => updateFilters({ utility: value as any })}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Utility Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Utility Type</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="security systems">Security Systems</SelectItem>
                  <SelectItem value="waste management">Waste Management</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilters({ priority: value as any })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bills Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-sm font-medium">Due Date</TableHead>
                  <TableHead className="text-sm font-medium">Utility</TableHead>
                  <TableHead className="text-sm font-medium">Bill Details</TableHead>
                  <TableHead className="text-center text-sm font-medium">Consumption</TableHead>
                  <TableHead className="text-center text-sm font-medium">Amount</TableHead>
                  <TableHead className="text-center text-sm font-medium">Status</TableHead>
                  <TableHead className="text-center text-sm font-medium">Priority</TableHead>
                  <TableHead className="text-center text-sm font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{bill.dueDate}</span>
                        </div>
                        {bill.daysOverdue > 0 && (
                          <span className="text-xs text-red-600">{bill.daysOverdue} days overdue</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getUtilityIcon(bill.utility)}
                        <div>
                          <div className="font-medium text-sm">{bill.utility}</div>
                          <div className="text-sm text-muted-foreground">{bill.provider}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{bill.billNumber}</div>
                        <div className="text-sm text-muted-foreground">{bill.period}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {bill.consumption.value !== 'N/A' ? (
                        <div>
                          <div className="font-medium text-sm">{(bill.consumption.value as number).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{bill.consumption.unit}</div>
                          <div className="text-xs text-muted-foreground">@ ₵{bill.consumption.rate} per unit</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{formatCurrency(bill.amount)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                      {bill.status === 'Paid' && bill.paidBy && (
                        <div className="text-xs text-muted-foreground mt-1">By {bill.paidBy}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getPriorityColor(bill.priority)}>
                        {bill.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {bill.status === 'Pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handlePayBillClick(bill)}
                            disabled={isSubmitting}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditBillClick(bill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBills.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No bills found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Bill Modal */}
      <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="add-bill-description">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg font-medium">
                <Plus className="h-5 w-5" />
                Add New Utility Bill
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddBillOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div id="add-bill-description" className="sr-only">
            Dialog to add a new utility bill with form fields for utility type, provider, billing period, consumption, and payment information.
          </div>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Utility Type *</Label>
                    <Select value={billForm.utility} onValueChange={(value) => handleFormChange('utility', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select utility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electricity">Electricity</SelectItem>
                        <SelectItem value="Water">Water</SelectItem>
                        <SelectItem value="Internet">Internet</SelectItem>
                        <SelectItem value="Security Systems">Security Systems</SelectItem>
                        <SelectItem value="Waste Management">Waste Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider *</Label>
                    <Input
                      placeholder="e.g., Electricity Company of Ghana"
                      value={billForm.provider}
                      onChange={(e) => handleFormChange('provider', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bill Number *</Label>
                    <Input
                      placeholder="e.g., ECG-2025-001"
                      value={billForm.billNumber}
                      onChange={(e) => handleFormChange('billNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={billForm.dueDate}
                      onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Period Start *</Label>
                    <Input
                      type="date"
                      value={billForm.periodStart}
                      onChange={(e) => handleFormChange('periodStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End *</Label>
                    <Input
                      type="date"
                      value={billForm.periodEnd}
                      onChange={(e) => handleFormChange('periodEnd', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumption & Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consumption & Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Consumption</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2260"
                      value={billForm.consumption}
                      onChange={(e) => handleFormChange('consumption', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      placeholder="e.g., kWh, cubic meters"
                      value={billForm.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.64"
                      value={billForm.rate}
                      onChange={(e) => handleFormChange('rate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Amount (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2640.00"
                    value={billForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={billForm.status} onValueChange={(value) => handleFormChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={billForm.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this bill..."
                    value={billForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddBillOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddBill}
                disabled={!billForm.utility || !billForm.provider || !billForm.billNumber || !billForm.amount}
                className="bg-black text-white hover:bg-gray-800"
              >
                Add Bill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bill Details Modal */}
      <Dialog open={isViewBillOpen} onOpenChange={setIsViewBillOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Bill Details - {selectedBill?.billNumber}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsViewBillOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bill Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Utility Type</p>
                      <div className="flex items-center gap-2">
                        {getUtilityIcon(selectedBill.utility)}
                        <span className="font-medium">{selectedBill.utility}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium">{selectedBill.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bill Number</p>
                      <p className="font-medium">{selectedBill.billNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{selectedBill.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Billing Period</p>
                      <p className="font-medium">{selectedBill.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedBill.status)}>
                        {selectedBill.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consumption Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumption Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Consumption</p>
                      <p className="font-medium">
                        {selectedBill.consumption.value !== 'N/A' 
                          ? `${selectedBill.consumption.value.toLocaleString()} ${selectedBill.consumption.unit}`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate per Unit</p>
                      <p className="font-medium">
                        {selectedBill.consumption.rate ? `€${selectedBill.consumption.rate}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold">€{selectedBill.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority & Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority & Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Priority Level</p>
                      <Badge className={getPriorityColor(selectedBill.priority)}>
                        {selectedBill.priority}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsViewBillOpen(false);
                          handleEditBillClick(selectedBill);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Bill
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bill Modal */}
      <Dialog open={isEditBillOpen} onOpenChange={setIsEditBillOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Utility Bill - {selectedBill?.billNumber}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsEditBillOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Utility Type *</Label>
                    <Select value={billForm.utility} onValueChange={(value) => handleFormChange('utility', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select utility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electricity">Electricity</SelectItem>
                        <SelectItem value="Water">Water</SelectItem>
                        <SelectItem value="Internet">Internet</SelectItem>
                        <SelectItem value="Security Systems">Security Systems</SelectItem>
                        <SelectItem value="Waste Management">Waste Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider *</Label>
                    <Input
                      placeholder="e.g., Electricity Company of Ghana"
                      value={billForm.provider}
                      onChange={(e) => handleFormChange('provider', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bill Number *</Label>
                    <Input
                      placeholder="e.g., ECG-2025-001"
                      value={billForm.billNumber}
                      onChange={(e) => handleFormChange('billNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={billForm.dueDate}
                      onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Period Start *</Label>
                    <Input
                      type="date"
                      value={billForm.periodStart}
                      onChange={(e) => handleFormChange('periodStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End *</Label>
                    <Input
                      type="date"
                      value={billForm.periodEnd}
                      onChange={(e) => handleFormChange('periodEnd', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumption & Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consumption & Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Consumption</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2260"
                      value={billForm.consumption}
                      onChange={(e) => handleFormChange('consumption', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      placeholder="e.g., kWh, cubic meters"
                      value={billForm.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.64"
                      value={billForm.rate}
                      onChange={(e) => handleFormChange('rate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Amount (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2640.00"
                    value={billForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={billForm.status} onValueChange={(value) => handleFormChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={billForm.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this bill..."
                    value={billForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditBillOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditBill}
                disabled={!billForm.utility || !billForm.provider || !billForm.billNumber || !billForm.amount}
                className="bg-black text-white hover:bg-gray-800"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}