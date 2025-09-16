import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Search,
  Eye,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Building2,
  Loader2,
  Wifi,
  WifiOff,
  DollarSign,
  Share2,
  ArrowLeftRight,
  Zap,
  Filter,
  X,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { StationIndicator } from './StationIndicator';
import { useSupplyManagement } from '../hooks/useSupplyManagement';
import { 
  FUEL_PRODUCTS, 
  STATUS_COLORS, 
  PRIORITY_COLORS, 
  SUPPLY_STATUS,
  PRIORITY_LEVELS,
  formatCurrency,
  formatLiters,
  calculateProfitMargin
} from '../constants/supplyConstants';
import type { ProductSharingSupply } from '../types/supply';

export function SupplyManagement() {
  const { user } = useAuth();
  const { selectedStation } = useStation();
  
  const {
    supplies,
    statistics,
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    confirmSupplyReceipt,
    refreshData,
    updateFilters,
    calculateVariance,
    pendingSupplies,
    confirmedSupplies,
    receivedSupplies,
    emergencySupplies
  } = useSupplyManagement();
  
  // Modal states
  const [selectedSupply, setSelectedSupply] = useState<ProductSharingSupply | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Confirmation form state
  const [confirmData, setConfirmData] = useState({
    qtyR: '',
    overage: '',
    shortage: '',
    notes: ''
  });

  // Get status color
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Handle view supply details
  const handleViewDetails = (supply: ProductSharingSupply) => {
    setSelectedSupply(supply);
    setShowDetailsModal(true);
  };

  // Handle confirm supply receipt
  const handleConfirmSupply = (supply: ProductSharingSupply) => {
    setSelectedSupply(supply);
    setConfirmData({
      qtyR: supply.qty.toString(),
      overage: '',
      shortage: '',
      notes: ''
    });
    setShowConfirmModal(true);
  };

  // Handle confirm receipt submission
  const handleConfirmReceipt = async () => {
    if (!selectedSupply) return;
    
    const qtyReceived = parseFloat(confirmData.qtyR);
    if (isNaN(qtyReceived) || qtyReceived <= 0) {
      return;
    }
    
    const variance = qtyReceived - selectedSupply.qty;
    const overage = variance > 0 ? variance : (confirmData.overage ? parseFloat(confirmData.overage) : null);
    const shortage = variance < 0 ? Math.abs(variance) : (confirmData.shortage ? parseFloat(confirmData.shortage) : null);
    
    const success = await confirmSupplyReceipt(selectedSupply.id, {
      qtyR: qtyReceived,
      overage,
      shortage,
      notes: confirmData.notes,
      product: selectedSupply.product,
      station: selectedStation?.name || 'Unknown',

    });
    
    if (success) {
      closeConfirmModal();
    }
  };

  // Close modals
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSupply(null);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedSupply(null);
    setConfirmData({
      qtyR: '',
      overage: '',
      shortage: '',
      notes: ''
    });
  };

  // Calculate variance for current confirm data
  const currentVariance = selectedSupply && confirmData.qtyR 
    ? calculateVariance(selectedSupply.qty, parseFloat(confirmData.qtyR))
    : null;

  // Filter supplies based on current filters
  const filteredSupplies = supplies.filter(supply => {
    if (filters.status && filters.status !== 'ALL' && supply.status !== filters.status) {
      return false;
    }
    if (filters.product && filters.product !== 'ALL' && supply.product !== filters.product) {
      return false;
    }
    if (filters.priority && filters.priority !== 'ALL' && supply.priority !== filters.priority) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!supply.product.toLowerCase().includes(searchLower) &&
          !supply.fromStationName.toLowerCase().includes(searchLower) &&
          !supply.productSharingRequestId.toLowerCase().includes(searchLower) &&
          !supply.createdBy.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      status: 'ALL',
      product: 'ALL',
      priority: 'ALL',
      search: ''
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.status !== 'ALL',
    filters.product !== 'ALL',
    filters.priority !== 'ALL',
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Supply Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            {selectedStation?.name || 'Select a station'} - Product sharing supplies for confirmation
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
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Pending Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-orange-600">
              {/* {statistics.totalPendingSupplies} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              {/* {formatLiters(statistics.totalQuantityExpected)} expected */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Confirmed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">
              {/* {statistics.totalConfirmedToday} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              {/* {formatLiters(statistics.totalQuantityReceived)} received */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Expected Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-blue-600">
              {/* {formatCurrency(statistics.totalValueExpected)} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              Total sales potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Expected Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">
              {/* {formatCurrency(statistics.totalExpectedProfit)} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">
              Total profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert */}
      {emergencySupplies.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Zap className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency Supplies:</strong> {emergencySupplies.length} emergency supply{emergencySupplies.length > 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Product Sharing Supplies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Product Sharing Supplies</CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Confirm receipt of fuel supplies shared from other KTC Energy stations
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              {filteredSupplies.length} of {supplies.length} entries
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product, source station, request ID, or created by..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
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
                      {Object.entries(SUPPLY_STATUS).map(([key, label]) => (
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
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select 
                    value={filters.priority || 'ALL'} 
                    onValueChange={(value) => updateFilters({ priority: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priority</SelectItem>
                      {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Supplies Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-sm sm:text-base font-medium">Date & Product</TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">Source</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Quantity</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Rates</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Expected Sales/Profit</TableHead>
                 
                  <TableHead className="text-center text-sm sm:text-base font-medium">Status</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplies.map((supply) => {
                  if (!supply) return null;
                  return (
                    <TableRow key={supply.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm sm:text-base font-medium flex items-center">
                            {supply.product}
                            {supply.priority === 'EMERGENCY' && (
                              <Zap className="h-3 w-3 ml-1 text-red-500" />
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs sm:text-sm font-normal flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(supply.date).toLocaleDateString('en-GH')}
                          </div>
                          <div className="text-muted-foreground text-xs font-normal">
                            Req: {supply.productSharingRequestId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm sm:text-base font-medium flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {supply.fromStationName || 'Depot'}
                          </div>
                          <div className="text-muted-foreground text-xs sm:text-sm font-normal">
                            By: {supply.createdBy}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm sm:text-base font-medium">
                            {formatLiters(supply.qty)}
                          </div>
                          {supply.qtyR !== null && (
                            <div className="text-xs text-green-600 font-medium">
                              Received: {formatLiters(supply.qtyR)}
                            </div>
                          )}
                          {supply.shortage && (
                            <div className="text-xs text-red-600 font-medium flex items-center justify-end">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              -{formatLiters(supply.shortage)}
                            </div>
                          )}
                          {supply.overage && (
                            <div className="text-xs text-blue-600 font-medium flex items-center justify-end">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{formatLiters(supply.overage)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-normal">
                            Cost: {formatCurrency(supply.rate)}/L
                          </div>
                          <div className="text-sm sm:text-base font-medium">
                            Sales: {formatCurrency(supply.salesRate)}/L
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            {calculateProfitMargin(supply.salesRate, supply.rate).toFixed(1)}% margin
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm sm:text-base font-medium">
                            {formatCurrency(supply.amountSales)}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Profit: {formatCurrency(supply.expProfit)}
                          </div>
                        </div>
                      </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(supply.status)} variant="outline">
                        {SUPPLY_STATUS[supply.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(supply)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {supply.status === 'APPROVED' && supply.mstatus !== 'CONFIRMED' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleConfirmSupply(supply)}
                            disabled={isSubmitting}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredSupplies.length === 0 && (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">No supplies found</h3>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No product sharing supplies available for this station.'
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

      {/* Supply Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={closeDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Share2 className="h-5 w-5" />
              <span>Supply Details - {selectedSupply?.productSharingRequestId}</span>
              {selectedSupply?.priority === 'EMERGENCY' && (
                <Badge className="bg-red-100 text-red-800 font-medium">Emergency</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Product sharing supply from {selectedSupply?.fromStationName} to {selectedSupply?.stationName}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="supply" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supply" className="text-sm sm:text-base font-medium">
                Supply Information
              </TabsTrigger>
              <TabsTrigger value="financial" className="text-sm sm:text-base font-medium">
                Financial Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="supply" className="space-y-4 sm:space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Product Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Product:</Label>
                      <p className="font-medium">{selectedSupply?.product}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Quantity:</Label>
                      <p className="font-medium">{selectedSupply && formatLiters(selectedSupply.qty)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">From Station:</Label>
                      <p className="font-medium">{selectedSupply?.fromStationName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date:</Label>
                      <p className="font-medium">
                        {selectedSupply?.date && new Date(selectedSupply.date).toLocaleDateString('en-GH')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Priority:</Label>
                      <Badge className={getPriorityColor(selectedSupply?.priority || '')} variant="outline">
                        {selectedSupply?.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status:</Label>
                      <Badge className={getStatusColor(selectedSupply?.status || '')} variant="outline">
                        {selectedSupply?.status && SUPPLY_STATUS[selectedSupply.status]}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created By:</Label>
                      <p className="font-medium">{selectedSupply?.createdBy}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Request ID:</Label>
                      <p className="font-medium">{selectedSupply?.productSharingRequestId}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium">Receipt Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedSupply?.qtyR !== null ? (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Quantity Received:</Label>
                          <p className="font-medium text-green-600">{selectedSupply && formatLiters(selectedSupply.qtyR!)}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Confirmed By:</Label>
                          <p className="font-medium">{selectedSupply?.confirmedBy}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Confirmed At:</Label>
                          <p className="font-medium">
                            {selectedSupply?.confirmedAt && new Date(selectedSupply.confirmedAt).toLocaleString('en-GH')}
                          </p>
                        </div>
                        {selectedSupply?.shortage && (
                          <div>
                            <Label className="text-muted-foreground">Shortage:</Label>
                            <p className="font-medium text-red-600">{formatLiters(selectedSupply.shortage)}</p>
                          </div>
                        )}
                        {selectedSupply?.overage && (
                          <div>
                            <Label className="text-muted-foreground">Overage:</Label>
                            <p className="font-medium text-blue-600">{formatLiters(selectedSupply.overage)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="col-span-2 text-center py-4">
                        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Receipt pending confirmation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4 sm:space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium">Financial Breakdown</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Cost Structure</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Rate per Liter:</span>
                        <span className="text-sm font-medium">{selectedSupply && formatCurrency(selectedSupply.rate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Total Quantity:</span>
                        <span className="text-sm font-medium">{selectedSupply && formatLiters(selectedSupply.qty)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Total Cost:</span>
                        <span className="text-sm font-medium">{selectedSupply && formatCurrency(selectedSupply.rate * selectedSupply.qty)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Sales Projection</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Sales Rate per Liter:</span>
                        <span className="text-sm font-medium">{selectedSupply && formatCurrency(selectedSupply.salesRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Expected Sales Amount:</span>
                        <span className="text-sm font-medium">{selectedSupply && formatCurrency(selectedSupply.amountSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Expected Profit:</span>
                        <span className="text-sm font-medium text-green-600">{selectedSupply && formatCurrency(selectedSupply.expProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-normal">Profit Margin:</span>
                        <span className="text-sm font-medium text-green-600">
                          {selectedSupply && calculateProfitMargin(selectedSupply.salesRate, selectedSupply.rate).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
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

      {/* Confirm Supply Receipt Modal */}
      <Dialog open={showConfirmModal} onOpenChange={closeConfirmModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
              Confirm Supply Receipt
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Confirm receipt of {selectedSupply?.product} supply from {selectedSupply?.fromStationName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Supply Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm sm:text-base font-medium">Supply Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Expected Quantity:</Label>
                  <p className="text-lg font-medium">{selectedSupply && formatLiters(selectedSupply.qty)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product Type:</Label>
                  <p className="text-lg font-medium">{selectedSupply?.product}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">From Station:</Label>
                  <p className="font-medium">{selectedSupply?.fromStationName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Value:</Label>
                  <p className="font-medium">{selectedSupply && formatCurrency(selectedSupply.amountSales)}</p>
                </div>
              </div>
            </div>

            {/* Confirmation Form */}
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-medium">Receipt Confirmation</h4>
              
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">
                  Actual Quantity Received (Liters) *
                </Label>
                <Input
                  type="number"
                  value={confirmData.qtyR}
                  onChange={(e) => setConfirmData({...confirmData, qtyR: e.target.value})}
                  placeholder="Enter actual quantity received"
                  className="text-sm sm:text-base font-normal"
                  min="0"
                  step="1"
                />
                {currentVariance && (
                  <div className={`text-sm font-medium ${currentVariance.color}`}>
                    {currentVariance.message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Overage (if any)</Label>
                  <Input
                    type="number"
                    value={confirmData.overage}
                    onChange={(e) => setConfirmData({...confirmData, overage: e.target.value})}
                    placeholder="Enter overage amount"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Shortage (if any)</Label>
                  <Input
                    type="number"
                    value={confirmData.shortage}
                    onChange={(e) => setConfirmData({...confirmData, shortage: e.target.value})}
                    placeholder="Enter shortage amount"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Notes (Optional)</Label>
                <Textarea
                  value={confirmData.notes}
                  onChange={(e) => setConfirmData({...confirmData, notes: e.target.value})}
                  placeholder="Any additional notes about the supply receipt..."
                  className="text-sm sm:text-base font-normal"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={closeConfirmModal}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReceipt}
              disabled={
                isSubmitting || 
                !confirmData.qtyR || 
                isNaN(parseFloat(confirmData.qtyR)) ||
                parseFloat(confirmData.qtyR) <= 0
              }
              className="text-sm sm:text-base font-medium bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}