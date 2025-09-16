import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { 
  Car,
  DollarSign, 
  TrendingUp,
  Calendar,
  Download,
  Plus,
  Search,
  Eye,
  Edit,
  X,
  Droplets,
  Calculator,
  Building,
 // Wallet,
  AlertTriangle
} from 'lucide-react';
import { useWashingBayManagement } from '../hooks/useWashingBayManagement';

// Initial form data
const initialEntryForm = {
  date: '',
  noOfVehicles: '',
  pricePerVehicle: '100',
  washingBayCommissionRate: '20',
  expenses: '',
  notes: '',
  totalSale: '',
  washingBayCommission: '',
  companyCommission: '',
  bankDeposit: '',
  balancing: ''
};

export function WashingBay() {
  const {
    // Data
    entries,
    statistics,
    analysis,
    //chartData,
    
    // State
    isLoading,
    isSubmitting,
    //connectionStatus,
    lastError,
    filters,
    
    // Actions
    createWashingBayEntry,
    updateWashingBayEntry,
    //deleteWashingBayEntry,
    exportWashingBayData,
    updateFilters,
    
    // Utilities
    formatCurrency,
   // calculateCommission,
   // calculateBankDeposit,
   // calculateBalancing
  } = useWashingBayManagement();
  
  // Modal states
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isViewEntryOpen, setIsViewEntryOpen] = useState(false);
  const [isEditEntryOpen, setIsEditEntryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [entryForm, setEntryForm] = useState(initialEntryForm);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = filters.search ? (
      entry.date.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.kodsonStatus.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.createdBy.toLowerCase().includes(filters.search.toLowerCase())
    ) : true;
    const matchesStatus = filters.status === 'all' || entry.kodsonStatus.toLowerCase() === filters.status?.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleFormChange = (field: string, value: string) => {
    setEntryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEntry = async () => {
    const success = await createWashingBayEntry(entryForm);
    if (success) {
      setEntryForm(initialEntryForm);
      setIsAddEntryOpen(false);
    }
  };

  const handleEditEntry = async () => {
    if (!selectedEntry) return;
    
    const success = await updateWashingBayEntry({
      ...entryForm,
      id: selectedEntry.id
    });
    
    if (success) {
      setEntryForm(initialEntryForm);
      setIsEditEntryOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleViewEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsViewEntryOpen(true);
  };

  const handleEditEntryClick = (entry: any) => {
    setSelectedEntry(entry);
    setEntryForm({
      date: entry.date,
      noOfVehicles: entry.noOfVehicles?.toString() ?? '',
      pricePerVehicle: entry.pricePerVehicle?.toString() ?? '',
      washingBayCommissionRate: entry.washingBayCommissionRate?.toString() ?? '',
      expenses: entry.expenses?.toString() ?? '',
      notes: entry.notes || '',
      totalSale: entry.totalSale?.toString() ?? '',
      washingBayCommission: entry.washingBayCommission?.toString() ?? '',
      companyCommission: entry.companyCommission?.toString() ?? '',
      bankDeposit: entry.bankDeposit?.toString() ?? '',
      balancing: entry.balancing?.toString() ?? ''
    });
    setIsEditEntryOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReport = async () => {
    await exportWashingBayData('csv');
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm font-medium">Loading washing bay data...</p>
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
          <h1 className="text-xl sm:text-2xl font-medium">Washing Bay Management</h1>
          <p className="text-sm text-muted-foreground">Track daily operations, commissions, and financial analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-sm font-medium"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button 
            onClick={() => setIsAddEntryOpen(true)}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-medium"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{statistics.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(statistics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Gross sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bay Commission</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{formatCurrency(statistics.totalWashingBayCommission)}</div>
            <p className="text-xs text-muted-foreground">Commission earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bank Deposits</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(statistics.totalBankDeposits)}</div>
            <p className="text-xs text-muted-foreground">Total deposited</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bank Deposit Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Bank Deposit Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm">TOTAL INCOME</span>
                <span className="font-bold text-sm">{formatCurrency(analysis.bankDepositAnalysis.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">LESS WAGES, EXP & KODSON</span>
                <span className="text-sm">{formatCurrency(analysis.bankDepositAnalysis.lessWagesExpKodson)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-sm">TOTAL EXPECTED BANK DEP.</span>
                <span className="font-bold text-sm">{formatCurrency(analysis.bankDepositAnalysis.totalExpectedBankDep)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ACTUAL AMOUNT DEPOSITED</span>
                <span className="text-sm">{formatCurrency(analysis.bankDepositAnalysis.actualAmountDeposited)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-green-600 text-sm">OVERAGE</span>
                <span className="font-bold text-green-600 underline text-sm">{formatCurrency(analysis.bankDepositAnalysis.overage)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Income Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm">TOTAL INCOME</span>
                <span className="font-bold text-sm">{formatCurrency(analysis.incomeAnalysis.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">LESS EXPENSES:</span>
                <span className="text-sm">{formatCurrency(analysis.incomeAnalysis.lessExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">DAILY WAGES</span>
                <span className="text-sm">{formatCurrency(analysis.incomeAnalysis.dailyWages)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">WATER</span>
                <span className="text-sm">{formatCurrency(analysis.incomeAnalysis.waterCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">LESS ELECT. PREPAID EXP.</span>
                <span className="text-sm">{formatCurrency(analysis.incomeAnalysis.electricityPrepaidExp)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-sm">NET INCOME/LOSS</span>
                <span className={`font-bold underline text-sm ${analysis.incomeAnalysis.netIncomeLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(analysis.incomeAnalysis.netIncomeLoss))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Washing Bay Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Washing Bay Entries</CardTitle>
              <p className="text-sm text-muted-foreground">Track daily operations, commissions, and financial data</p>
            </div>
            <p className="text-sm text-muted-foreground">{filteredEntries.length} of {entries.length} entries</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date, status, or staff member..."
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
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entries Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-sm font-medium">Date</TableHead>
                  <TableHead className="text-center text-sm font-medium">No of Vehicles</TableHead>
                  <TableHead className="text-center text-sm font-medium">Total Sale</TableHead>
                  <TableHead className="text-center text-sm font-medium">Bay Commission</TableHead>
                  <TableHead className="text-center text-sm font-medium">Company Commission</TableHead>
                  <TableHead className="text-center text-sm font-medium">Expenses</TableHead>
                  <TableHead className="text-center text-sm font-medium">Bank Deposit</TableHead>
                  <TableHead className="text-center text-sm font-medium">Balancing</TableHead>
                  <TableHead className="text-center text-sm font-medium">KODSON</TableHead>
                  <TableHead className="text-center text-sm font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{entry.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{entry.noOfVehicles}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{formatCurrency(entry.totalSale)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-purple-600 text-sm">{formatCurrency(entry.washingBayCommission)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{formatCurrency(entry.companyCommission)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{formatCurrency(entry.expenses)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-orange-600 text-sm">{formatCurrency(entry.bankDeposit)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-sm">{formatCurrency(entry.balancing)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(entry.kodsonStatus)}>
                        {entry.kodsonStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewEntry(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditEntryClick(entry)}
                          disabled={isSubmitting}
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

          {filteredEntries.length === 0 && (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No entries found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Washing Bay Entry
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddEntryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={entryForm.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Vehicles *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={entryForm.noOfVehicles}
                      onChange={(e) => handleFormChange('noOfVehicles', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price per Vehicle (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.pricePerVehicle}
                      onChange={(e) => handleFormChange('pricePerVehicle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Sale (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.totalSale}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bay Commission Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.washingBayCommissionRate}
                      onChange={(e) => handleFormChange('washingBayCommissionRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bay Commission (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.washingBayCommission}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Commission (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.companyCommission}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Expenses (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      value={entryForm.expenses}
                      onChange={(e) => handleFormChange('expenses', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Deposit (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.bankDeposit}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Balancing (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.balancing}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this entry..."
                    value={entryForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddEntryOpen(false)}
                disabled={isSubmitting}
                className="text-sm font-medium"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddEntry}
                disabled={isSubmitting || !entryForm.date || !entryForm.noOfVehicles}
                className="bg-black text-white hover:bg-gray-800 text-sm font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Add Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entry Modal */}
      <Dialog open={isViewEntryOpen} onOpenChange={setIsViewEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Entry Details - {selectedEntry?.date}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsViewEntryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6">
              {/* Entry Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entry Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{selectedEntry.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Vehicles</p>
                      <p className="font-medium">{selectedEntry.noOfVehicles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sale</p>
                      <p className="font-medium">€{selectedEntry.totalSale.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bay Commission</p>
                      <p className="font-medium text-purple-600">€{selectedEntry.washingBayCommission.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company Commission</p>
                      <p className="font-medium">€{selectedEntry.companyCommission.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedEntry.kodson)}>
                        {selectedEntry.kodson}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="font-medium">€{selectedEntry.expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Deposit</p>
                      <p className="font-medium text-orange-600">€{selectedEntry.bankDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balancing</p>
                      <p className="font-medium">€{selectedEntry.balancing.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Price/Vehicle</p>
                      <p className="font-medium">€{(selectedEntry.totalSale / selectedEntry.noOfVehicles).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsViewEntryOpen(false);
                    handleEditEntryClick(selectedEntry);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Entry Modal */}
      <Dialog open={isEditEntryOpen} onOpenChange={setIsEditEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Entry - {selectedEntry?.date}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsEditEntryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={entryForm.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Vehicles *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={entryForm.noOfVehicles}
                      onChange={(e) => handleFormChange('noOfVehicles', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price per Vehicle (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.pricePerVehicle}
                      onChange={(e) => handleFormChange('pricePerVehicle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Sale (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.totalSale}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bay Commission Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.washingBayCommissionRate}
                      onChange={(e) => handleFormChange('washingBayCommissionRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bay Commission (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.washingBayCommission}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Commission (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.companyCommission}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Expenses (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      value={entryForm.expenses}
                      onChange={(e) => handleFormChange('expenses', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Deposit (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.bankDeposit}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Balancing (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.balancing}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this entry..."
                    value={entryForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditEntryOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditEntry}
                disabled={!entryForm.date || !entryForm.noOfVehicles}
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