import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';
import { 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar,
  User,
  Filter,
  Loader2,
  Fuel,
  Building,
  Wifi,
  WifiOff,
  DollarSign
} from 'lucide-react';
import { usePriceApproval } from '../hooks/usePriceApproval';
import { KTC_STATIONS, FUEL_TYPES, STATUS_COLORS, PRIORITY_COLORS, VALIDATION_RULES } from '../constants/priceApprovalConstants';
import type { PriceChange } from '../types/productSharing';

export function PriceApproval() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  const {
    pendingChanges,
    historicalChanges,
    statistics,
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    processApproval,
    refreshData,
    updateFilters,
    canApprove
  } = usePriceApproval();
  
  // Modal states
  const [selectedChange, setSelectedChange] = useState<PriceChange | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [approvalReason, setApprovalReason] = useState('');

  // Format currency in Ghana Cedis
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('GH₵', '₵');
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority badge color
  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get price change color
  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-red-600' : 'text-green-600';
  };

  // Format station display with cutoff
  const formatStationDisplay = (stations: string[] | undefined) => {
    if (!stations || stations.length === 0) {
      return { displayText: '', allStationsText: '', hasMore: false };
    }
    
    const maxDisplayStations = 4;
    const displayStations = stations.slice(0, maxDisplayStations);
    const hasMore = stations.length > maxDisplayStations;
    
    const displayText = displayStations.join(', ') + (hasMore ? '...' : '');
    const allStationsText = stations.join(', ');
    
    return { displayText, allStationsText, hasMore };
  };

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedChange || !approvalAction || !approvalReason.trim()) return;
    
    // Validate approval reason length
    if (approvalReason.length < VALIDATION_RULES.MIN_APPROVAL_REASON_LENGTH) {
      toast.error('Approval reason too short', {
        description: `Please provide at least ${VALIDATION_RULES.MIN_APPROVAL_REASON_LENGTH} characters`
      });
      return;
    }
    
    if (approvalReason.length > VALIDATION_RULES.MAX_APPROVAL_REASON_LENGTH) {
      toast.error('Approval reason too long', {
        description: `Please keep reason under ${VALIDATION_RULES.MAX_APPROVAL_REASON_LENGTH} characters`
      });
      return;
    }
    
    const success = await processApproval(selectedChange.id, approvalAction, approvalReason);
    
    if (success) {
      closeApprovalModal();
    }
  };

  // Modal management
  const openApprovalModal = (change: PriceChange, action: 'APPROVE' | 'REJECT') => {
    setSelectedChange(change);
    setApprovalAction(action);
    setApprovalReason('');
    setApprovalModalOpen(true);
  };

  const closeApprovalModal = () => {
    setApprovalModalOpen(false);
    setSelectedChange(null);
    setApprovalAction(null);
    setApprovalReason('');
  };

  const openDetailsModal = (change: PriceChange) => {
    setSelectedChange(change);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedChange(null);
  };

  // Filter pending changes
  const filteredPendingChanges = pendingChanges.filter(change => {
    if (filters.station && filters.station !== 'All Stations' && change.station !== filters.station) {
      return false;
    }
    if (filters.fuelType && filters.fuelType !== 'All Types' && change.fuelType !== filters.fuelType) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!change.tankName.toLowerCase().includes(searchLower) &&
          !change.station.toLowerCase().includes(searchLower) &&
          !change.requestedBy.toLowerCase().includes(searchLower) &&
          !change.reason.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  // Filter historical changes
  const filteredHistoricalChanges = historicalChanges.filter(change => {
    if (filters.status && filters.status !== 'ALL' && change.status !== filters.status) {
      return false;
    }
    if (filters.station && filters.station !== 'All Stations' && change.station !== filters.station) {
      return false;
    }
    if (filters.fuelType && filters.fuelType !== 'All Types' && change.fuelType !== filters.fuelType) {
      return false;
    }  
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!change.tankName.toLowerCase().includes(searchLower) &&
          !change.station.toLowerCase().includes(searchLower) &&
          !change.requestedBy.toLowerCase().includes(searchLower) &&
          !change.reason.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">
            {canApprove ? 'Price Approval' : 'Price Changes'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            {canApprove 
              ? 'Review and approve fuel price changes across all KTC Energy stations'
              : 'View fuel price changes and approval status across all KTC Energy stations'
            }
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
              <span className="block mt-1 text-sm">
                Using cached data. Some features may be limited.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="responsive-grid">
        {canApprove && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-yellow-600">
                {statistics.pendingCount}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-normal">
                Requiring your approval
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">
              {statistics.approvedToday}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              Price changes approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-red-600">
              {statistics.rejectedToday}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              Price changes rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">
              {canApprove ? 'Affected Tanks' : 'Avg Price Change'}
            </CardTitle>
            {canApprove ? <Fuel className="h-4 w-4 text-muted-foreground" /> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium">
              {canApprove 
                ? statistics.totalAffectedTanks
                : statistics.averagePriceChange ? `${statistics.averagePriceChange.toFixed(1)}%` : '0%'
              }
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              {canApprove ? 'Tanks awaiting price updates' : 'Average price change'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Pending and Historical */}
      <Tabs defaultValue={canApprove ? "pending" : "historical"} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <TabsList className={`grid w-full max-w-md ${canApprove ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canApprove && (
              <TabsTrigger value="pending" className="text-sm sm:text-base font-medium">
                Pending ({filteredPendingChanges.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="historical" className="text-sm sm:text-base font-medium">
              Historical ({filteredHistoricalChanges.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search price changes..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 w-full sm:w-[250px] text-sm sm:text-base font-normal"
              />
            </div>
            <Select 
              value={filters.station || 'All Stations'} 
              onValueChange={(value) => updateFilters({ station: value })}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KTC_STATIONS.map(station => (
                  <SelectItem key={station} value={station}>{station}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.fuelType || 'All Types'} 
              onValueChange={(value) => updateFilters({ fuelType: value })}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pending Approvals Tab - Super Admin Only */}
        {canApprove && (
          <TabsContent value="pending" className="space-y-4">
            {filteredPendingChanges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg lg:text-xl font-medium">No pending price changes</h3>
                  <p className="text-muted-foreground text-sm sm:text-base font-normal">
                    {filters.station !== 'All Stations' || filters.fuelType !== 'All Types' || filters.search
                      ? 'No price changes match your current filters.'
                      : 'All price changes have been reviewed.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                    <Clock className="h-5 w-5" />
                    <span>Pending Price Changes</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base font-normal">
                    Review and approve price changes before they take effect
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table className="min-w-[1000px]">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-sm sm:text-base font-medium">Station</TableHead>
                          <TableHead className="text-sm sm:text-base font-medium">Product</TableHead>
                          <TableHead className="text-right text-sm sm:text-base font-medium">Price Change</TableHead>
                          <TableHead className="text-sm sm:text-base font-medium">Effective Date</TableHead>
                          <TableHead className="text-sm sm:text-base font-medium">Requested By</TableHead>
                          <TableHead className="text-center text-sm sm:text-base font-medium">Scope</TableHead>
                          <TableHead className="text-center text-sm sm:text-base font-medium">Priority</TableHead>
                          <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPendingChanges.map((change) => {
                          const stationDisplay = formatStationDisplay(change.targetStation);
                          
                          return (
                          <TableRow key={change.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <div className="text-sm sm:text-base font-medium">{change.tankName}</div>
                                <div className="text-muted-foreground text-xs sm:text-sm font-normal flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {stationDisplay.hasMore ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">{stationDisplay.displayText}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{stationDisplay.allStationsText}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <span>{stationDisplay.displayText}</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs sm:text-sm font-medium">
                                {change.fuelType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <div className="text-sm sm:text-base font-normal">
                                  {formatCurrency(change.currentPrice)} → {formatCurrency(change.newPrice)}
                                </div>
                                <div className={`text-xs font-medium ${getPriceChangeColor(change.priceDifference)}`}>
                                  {change.priceDifference >= 0 ? '+' : ''}{formatCurrency(change.priceDifference)}
                                  <span className="ml-1">
                                  {typeof change?.percentageChange === "number" ? (
                                    <>
                                      ({change.percentageChange >= 0 ? '+' : ''}
                                      {change.percentageChange.toFixed(1)}%)
                                    </>
                                  ) : (
                                    "(N/A)"
                                  )}
                                </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm sm:text-base font-normal">
                                  {formatDateTime(change.effectiveDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm sm:text-base font-normal">{change.requestedBy}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {change.updateScope === 'all_stations' ? 'All Stations' : 
                                   change.updateScope === 'current_station' ? 'Current Station' : 'Selected Tank'}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {change.totalAffectedTanks} tank{change.totalAffectedTanks !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {change.priority && (
                                <Badge className={getPriorityColor(change.priority)} variant="outline">
                                  {change.priority}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openDetailsModal(change)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canApprove && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => openApprovalModal(change, 'APPROVE')}
                                      title="Approve"
                                      disabled={isSubmitting}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => openApprovalModal(change, 'REJECT')}
                                      title="Reject"
                                      disabled={isSubmitting}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Historical Changes Tab */}
        <TabsContent value="historical" className="space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <Select 
              value={filters.status || 'ALL'} 
              onValueChange={(value) => updateFilters({ status: value as any })}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredHistoricalChanges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg lg:text-xl font-medium">No historical price changes</h3>
                <p className="text-muted-foreground text-sm sm:text-base font-normal">
                  {filters.status !== 'ALL' || filters.station !== 'All Stations' || filters.fuelType !== 'All Types' || filters.search
                    ? 'No historical changes match your current filters.'
                    : 'Historical price changes will appear here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                  <TrendingUp className="h-5 w-5" />
                  <span>Historical Price Changes</span>
                </CardTitle>
                <p className="text-muted-foreground text-sm sm:text-base font-normal">
                  View all processed price change requests
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm sm:text-base font-medium">Tank & Station</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Fuel Type</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Price Change</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Effective Date</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Status</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Processed By</TableHead>
                        <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistoricalChanges.map((change) => {
                        // Handle both single station string and station array for historical data
                        const stations = change.targetStation || (change.station ? [change.station] : []);
                        const stationDisplay = formatStationDisplay(stations);
                        
                        return (
                        <TableRow key={change.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="text-sm sm:text-base font-medium">{change.tankName}</div>
                              <div className="text-muted-foreground text-xs sm:text-sm font-normal flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {stationDisplay.hasMore ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help">{stationDisplay.displayText}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{stationDisplay.allStationsText}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span>{stationDisplay.displayText}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs sm:text-sm font-medium">
                              {change.fuelType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="space-y-1">
                              <div className="text-sm sm:text-base font-normal">
                                {formatCurrency(change.currentPrice)} → {formatCurrency(change.newPrice)}
                              </div>
                              <div className={`text-xs font-medium ${getPriceChangeColor(change.priceDifference)}`}>
                                {change.priceDifference >= 0 ? '+' : ''}{formatCurrency(change.priceDifference)}
                                <span className="ml-1">
                                  {typeof change?.percentageChange === "number" ? (
                                    <>
                                      ({change.percentageChange >= 0 ? '+' : ''}
                                      {change.percentageChange.toFixed(1)}%)
                                    </>
                                  ) : (
                                    "(N/A)"
                                  )}
                                </span>

                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm sm:text-base font-normal">
                                {formatDateTime(change.effectiveDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(change.status)} variant="outline">
                              {change.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm sm:text-base font-normal">
                                {change.status === 'APPROVED' ? change.approvedBy : change.rejectedBy}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openDetailsModal(change)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {selectedChange && (
        <Dialog open={approvalModalOpen} onOpenChange={closeApprovalModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                {approvalAction === 'APPROVE' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span>
                  {approvalAction === 'APPROVE' ? 'Approve' : 'Reject'} Price Change
                </span>
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base font-normal">
                {approvalAction === 'APPROVE' 
                  ? 'Confirm approval of this price change request'
                  : 'Provide a reason for rejecting this price change request'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Price Change Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm sm:text-base font-medium">{selectedChange.tankName}</div>
                    <div className="text-muted-foreground text-xs sm:text-sm font-normal">{selectedChange.station}</div>
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-sm font-medium">
                    {selectedChange.fuelType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal">Price Change:</span>
                  <div className="text-right">
                    <div className="text-sm font-normal">
                      {formatCurrency(selectedChange.currentPrice)} → {formatCurrency(selectedChange.newPrice)}
                    </div>
                    <div className={`text-xs font-medium ${getPriceChangeColor(selectedChange.priceDifference)}`}>
                      {selectedChange.priceDifference >= 0 ? '+' : ''}{formatCurrency(selectedChange.priceDifference)}
                      <span className="ml-1">
                        ({selectedChange.percentageChange >= 0 ? '+' : ''}{selectedChange.percentageChange.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>Reason:</strong> {selectedChange.reason}
                </div>
              </div>

              {/* Approval Reason Input */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">
                  {approvalAction === 'APPROVE' ? 'Approval Comments' : 'Rejection Reason'} *
                </Label>
                <Textarea
                  placeholder={
                    approvalAction === 'APPROVE' 
                      ? 'Provide comments for this approval...'
                      : 'Explain why this price change is being rejected...'
                  }
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="text-sm sm:text-base font-normal"
                  rows={3}
                />
                <div className="text-xs text-muted-foreground">
                  {approvalReason.length}/{VALIDATION_RULES.MAX_APPROVAL_REASON_LENGTH} characters
                  (minimum {VALIDATION_RULES.MIN_APPROVAL_REASON_LENGTH})
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={closeApprovalModal}
                disabled={isSubmitting}
                className="text-sm sm:text-base font-medium"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApprovalAction}
                disabled={
                  isSubmitting || 
                  !approvalReason.trim() || 
                  approvalReason.length < VALIDATION_RULES.MIN_APPROVAL_REASON_LENGTH
                }
                className={`text-sm sm:text-base font-medium ${
                  approvalAction === 'APPROVE' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {approvalAction === 'APPROVE' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {approvalAction === 'APPROVE' ? 'Approve' : 'Reject'} Change
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Modal */}
      {selectedChange && (
        <Dialog open={detailsModalOpen} onOpenChange={closeDetailsModal}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                <TrendingUp className="h-5 w-5" />
                <span>Price Change Details</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Tank Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tank:</strong> {selectedChange.tankName}</div>
                    <div><strong>Station:</strong> {selectedChange.station}</div>
                    <div><strong>Fuel Type:</strong> {selectedChange.fuelType}</div>
                    <div><strong>Update Scope:</strong> {
                      selectedChange.updateScope === 'all_stations' ? 'All Stations' : 
                      selectedChange.updateScope === 'current_station' ? 'Current Station' : 'Selected Tank'
                    }</div>
                    <div><strong>Affected Tanks:</strong> {selectedChange.totalAffectedTanks}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Price Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Current Price:</strong> {formatCurrency(selectedChange.currentPrice)}</div>
                    <div><strong>New Price:</strong> {formatCurrency(selectedChange.newPrice)}</div>
                    <div><strong>Price Difference:</strong> 
                      <span className={getPriceChangeColor(selectedChange.priceDifference)}>
                        {selectedChange.priceDifference >= 0 ? ' +' : ' '}{formatCurrency(selectedChange.priceDifference)}
                      </span>
                    </div>
                    <div><strong>Percentage Change:</strong>
                      <span className={getPriceChangeColor(selectedChange.priceDifference)}>
                        {selectedChange.percentageChange >= 0 ? ' +' : ' '}{selectedChange.percentageChange.toFixed(2)}%
                      </span>
                    </div>
                    <div><strong>Effective Date:</strong> {formatDateTime(selectedChange.effectiveDate)}</div>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Request Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Requested By:</strong> {selectedChange.requestedBy}</div>
                  <div><strong>Requested At:</strong> {formatDateTime(selectedChange.requestedAt)}</div>
                  <div><strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedChange.status)}`} variant="outline">
                      {selectedChange.status}
                    </Badge>
                  </div>
                  {selectedChange.priority && (
                    <div><strong>Priority:</strong>
                      <Badge className={`ml-2 ${getPriorityColor(selectedChange.priority)}`} variant="outline">
                        {selectedChange.priority}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Reason for Change</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedChange.reason}</p>
              </div>

              {/* Approval Information (if processed) */}
              {selectedChange.status !== 'PENDING' && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">
                    {selectedChange.status === 'APPROVED' ? 'Approval' : 'Rejection'} Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Processed By:</strong> {selectedChange.status === 'APPROVED' ? selectedChange.approvedBy : selectedChange.rejectedBy}</div>
                    <div><strong>Processed At:</strong> {formatDateTime(selectedChange.status === 'APPROVED' ? selectedChange.approvedAt! : selectedChange.rejectedAt!)}</div>
                  </div>
                  {selectedChange.approvalReason && (
                    <div className="space-y-2">
                      <strong>Comments:</strong>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedChange.approvalReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={closeDetailsModal} className="text-sm sm:text-base font-medium">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}