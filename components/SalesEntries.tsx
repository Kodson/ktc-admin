import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Clock, 
  CheckCircle2,
  //XCircle,
  Search,
  Eye,
  Edit,
  Download,
  PlusCircle,
  Calendar,
  Fuel,
  //TrendingUp,
  DollarSign,
  X,
  AlertTriangle,
  RefreshCw,
  Filter,
 // Package,
 // Gauge,
 // Building2,
  Loader2,
  Wifi,
  WifiOff,
  FileDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { StationIndicator } from './StationIndicator';
import { useSalesEntries } from '../hooks/useSalesEntries';
import { 
  FUEL_PRODUCTS,
  ENTRY_STATUS,
  STATUS_COLORS,
  EXPORT_FORMATS,
  formatCurrency,
  formatLiters,
  formatDate,
  formatDateTime
} from '../constants/salesEntriesConstants';
import type { SalesEntry } from '../types/salesEntries';

interface SalesEntriesProps {
  onViewChange: (view: string) => void;
}

export function SalesEntries({ onViewChange }: SalesEntriesProps) {
  //const { user } = useAuth();
  const { selectedStation } = useStation();
  
  const {
    entries,
    //statistics,
    isLoading,
    isSubmitting,
    isExporting,
    connectionStatus,
    lastError,
    filters,
    requestEditPermission,
    exportEntries,
    refreshData,
    updateFilters,
    canEdit,
    hasData
  } = useSalesEntries();

  // Modal states
  const [selectedEntry, setSelectedEntry] = useState<SalesEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Form states
  const [editRequestReason, setEditRequestReason] = useState('');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('EXCEL');
  const [includeDetails, setIncludeDetails] = useState(true);

  // Get status color
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Handle new sales entry
  const handleNewSalesEntry = () => {
    onViewChange('daily-sales-entry');
  };

  // Handle view details
  const handleViewDetails = (entry: SalesEntry) => {
    setSelectedEntry(entry);
    setShowDetailsModal(true);
  };

  // Handle edit request
  const handleEditRequest = (entry: SalesEntry) => {
    setSelectedEntry(entry);
    setEditRequestReason('');
    setShowEditRequestModal(true);
  };

  // Submit edit request
  const handleSubmitEditRequest = async () => {
    if (!selectedEntry || !editRequestReason.trim()) return;
    
    const success = await requestEditPermission(selectedEntry.id, editRequestReason);
    if (success) {
      setShowEditRequestModal(false);
      setSelectedEntry(null);
      setEditRequestReason('');
    }
  };

  // Handle export
  const handleExport = async () => {
    const success = await exportEntries(exportFormat, includeDetails);
    if (success) {
      setShowExportModal(false);
    }
  };

  // Close modals
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEntry(null);
  };

  const closeEditRequestModal = () => {
    setShowEditRequestModal(false);
    setSelectedEntry(null);
    setEditRequestReason('');
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      status: 'ALL',
      product: 'ALL',
      search: ''
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.status !== 'ALL',
    filters.product !== 'ALL',
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Sales Entries</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            {selectedStation?.name || 'Select a station'} - Manage and track daily sales entries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            {connectionStatus.connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  Connected {connectionStatus.responseTime && `(${connectionStatus.responseTime}ms)`}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-medium">Mock Mode</span>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="text-sm sm:text-base font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {lastError && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Connection Issue:</strong> {lastError.message}
            {!connectionStatus.connected && (
              <span className="block mt-1 text-sm font-normal">
                Using cached data. Some features may be limited.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Station Indicator */}
      <StationIndicator />

      {/* Stats Cards */}
      <div className="responsive-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{statistics.totalEntries}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">All submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-orange-600">{statistics.pendingValidation}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Need validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">{statistics.approvedEntries}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-blue-600">
              {/* {formatCurrency(statistics.totalSalesValue)} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Sales revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Entries Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
                Sales Entries - {selectedStation?.name || 'No Station Selected'}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Track the status and details of daily sales entries
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              {entries.length} entries
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div></div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={!hasData || isExporting}
                className="text-sm sm:text-base font-medium"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
              <Button 
                onClick={handleNewSalesEntry}
                size="sm"
                className="text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product, date, or entered by..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10 text-sm sm:text-base font-normal"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="text-sm sm:text-base font-medium"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs font-medium">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm sm:text-base font-medium"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Expandable Filters Panel */}
            {showFiltersPanel && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select 
                    value={filters.status || 'ALL'} 
                    onValueChange={(value) => updateFilters({ status: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      {Object.entries(ENTRY_STATUS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <Select 
                    value={filters.product || 'ALL'} 
                    onValueChange={(value) => updateFilters({ product: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Products</SelectItem>
                      {FUEL_PRODUCTS.slice(1).map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                      className="text-sm font-normal"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilters({ dateTo: e.target.value })}
                      className="text-sm font-normal"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sales Entries Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-sm sm:text-base font-medium">Date & Product</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Sales Volume</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Sales Value</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Status</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Entered By</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-muted-foreground text-xs sm:text-sm font-normal flex items-center">
                          <Fuel className="h-3 w-3 mr-1" />
                          {entry.product}
                        </div>
                        {entry.editRequested && (
                          <Badge variant="outline" className="text-xs font-medium bg-yellow-50 text-yellow-700">
                            Edit Requested
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">
                          {formatLiters(entry.salesL)}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          Rate: {formatCurrency(entry.rate)}/L
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">
                          {formatCurrency(entry.value)}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          Cash: {formatCurrency(entry.cashSales)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(entry.status)} variant="outline">
                        {ENTRY_STATUS[entry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{entry.enteredBy}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {formatDateTime(entry.enteredAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (entry.status === 'SUBMITTED' || entry.status === 'VALIDATED') && !entry.editRequested && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditRequest(entry)}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">No entries found</h3>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : selectedStation
                  ? 'No sales entries have been submitted for this station yet.'
                  : 'Please select a station to view sales entries.'
                }
              </p>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4 text-sm sm:text-base font-medium"
                >
                  Clear all filters
                </Button>
              )}
              {selectedStation && entries.length === 0 && (
                <Button 
                  onClick={handleNewSalesEntry}
                  className="mt-4 text-sm sm:text-base font-medium"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Entry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={closeDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Sales Entry Details - {selectedEntry?.date && formatDate(selectedEntry.date)}</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Comprehensive view of the daily sales entry for {selectedEntry?.product}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary" className="text-sm sm:text-base font-medium">Summary</TabsTrigger>
              <TabsTrigger value="stock" className="text-sm sm:text-base font-medium">Stock</TabsTrigger>
              <TabsTrigger value="financial" className="text-sm sm:text-base font-medium">Financial</TabsTrigger>
              <TabsTrigger value="audit" className="text-sm sm:text-base font-medium">Audit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 sm:space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Entry Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Product:</Label>
                      <p className="font-medium">{selectedEntry?.product}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date:</Label>
                      <p className="font-medium">{selectedEntry?.date && formatDate(selectedEntry.date)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Sales Volume:</Label>
                      <p className="font-medium">{selectedEntry && formatLiters(selectedEntry.salesL)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Sales Value:</Label>
                      <p className="font-medium">{selectedEntry && formatCurrency(selectedEntry.value)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status:</Label>
                      <Badge className={getStatusColor(selectedEntry?.status || '')} variant="outline">
                        {selectedEntry?.status && ENTRY_STATUS[selectedEntry.status]}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Entered By:</Label>
                      <p className="font-medium">{selectedEntry?.enteredBy}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Rate per Liter:</Label>
                      <p className="font-medium">{selectedEntry && formatCurrency(selectedEntry.rate)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cash Sales:</Label>
                      <p className="font-medium">{selectedEntry && formatCurrency(selectedEntry.cashSales)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Credit Sales:</Label>
                      <p className="font-medium">{selectedEntry && formatCurrency(selectedEntry.creditSales)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bank Lodgement:</Label>
                      <p className="font-medium">{selectedEntry && formatCurrency(selectedEntry.bankLodgement)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cash Variance:</Label>
                      <p className={`font-medium ${
                        selectedEntry && Math.abs(selectedEntry.cashToBank - selectedEntry.bankLodgement) <= 100
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedEntry && formatCurrency(Math.abs(selectedEntry.cashToBank - selectedEntry.bankLodgement))}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Stock Difference:</Label>
                      <p className={`font-medium ${
                        selectedEntry?.differenceL === 0 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedEntry && formatLiters(selectedEntry.differenceL)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stock" className="space-y-4 sm:space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Stock Movement & Readings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Stock Levels (Liters)</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Opening Stock:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.openSL)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Supply Received:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.supply)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Overage/Shortage:</span>
                        <span className={`text-sm font-medium ${
                          selectedEntry?.overageShortageL === 0 ? 'text-green-600' : 
                          (selectedEntry?.overageShortageL || 0) > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {selectedEntry && formatLiters(selectedEntry.overageShortageL)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Available Stock:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.availableL)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Closing Stock:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.closingSL)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Sales Check:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.checkL)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Meter Readings</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Opening Reading:</span>
                        <span className="text-sm font-medium">{selectedEntry?.openSR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Closing Reading:</span>
                        <span className="text-sm font-medium">{selectedEntry?.closingSR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Return to Tank:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.returnTT)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Sales Volume:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatLiters(selectedEntry.salesL)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Difference:</span>
                        <span className={`text-sm font-medium ${
                          selectedEntry?.differenceL === 0 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {selectedEntry && formatLiters(selectedEntry.differenceL)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4 sm:space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Financial Breakdown</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Sales & Revenue</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Rate per Liter:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.rate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Total Sales Value:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.value)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Cash Sales:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.cashSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Credit Sales:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.creditSales)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Cash Management</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Advances Given:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.advances)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Shortage/Mobile Money:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.shortageMomo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Cash Available:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.cashAvailable)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Repayments:</span>
                        <span className="text-sm font-medium">
                          {selectedEntry && formatCurrency((selectedEntry.repaymentShortageMomo || 0) + (selectedEntry.repaymentAdvances || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">From Debtors:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.receivedFromDebtors)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Cash to Bank:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.cashToBank)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Bank Lodgement:</span>
                        <span className="text-sm font-medium">{selectedEntry && formatCurrency(selectedEntry.bankLodgement)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-4 sm:space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Audit Trail</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Entered By:</Label>
                      <p className="font-medium">{selectedEntry?.enteredBy}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Entered At:</Label>
                      <p className="font-medium">{selectedEntry?.enteredAt && formatDateTime(selectedEntry.enteredAt)}</p>
                    </div>
                    {selectedEntry?.submittedAt && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Submitted At:</Label>
                          <p className="font-medium">{formatDateTime(selectedEntry.submittedAt)}</p>
                        </div>
                      </>
                    )}
                    {selectedEntry?.validatedBy && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Validated By:</Label>
                          <p className="font-medium">{selectedEntry.validatedBy}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Validated At:</Label>
                          <p className="font-medium">{selectedEntry.validatedAt && formatDateTime(selectedEntry.validatedAt)}</p>
                        </div>
                      </>
                    )}
                    {selectedEntry?.approvedBy && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Approved By:</Label>
                          <p className="font-medium">{selectedEntry.approvedBy}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Approved At:</Label>
                          <p className="font-medium">{selectedEntry.approvedAt && formatDateTime(selectedEntry.approvedAt)}</p>
                        </div>
                      </>
                    )}
                    {selectedEntry?.rejectedBy && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Rejected By:</Label>
                          <p className="font-medium">{selectedEntry.rejectedBy}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Rejected At:</Label>
                          <p className="font-medium">{selectedEntry.rejectedAt && formatDateTime(selectedEntry.rejectedAt)}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {selectedEntry?.rejectionReason && (
                    <div>
                      <Label className="text-muted-foreground">Rejection Reason:</Label>
                      <p className="text-sm font-normal bg-red-50 p-3 rounded-lg border border-red-200 text-red-800 mt-1">
                        {selectedEntry.rejectionReason}
                      </p>
                    </div>
                  )}
                  
                  {selectedEntry?.editRequested && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Edit Request:</Label>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800">
                          Requested by {selectedEntry.editRequestedBy} on {selectedEntry.editRequestedAt && formatDateTime(selectedEntry.editRequestedAt)}
                        </div>
                        {selectedEntry.editRequestReason && (
                          <p className="text-sm font-normal text-yellow-700 mt-1">
                            {selectedEntry.editRequestReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry?.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes:</Label>
                      <p className="text-sm font-normal bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-800 mt-1">
                        {selectedEntry.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button onClick={closeDetailsModal} className="text-sm sm:text-base font-medium">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog open={showEditRequestModal} onOpenChange={closeEditRequestModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
              Request Edit Permission
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Request permission to edit the sales entry for {selectedEntry?.product} on {selectedEntry?.date && formatDate(selectedEntry.date)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">
                Reason for Edit Request *
              </Label>
              <Textarea
                placeholder="Please explain why you need to edit this entry..."
                value={editRequestReason}
                onChange={(e) => setEditRequestReason(e.target.value)}
                className="text-sm sm:text-base font-normal"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={closeEditRequestModal}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEditRequest}
              disabled={isSubmitting || !editRequestReason.trim()}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
              Export Sales Entries
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Export sales entries data for {selectedStation?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPORT_FORMATS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-details"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="include-details" className="text-sm sm:text-base font-medium">
                Include detailed financial breakdown
              </Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="text-sm sm:text-base font-medium"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}