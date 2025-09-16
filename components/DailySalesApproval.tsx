import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { 
  Search,
  Calendar,
  MapPin,
  Fuel,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Building,
  Shield,
  RefreshCw,
  Filter,
  X,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { StationIndicator } from './StationIndicator';
import { useSalesEntries } from '../hooks/useSalesEntries';
import { 
  FUEL_PRODUCTS,
  ENTRY_STATUS,
  STATUS_COLORS,
  formatCurrency,
  formatLiters,
  DAILY_SALES_API,
  DAILY_SALES_API_CONFIG
} from '../constants/dailySalesConstants';
import { 
  formatDate,
  formatDateTime
} from '../constants/salesEntriesConstants';
import type { SalesEntry } from '../types/salesEntries';

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

interface ModalState {
  viewDetails: boolean;
  approve: boolean;
  reject: boolean;
  bulkApprove: boolean;
  bulkReject: boolean;
}

interface ApprovalAction {
  type: 'APPROVE' | 'REJECT';
  entryId: string;
  reason?: string;
  comments?: string;
  requiredActions?: string;
}

export function DailySalesApproval() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  const {
    entries,
    statistics,
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    refreshData,
    updateFilters,
    hasData
  } = useSalesEntries();
  
  // Filter entries to show only those needing approval (VALIDATED status)
  const pendingEntries = entries.filter(entry => entry.status === 'VALIDATED');
  
  // Modal states
  const [selectedEntry, setSelectedEntry] = useState<SalesEntry | null>(null);
  const [modals, setModals] = useState<ModalState>({
    viewDetails: false,
    approve: false,
    reject: false,
    bulkApprove: false,
    bulkReject: false
  });
  
  // Filter states
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  // Form states
  const [approvalForm, setApprovalForm] = useState({
    notes: '',
    sendNotification: true
  });

  const [rejectionForm, setRejectionForm] = useState({
    reason: '',
    comments: '',
    requiredActions: ''
  });

  // Apply additional filtering on pending entries
  const filteredEntries = pendingEntries.filter(entry => {
    const matchesSearch = filters.search ? (
      entry.product.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.enteredBy.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.date.includes(filters.search)
    ) : true;
    
    const matchesProduct = filters.product === 'ALL' || entry.product === filters.product;
    
    return matchesSearch && matchesProduct;
  });

  const openModal = (modalName: keyof ModalState, entry?: SalesEntry) => {
    if (entry) setSelectedEntry(entry);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, entryId]);
    } else {
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleApprove = async () => {
    if (!selectedEntry) return;
    
    try {
      // Construct the API endpoint using a similar pattern to VALIDATE_ENTRY
       const endpoint = `${DAILY_SALES_API.BASE_URL}${DAILY_SALES_API.ENDPOINTS.APPROVE_ENTRY.replace(':id', selectedEntry.id)}`;
      
      console.log('Approving entry via API:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          entryId: selectedEntry.id,
          approvedBy: user?.name || 'Current User',
          approvedAt: new Date().toISOString(),
          status: 'APPROVED',
          //approvalNotes: approvalForm.notes
        }),
        signal: AbortSignal.timeout(DAILY_SALES_API_CONFIG.TIMEOUT)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Approval successful:', result);
      
      // Show success message
      toast.success('Entry approved successfully!', {
        description: `${selectedEntry.product} entry for ${selectedEntry.stationName} has been approved.`
      });
      
    } catch (error) {
      console.warn('API approval failed, using mock approval:', error);
      
      // Show error for actual API failures (not just fallback to mock)
      if (error instanceof Error && error.message.includes('API Error')) {
        toast.error('Approval failed', {
          description: error.message
        });
        closeModal('approve');
        setApprovalForm({ notes: '', sendNotification: true });
        return;
      }
      
      // Fallback to mock approval action
      const action: ApprovalAction = {
        type: 'APPROVE',
        entryId: selectedEntry.id
      };
      
      console.log('Mock approving entry:', action);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show mock success message
      toast.success('Entry approved successfully! (Mock Mode)', {
        description: `${selectedEntry.product} entry for ${selectedEntry.station} has been approved locally.`
      });
    }
    
    closeModal('approve');
    setApprovalForm({ notes: '', sendNotification: true });
    
    // Refresh data to show updated status
    refreshData();
  };

  const handleReject = async () => {
    if (!selectedEntry || !rejectionForm.reason || !rejectionForm.comments) return;
    
    try {
      // Construct the API endpoint using a similar pattern to VALIDATE_ENTRY
      const endpoint = `${DAILY_SALES_API.BASE_URL}/dailysales/${selectedEntry.id}/reject`;
      
      console.log('Rejecting entry via API:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          entryId: selectedEntry.id,
          rejectedBy: user?.name || 'Current User',
          rejectedAt: new Date().toISOString(),
          status: 'REJECTED',
          rejectionReason: rejectionForm.reason,
          rejectionComments: rejectionForm.comments,
          requiredActions: rejectionForm.requiredActions
        }),
        signal: AbortSignal.timeout(DAILY_SALES_API_CONFIG.TIMEOUT)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Rejection successful:', result);
      
      // Show success message
      toast.success('Entry rejected successfully!', {
        description: `${selectedEntry.product} entry for ${selectedEntry.station} has been rejected and sent back for corrections.`
      });
      
    } catch (error) {
      console.warn('API rejection failed, using mock rejection:', error);
      
      // Show error for actual API failures (not just fallback to mock)
      if (error instanceof Error && error.message.includes('API Error')) {
        toast.error('Rejection failed', {
          description: error.message
        });
        closeModal('reject');
        setRejectionForm({ reason: '', comments: '', requiredActions: '' });
        return;
      }
      
      // Fallback to mock rejection action
      const action: ApprovalAction = {
        type: 'REJECT',
        entryId: selectedEntry.id,
        reason: rejectionForm.reason,
        comments: rejectionForm.comments,
        requiredActions: rejectionForm.requiredActions
      };
      
      console.log('Mock rejecting entry:', action);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show mock success message
      toast.success('Entry rejected successfully! (Mock Mode)', {
        description: `${selectedEntry.product} entry for ${selectedEntry.station} has been rejected locally and sent back for corrections.`
      });
    }
    
    closeModal('reject');
    setRejectionForm({ reason: '', comments: '', requiredActions: '' });
    
    // Refresh data to show updated status
    refreshData();
  };

  // Get status color using the unified constants
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      status: 'ALL',
      product: 'ALL',
      search: ''
    });
  };

  // Count active filters (excluding status since we're always filtering for VALIDATED)
  const activeFiltersCount = [
    filters.product !== 'ALL',
    filters.search
  ].filter(Boolean).length;

  // Calculate approval metrics from the current data
  const approvalMetrics = {
    pendingApproval: pendingEntries.length,
    totalValue: pendingEntries.reduce((sum, entry) => sum + entry.value, 0),
    todaysValidations: pendingEntries.filter(entry => {
      const today = new Date().toISOString().split('T')[0];
      return entry.validatedAt?.split('T')[0] === today;
    }).length,
    stations: [...new Set(pendingEntries.map(entry => entry.station))].length
  };

  const allSelected = filteredEntries.length > 0 && selectedEntries.length === filteredEntries.length;
  const someSelected = selectedEntries.length > 0 && selectedEntries.length < filteredEntries.length;

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Sales Approval</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            Review and approve validated daily sales entries (General Manager Level)
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

      {/* Overview Metrics */}
      <div className="responsive-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Pending Approval</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-blue-600">{approvalMetrics.pendingApproval}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{formatCurrency(approvalMetrics.totalValue)}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Pending value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Today's Validations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{approvalMetrics.todaysValidations}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Validated today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Active Stations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{approvalMetrics.stations}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">With pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Entries Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Validated Entries Awaiting Approval</CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                Review and approve validated daily sales entries
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              {filteredEntries.length} entries
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Entry Count and Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredEntries.length} of {pendingEntries.length} entries
              {selectedEntries.length > 0 && (
                <span className="ml-4">
                  {selectedEntries.length} selected
                </span>
              )}
            </div>
            {selectedEntries.length > 0 && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base font-medium"
                  onClick={() => openModal('bulkApprove')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 text-sm sm:text-base font-medium"
                  onClick={() => openModal('bulkReject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            )}
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      indeterminate={someSelected}
                    />
                  </TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">Date & Product</TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">Station</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Sales Volume</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Sales Value</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Status</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Validated By</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                      />
                    </TableCell>
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {entry.station}
                        </div>
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
                        <div className="text-sm font-medium">{entry.validatedBy || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {entry.validatedAt && formatDateTime(entry.validatedAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => openModal('viewDetails', entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() => openModal('approve', entry)}
                          disabled={isSubmitting}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => openModal('reject', entry)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="h-4 w-4" />
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
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">No entries found</h3>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : selectedStation
                  ? 'All validated entries have been approved or no entries match your criteria.'
                  : 'Please select a station to view entries awaiting approval.'
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={modals.viewDetails} onOpenChange={() => closeModal('viewDetails')}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Sales Entry Details - {selectedEntry?.date && formatDate(selectedEntry.date)}</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Comprehensive view of the validated daily sales entry for {selectedEntry?.product}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base font-medium">Station</Label>
                  <p className="text-sm sm:text-base font-normal mt-1">{selectedEntry.stationName}</p>
                </div>
                <div>
                  <Label className="text-sm sm:text-base font-medium">Product</Label>
                  <p className="text-sm sm:text-base font-normal mt-1">{selectedEntry.product}</p>
                </div>
                <div>
                  <Label className="text-sm sm:text-base font-medium">Date</Label>
                  <p className="text-sm sm:text-base font-normal mt-1">{formatDate(selectedEntry.date)}</p>
                </div>
                <div>
                  <Label className="text-sm sm:text-base font-medium">Entered By</Label>
                  <p className="text-sm sm:text-base font-normal mt-1">{selectedEntry.enteredBy}</p>
                </div>
              </div>

              <Separator />

              {/* Validation Information */}
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-medium mb-3">Validation Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Validated By</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{selectedEntry.validatedBy || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Validation Date</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">
                      {selectedEntry.validatedAt ? formatDateTime(selectedEntry.validatedAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sales Information */}
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-medium mb-3">Sales Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Sales Volume</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatLiters(selectedEntry.salesL)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Rate per Liter</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatCurrency(selectedEntry.rate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Total Value</Label>
                    <p className="text-sm sm:text-base font-normal mt-1 font-medium">{formatCurrency(selectedEntry.value)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Cash Sales</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatCurrency(selectedEntry.cashSales)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stock Information */}
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-medium mb-3">Stock Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Opening Stock</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatLiters(selectedEntry.openSL)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Closing Stock</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatLiters(selectedEntry.closingSL)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Supply</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatLiters(selectedEntry.supply)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Difference</Label>
                    <p className={`text-sm sm:text-base font-normal mt-1 ${
                      selectedEntry.differenceL === 0 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {formatLiters(selectedEntry.differenceL)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-medium mb-3">Financial Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Credit Sales</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatCurrency(selectedEntry.creditSales)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Bank Lodgement</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatCurrency(selectedEntry.bankLodgement)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Cash to Bank</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{formatCurrency(selectedEntry.cashToBank)}</p>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Cash Variance</Label>
                    <p className={`text-sm sm:text-base font-normal mt-1 font-medium ${
                      Math.abs(selectedEntry.cashToBank - selectedEntry.bankLodgement) <= 100
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(selectedEntry.cashToBank - selectedEntry.bankLodgement))}
                    </p>
                  </div>
                </div>
              </div>

              {selectedEntry.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Notes</Label>
                    <p className="text-sm sm:text-base font-normal mt-1">{selectedEntry.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('viewDetails')} className="text-sm sm:text-base font-medium">
              Close
            </Button>
            {selectedEntry && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50 text-sm sm:text-base font-medium"
                  onClick={() => {
                    closeModal('viewDetails');
                    openModal('reject', selectedEntry);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base font-medium"
                  onClick={() => {
                    closeModal('viewDetails');
                    openModal('approve', selectedEntry);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Entry
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Approve Modal */}
      <Dialog open={modals.approve} onOpenChange={() => closeModal('approve')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Sales Entry</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              {selectedEntry && `Approve the validated sales entry for ${selectedEntry.stationName} on ${formatDate(selectedEntry.date)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEntry && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Product:</span>
                    <div className="text-sm sm:text-base font-medium">{selectedEntry.product}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Validated By:</span>
                    <div className="text-sm sm:text-base font-medium">{selectedEntry.validatedBy || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Sales Volume:</span>
                    <div className="text-sm sm:text-base font-medium">{formatLiters(selectedEntry.salesL)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Sales Value:</span>
                    <div className="text-sm sm:text-base font-medium">{formatCurrency(selectedEntry.value)}</div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="approvalNotes" className="text-sm sm:text-base font-medium">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes or comments for this approval..."
                value={approvalForm.notes}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendNotification"
                checked={approvalForm.sendNotification}
                onCheckedChange={(checked) => setApprovalForm(prev => ({ ...prev, sendNotification: !!checked }))}
              />
              <Label htmlFor="sendNotification" className="text-sm font-medium">
                Send notification to station manager
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('approve')} className="text-sm sm:text-base font-medium">
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base font-medium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Reject Modal */}
      <Dialog open={modals.reject} onOpenChange={() => closeModal('reject')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject Sales Entry</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              {selectedEntry && `Reject the validated sales entry for ${selectedEntry.stationName} on ${formatDate(selectedEntry.date)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEntry && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Sales Volume:</span>
                    <div className="text-sm sm:text-base font-medium">{formatLiters(selectedEntry.salesL)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm sm:text-base font-normal">Sales Value:</span>
                    <div className="text-sm sm:text-base font-medium">{formatCurrency(selectedEntry.value)}</div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="reason" className="text-sm sm:text-base font-medium">Reason for Rejection</Label>
              <Select value={rejectionForm.reason} onValueChange={(value) => setRejectionForm(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy-violation">Policy Violation</SelectItem>
                  <SelectItem value="discrepancy-found">Discrepancy Found</SelectItem>
                  <SelectItem value="incomplete-validation">Incomplete Validation</SelectItem>
                  <SelectItem value="requires-review">Requires Further Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments" className="text-sm sm:text-base font-medium">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Explain the reason for rejection and required corrections..."
                value={rejectionForm.comments}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, comments: e.target.value }))}
                className="text-sm sm:text-base font-normal"
                required
              />
            </div>
            <div>
              <Label htmlFor="requiredActions" className="text-sm sm:text-base font-medium">Required Actions</Label>
              <Textarea
                id="requiredActions"
                placeholder="List specific actions that need to be taken..."
                value={rejectionForm.requiredActions}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, requiredActions: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('reject')} className="text-sm sm:text-base font-medium">
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              disabled={!rejectionForm.reason || !rejectionForm.comments || isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Modal */}
      <Dialog open={modals.bulkApprove} onOpenChange={() => closeModal('bulkApprove')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Selected Entries</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to approve {selectedEntries.length} selected entries?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm">
                <div className="text-sm sm:text-base font-medium mb-2">Selected Entries:</div>
                {selectedEntries.map(id => {
                  const entry = pendingEntries.find(e => e.id === id);
                  return entry ? (
                    <div key={id} className="flex justify-between py-1">
                      <span className="text-sm sm:text-base font-normal">{entry.stationName}</span>
                      <span className="text-sm sm:text-base font-medium">{formatCurrency(entry.value)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="bulkApprovalNotes" className="text-sm sm:text-base font-medium">Approval Notes (Optional)</Label>
              <Textarea
                id="bulkApprovalNotes"
                placeholder="Add any notes or comments for these approvals..."
                value={approvalForm.notes}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulkSendNotification"
                checked={approvalForm.sendNotification}
                onCheckedChange={(checked) => setApprovalForm(prev => ({ ...prev, sendNotification: !!checked }))}
              />
              <Label htmlFor="bulkSendNotification" className="text-sm font-medium">
                Send notifications to station managers
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('bulkApprove')} className="text-sm sm:text-base font-medium">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Implement bulk approve logic
                console.log('Bulk approve entries:', selectedEntries);
                setSelectedEntries([]);
                closeModal('bulkApprove');
                setApprovalForm({ notes: '', sendNotification: true });
                refreshData();
              }} 
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base font-medium"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedEntries.length} Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Modal */}
      <Dialog open={modals.bulkReject} onOpenChange={() => closeModal('bulkReject')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject Selected Entries</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to reject {selectedEntries.length} selected entries?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm">
                <div className="text-sm sm:text-base font-medium mb-2">Selected Entries:</div>
                {selectedEntries.map(id => {
                  const entry = pendingEntries.find(e => e.id === id);
                  return entry ? (
                    <div key={id} className="flex justify-between py-1">
                      <span className="text-sm sm:text-base font-normal">{entry.stationName}</span>
                      <span className="text-sm sm:text-base font-medium">{formatCurrency(entry.value)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="bulkReason" className="text-sm sm:text-base font-medium">Reason for Rejection</Label>
              <Select value={rejectionForm.reason} onValueChange={(value) => setRejectionForm(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy-violation">Policy Violation</SelectItem>
                  <SelectItem value="discrepancy-found">Discrepancy Found</SelectItem>
                  <SelectItem value="incomplete-validation">Incomplete Validation</SelectItem>
                  <SelectItem value="requires-review">Requires Further Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulkComments" className="text-sm sm:text-base font-medium">Comments</Label>
              <Textarea
                id="bulkComments"
                placeholder="Explain the reason for rejection and required corrections..."
                value={rejectionForm.comments}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, comments: e.target.value }))}
                className="text-sm sm:text-base font-normal"
                required
              />
            </div>
            <div>
              <Label htmlFor="bulkRequiredActions" className="text-sm sm:text-base font-medium">Required Actions</Label>
              <Textarea
                id="bulkRequiredActions"
                placeholder="List specific actions that need to be taken..."
                value={rejectionForm.requiredActions}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, requiredActions: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('bulkReject')} className="text-sm sm:text-base font-medium">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Implement bulk reject logic
                console.log('Bulk reject entries:', selectedEntries, rejectionForm);
                setSelectedEntries([]);
                closeModal('bulkReject');
                setRejectionForm({ reason: '', comments: '', requiredActions: '' });
                refreshData();
              }} 
              variant="destructive"
              disabled={!rejectionForm.reason || !rejectionForm.comments}
              className="text-sm sm:text-base font-medium"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject {selectedEntries.length} Entries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}