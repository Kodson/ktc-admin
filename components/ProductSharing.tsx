import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CircularProgress } from './CircularProgress';
import { BatchSharingModal } from './BatchSharingModal';
import { UpdatePriceModal } from './ProductSharing/UpdatePriceModal';
import { SearchableStationSelect } from './SearchableStationSelect';
import { 
  Fuel,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Search,
  History,
  Settings,
  Plus,
  Eye,
  Share2,
  RefreshCw,
  Truck,
  Trash2,
  Edit,
  Loader2,
  WifiOff,
  Server,
  Layers,
  TrendingDown,
  X
} from 'lucide-react';

// Import constants and data
import {
  inventoryMetrics,
  availableStations
} from '../constants/productSharingData';
import { 
  SHARED_PRODUCT_STATUS_FILTERS, 
  FUEL_TYPES, 
  SUPPLIERS, 
  URGENCY_LEVELS, 
  STATUS_OPTIONS,

  //type StationQuantityPair 
} from '../constants/productSharingConstants';
import{
  calculateProfitMargin
} from '../constants/supplyConstants';
// Import helper functions
import {
  
  formatCurrency,
  getStatusColor,
  getSortedHistoryData
} from '../utils/productSharingHelpers';
import{
    formatLiters,
} from '../constants/supplyConstants';

// Import custom hook
import { useProductSharing } from '../hooks/useProductSharing';

// Import types
import type { BatchProductEntry } from '../types/productSharing';
import { useStationManagement } from '../hooks/useStationManagement';

export function ProductSharing() {
  const {
    stations
  } = useStationManagement();
  console.log('Stations from useStationManagement:', stations);
  // Convert availableStations to Station objects for SearchableStationSelect
  const stationOptions = stations.map((station, index) => ({
    name: station.name || 'Unknown Station',
    location: typeof station.location === 'string' ? station.location : ''
  }));
  const {
    // State
    tankData,
    sharedProductsData,
    selectedTank,
    selectedSharedProduct,
    tankHistory,
    loadingHistory,
    isLoading,
    isSubmitting,
    connectionStatus,
    modals,
    
    // Forms
    shareForm,
    priceForm,
    addTankForm,
    manageForm,
    refillForm,
    updateSharedProductForm,
    newStationSelection,
    
    // Setters
    setAddTankForm,
    setManageForm,
    setRefillForm,
    setPriceForm,
    setNewStationSelection,
    
    // Actions
    retryConnection,
    openModal,
    closeModal,
    handleShareFormChange,
    handleUpdateSharedProductFormChange,
    handleStationQuantityChange,
    //addStationToShare: addStationToShareHook,
    removeStationFromShare,
    updateStationQuantity,
    
    // Complete handlers
    handleShareProduct,
    handleAddTank,
    handleManageTank,
    handleDeleteTank,
    handleOrderRefill,
    handleUpdateSharedProduct,
    handleDeleteSharedProduct,
    handleUpdatePrice,
    
    // Utilities
    user,
    ensureArray
  } = useProductSharing();

  // Custom addStationToShare that converts station ID to name
  const addStationToShare = () => {
    if (!newStationSelection) {
      return;
    }

    // Find the station by ID to get the name
    const selectedStationData = stations.find(station => station.id === newStationSelection);
    const stationName = selectedStationData?.name || newStationSelection;

    // Check if station is already added (by comparing IDs)
    const isAlreadyAdded = shareForm.selectedStations.some(s => {
      const existingStationData = stations.find(station => station.name === s.station);
      return existingStationData?.id === newStationSelection;
    });

    if (isAlreadyAdded) {
      return;
    }

    const newStation = {
      id: Date.now().toString(),
      station: stationName,
      quantity: ''
    };

    const updatedStations = [...shareForm.selectedStations, newStation];
    handleShareFormChange('selectedStations', updatedStations);
    setNewStationSelection('');
  };

  // Helper function to check if station is already selected
  const isStationAlreadySelected = (stationId: string) => {
    return shareForm.selectedStations.some(s => {
      const existingStationData = stations.find(station => station.name === s.station);
      return existingStationData?.id === stationId;
    });
  };



  // Local state for filters and view
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('All Stations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState('tanks');
  
  // Shared products filters
  const [sharedProductsSearch, setSharedProductsSearch] = useState('');
  const [sharedProductsStationFilter, setSharedProductsStationFilter] = useState('All Stations');
  const [sharedProductsStatusFilter, setSharedProductsStatusFilter] = useState('All Status');

  // Safely filter tanks with defensive checks
  const filteredTanks = ensureArray(tankData).filter((tank: any) => {
    if (!tank || typeof tank !== 'object') return false;
    
    const tankName = tank.name || '';
    const tankStation = tank.station || '';
    const tankFuelType = tank.fuelType || '';
    const tankStatus = tank.status || '';
    
    const matchesSearch = 
      tankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tankStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tankFuelType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStation = stationFilter === 'All Stations' || tankStation === stationFilter;
    const matchesStatus = statusFilter === 'All Status' || tankStatus === statusFilter;
    
    return matchesSearch && matchesStation && matchesStatus;
  });

  // Safely filter shared products with defensive checks
  const filteredSharedProducts = (ensureArray(sharedProductsData) as BatchProductEntry[]).filter((product) => {
    if (!product || typeof product !== 'object') return false;
    
    const productName = product.product || '';
    const productCreatedBy = product.createdBy || '';
    const productStatus = product.status || '';
    const productStationQuantities = ensureArray(product.stationQuantities);
    
    const matchesSearch = 
      productStationQuantities.some(sq => 
        sq && typeof sq === 'object' && 'station' in sq && typeof (sq as any).station === 'string' &&
        (sq as any).station.toLowerCase().includes(sharedProductsSearch.toLowerCase())
      ) ||
      productName.toLowerCase().includes(sharedProductsSearch.toLowerCase()) ||
      productCreatedBy.toLowerCase().includes(sharedProductsSearch.toLowerCase());
    
    const matchesStation = sharedProductsStationFilter === 'All Stations' || 
      productStationQuantities.some(sq => sq && typeof sq === 'object' && 'station' in sq && (sq as any).station === sharedProductsStationFilter);
    const matchesStatus = sharedProductsStatusFilter === 'All Status' || productStatus === sharedProductsStatusFilter;
    
    return matchesSearch && matchesStation && matchesStatus;
  });

  // Handlers for product sharing operations
  const handleBatchShareProduct = async (products: BatchProductEntry[]) => {
    if (isSubmitting || products.length === 0) return;
    
    try {
      // Implementation for batch sharing would go here
      console.log('Batch sharing products:', products);
      
      // Mock success for now
      setTimeout(() => {
        closeModal('batchShareProduct');
      }, 2000);
    } catch (error) {
      console.error('Error in batch sharing:', error);
    }
  };

  return (
    <div className="card-responsive">
      {/* Connection Status Alert */}
      {connectionStatus === 'disconnected' && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong className="text-sm sm:text-base font-medium">Backend server not connected</strong> - Using mock data. 
              <br className="sm:hidden" />
              <span className="text-muted-foreground text-sm sm:text-base font-normal">
                Start your Spring Boot server on port 8081 to sync data.
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryConnection}
              disabled={isLoading}
              className="ml-4 flex-shrink-0 text-sm sm:text-base font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Retry</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Product & Tank Management</h1>
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground text-sm sm:text-base font-normal">Manage fuel inventory and product sharing across all stations</p>
            {connectionStatus === 'connected' && (
              <div className="flex items-center space-x-1 text-green-600">
                <Server className="h-4 w-4" />
                <span className="text-xs font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
            <Button 
              variant="outline"
              onClick={() => openModal('addTank')}
              className="text-sm sm:text-base font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Tank</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
          <Button 
            onClick={() => openModal('shareProduct')}
            variant="outline"
            className="text-sm sm:text-base font-medium"
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Share Product</span>
            <span className="sm:hidden">Share</span>
          </Button>
          <Button 
            onClick={() => openModal('batchShareProduct')}
            className="text-sm sm:text-base font-medium"
          >
            <Layers className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Batch Share</span>
            <span className="sm:hidden">Batch</span>
          </Button>
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
            <Button 
              variant="outline"
              onClick={() => openModal('updatePrice')}
              className="text-sm sm:text-base font-medium"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Update Prices</span>
              <span className="sm:hidden">Prices</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for Tank Management and Shared Products */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tanks" className="flex items-center space-x-2 text-sm sm:text-base font-medium">
            <Fuel className="h-4 w-4" />
            <span>Tank Management</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center space-x-2 text-sm sm:text-base font-medium">
            <Share2 className="h-4 w-4" />
            <span>Shared Products</span>
          </TabsTrigger>
        </TabsList>

        {/* Tank Management Tab */}
        <TabsContent value="tanks" className="space-y-4 sm:space-y-6">
          {/* Overview Metrics */}
          <div className="responsive-grid">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Capacity</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{formatLiters(inventoryMetrics.totalCapacity)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Current Stock</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{formatLiters(inventoryMetrics.currentStock)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Average Fill</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{inventoryMetrics.averageFill}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Critical Tanks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-red-600">{inventoryMetrics.criticalTanks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tank Filters and Controls */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={view === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('cards')}
                  className="text-sm sm:text-base font-medium"
                >
                  Cards
                </Button>
                <Button
                  variant={view === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('table')}
                  className="text-sm sm:text-base font-medium"
                >
                  Table
                </Button>
              </div>
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tanks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base font-normal"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Stations">All Stations</SelectItem>
                  {availableStations.map(station => (
                    <SelectItem key={station} value={station}>{station}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tank Cards View */}
          {view === 'cards' && (
            <div className="responsive-grid">
              {(filteredTanks as any[]).map((tank) => (
                <Card key={tank.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base sm:text-lg lg:text-xl font-medium">{tank.name}</CardTitle>
                        <p className="text-muted-foreground text-sm sm:text-base font-normal">{tank.station}</p>
                      </div>
                      <Badge className={getStatusColor(tank.status)}>
                        {tank.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CircularProgress 
                        percentage={tank.fillPercentage} 
                        status={tank.status}
                      />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg sm:text-xl lg:text-2xl font-medium">{formatLiters(tank.currentStock)}</div>
                      <div className="text-muted-foreground text-sm sm:text-base font-normal">
                        Capacity: {formatLiters(tank.capacity)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Price/L:</span>
                        <div className="text-sm font-medium">{formatCurrency(tank.pricePerLiter)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Last Refill:</span>
                        <div className="text-sm font-medium">{tank.lastRefill}</div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-sm sm:text-base font-medium"
                        onClick={() => openModal('viewHistory', tank)}
                      >
                        <History className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">View History</span>
                        <span className="sm:hidden">History</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-sm sm:text-base font-medium"
                        onClick={() => openModal('manageTank', tank)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        <span>Manage</span>
                      </Button>
                    </div>

                    {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm sm:text-base font-medium"
                          onClick={() => openModal('updatePrice', tank)}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Update Price
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-sm sm:text-base font-medium"
                          onClick={() => openModal('deleteTank', tank)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Tank
                        </Button>
                      </>
                    )}

                    {tank.status === 'Critical' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base font-medium"
                        onClick={() => openModal('orderRefill', tank)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Order Refill
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tank Table View */}
          {view === 'table' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                    <Fuel className="h-5 w-5" />
                    <span>Tank Inventory Table</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base font-normal">{filteredTanks.length} of {tankData.length} entries</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm sm:text-base font-medium">Station</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Tank Name</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Status</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Capacity</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Current Stock</TableHead>
                        <TableHead className="text-center text-sm sm:text-base font-medium">Fill Level</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Price/L</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Last Refill</TableHead>
                        <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTanks.map((tank: any) => (
                        <TableRow key={tank.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm sm:text-base font-normal">{tank.station}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm sm:text-base font-medium">{tank.name}</div>
                              <div className="text-muted-foreground text-xs sm:text-sm">{tank.fuelType}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tank.status)}>
                              {tank.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm sm:text-base font-normal">
                            {formatLiters(tank.capacity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm sm:text-base font-medium">{formatLiters(tank.currentStock)}</div>
                            <div className="text-muted-foreground text-xs sm:text-sm">
                              {tank.fillPercentage}% full
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <Progress 
                                  value={tank.fillPercentage} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm sm:text-base font-normal">
                            {formatCurrency(tank.pricePerLiter)}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base font-normal">{tank.lastRefill}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => openModal('viewHistory', tank)}
                                title="View History"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => openModal('manageTank', tank)}
                                title="Manage Tank"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => openModal('updatePrice', tank)}
                                    title="Update Price"
                                  >
                                    <TrendingUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openModal('deleteTank', tank)}
                                    title="Delete Tank"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {tank.status === 'Critical' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-orange-600"
                                  onClick={() => openModal('orderRefill', tank)}
                                  title="Order Refill"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Empty State for Table */}
                {filteredTanks.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg lg:text-xl font-medium">No tanks found</h3>
                    <p className="text-muted-foreground text-sm sm:text-base font-normal">Try adjusting your search or filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shared Products Tab */}
        <TabsContent value="shared" className="space-y-4 sm:space-y-6">
          {/* Shared Products Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shared products..."
                  value={sharedProductsSearch}
                  onChange={(e) => setSharedProductsSearch(e.target.value)}
                  className="pl-10 text-sm sm:text-base font-normal"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Select value={sharedProductsStationFilter} onValueChange={setSharedProductsStationFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Stations">All Stations</SelectItem>
                  {availableStations.map(station => (
                    <SelectItem key={station} value={station}>{station}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sharedProductsStatusFilter} onValueChange={setSharedProductsStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {SHARED_PRODUCT_STATUS_FILTERS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryConnection}
                disabled={isLoading}
                className="text-sm sm:text-base font-medium"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Shared Products Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                    <Share2 className="h-5 w-5" />
                    <span>Shared Products</span>
                    {connectionStatus === 'disconnected' && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                        Mock Data
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base font-normal">View and manage product sharing transactions</p>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base font-normal">{filteredSharedProducts.length} of {sharedProductsData.length} entries</p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span className="text-sm sm:text-base font-normal">Loading shared products...</span>
                </div>
              ) : filteredSharedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg lg:text-xl font-medium">No shared products found</h3>
                  <p className="text-muted-foreground text-sm sm:text-base font-normal">Start by sharing products to stations to see them here.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm sm:text-base font-medium">Date</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Product</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Station</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Total Qty (L)</TableHead>
                        <TableHead className="text-right text-sm sm:text-base font-medium">Rates</TableHead>
                        
                        <TableHead className="text-right text-sm sm:text-base font-medium">Expected Profit</TableHead>
                        <TableHead className="text-center text-sm sm:text-base font-medium">Status</TableHead>
                        <TableHead className="text-sm sm:text-base font-medium">Created By</TableHead>
                        <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSharedProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm sm:text-base font-normal">{product.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.product}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.station}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">
                          {formatLiters(product.qty)}
                        </div>
                        {product.qtyR !== null && (
                          <div className="text-xs text-green-600 font-medium">
                            Received: {formatLiters(product.qtyR)}
                          </div>
                        )}
                        {product.shortage && (
                          <div className="text-xs text-red-600 font-medium flex items-center justify-end">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            -{formatLiters(product.shortage)}
                          </div>
                        )}
                        {product.overage && (
                          <div className="text-xs text-blue-600 font-medium flex items-center justify-end">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{formatLiters(product.overage)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-normal">
                          Cost: {formatCurrency(parseFloat(product.rate))}/L
                        </div>
                        <div className="text-sm sm:text-base font-medium">
                          Sales: {formatCurrency(parseFloat(product.salesRate))}/L
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {calculateProfitMargin(parseFloat(product.salesRate), parseFloat(product.rate)).toFixed(1)}% margin
                        </div>
                      </div>
                    </TableCell>
                          
                          
                          <TableCell className="text-right">
                            <span className={`text-sm sm:text-base font-normal ${(product.expProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(product.expProfit || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base font-normal">{product.createdBy}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                title="View Details"
                                onClick={() => openModal('viewSharedProduct', undefined, {
                                  ...product,
                                  stationQuantities: Object.entries(product.stationQuantities).map(([station, qty]) => ({ station, qty: Number(qty) })),
                                  totalQty: Number(product.totalQty),
                                  rate: Number(product.rate),
                                  amountCost: Number(product.amountCost),
                                  amountSales: Number(product.amountSales),
                                  salesRate: Number(product.salesRate),
                                  expectedProfit: typeof product.expectedProfit === 'number' ? product.expectedProfit : 0,
                                  status: ['PENDING', 'APPROVED', 'REJECTED'].includes(product.status) ? product.status as 'PENDING' | 'APPROVED' | 'REJECTED' : 'PENDING',
                                  createdBy: product.createdBy ?? '',
                                  createdAt: product.createdAt ?? ''
                                })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Update"
                                    onClick={() => openModal('updateSharedProduct', undefined, {
                                      ...product,
                                      stationQuantities: Object.entries(product.stationQuantities).map(([station, qty]) => ({ station, qty: Number(qty) })),
                                      totalQty: Number(product.totalQty),
                                      rate: Number(product.rate),
                                      amountCost: Number(product.amountCost),
                                      amountSales: Number(product.amountSales),
                                      salesRate: Number(product.salesRate),
                                      expectedProfit: typeof product.expectedProfit === 'number' ? product.expectedProfit : 0,
                                      status: ['PENDING', 'APPROVED', 'REJECTED'].includes(product.status) ? product.status as 'PENDING' | 'APPROVED' | 'REJECTED' : 'PENDING',
                                      createdBy: product.createdBy ?? '',
                                      createdAt: product.createdAt ?? ''
                                    })}
                                    disabled={isSubmitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete"
                                    onClick={() => openModal('deleteSharedProduct', undefined, {
                                      ...product,
                                      stationQuantities: Object.entries(product.stationQuantities).map(([station, qty]) => ({ station, qty: Number(qty) })),
                                      totalQty: Number(product.totalQty),
                                      rate: Number(product.rate),
                                      amountCost: Number(product.amountCost),
                                      amountSales: Number(product.amountSales),
                                      salesRate: Number(product.salesRate),
                                      expectedProfit: typeof product.expectedProfit === 'number' ? product.expectedProfit : 0,
                                      status: ['PENDING', 'APPROVED', 'REJECTED'].includes(product.status) ? product.status as 'PENDING' | 'APPROVED' | 'REJECTED' : 'PENDING',
                                      createdBy: product.createdBy ?? '',
                                      createdAt: product.createdAt ?? ''
                                    })}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ALL MODALS */}

      {/* Batch Share Product Modal */}
      <BatchSharingModal
        open={modals.batchShareProduct}
        onClose={() => closeModal('batchShareProduct')}
        onSubmit={handleBatchShareProduct}
        isSubmitting={isSubmitting}
      />

      {/* Enhanced Update Price Modal */}
      <UpdatePriceModal
        open={modals.updatePrice}
        onClose={() => closeModal('updatePrice')}
        onUpdate={handleUpdatePrice}
        selectedTank={selectedTank}
        tankData={tankData}
        priceForm={priceForm}
        setPriceForm={setPriceForm}
        isSubmitting={isSubmitting}
      />

      {/* Single Share Product Modal */}
      <Dialog open={modals.shareProduct} onOpenChange={() => closeModal('shareProduct')}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Share2 className="h-5 w-5" />
              <span>Share Single Product</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Share a single product to multiple stations with custom quantities
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Date</Label>
                <Input
                  type="date"
                  value={shareForm.date}
                  onChange={(e) => handleShareFormChange('date', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Product</Label>
                <Select value={shareForm.product} onValueChange={(value) => handleShareFormChange('product', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Cost Rate (₵/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={shareForm.rate}
                  onChange={(e) => handleShareFormChange('rate', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Sales Rate (₵/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={shareForm.salesRate}
                  onChange={(e) => handleShareFormChange('salesRate', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <Separator />

            {/* Station Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base font-medium">Station Selection</Label>
                <span className="text-sm text-muted-foreground">
                  {shareForm.selectedStations.length} station{shareForm.selectedStations.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <SearchableStationSelect
                    stations={stationOptions}
                    value={newStationSelection}
                    onValueChange={setNewStationSelection}
                    placeholder="Search and select station..."
                    className="w-full"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addStationToShare}
                  disabled={!newStationSelection || isStationAlreadySelected(newStationSelection)}
                  size="sm"
                  className="text-sm sm:text-base font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Selected Stations with Quantities */}
              {shareForm.selectedStations.length > 0 && (
                <div className="space-y-3 border rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Selected Stations & Quantities
                  </div>
                  {shareForm.selectedStations.map((station) => (
                    <div key={station.id} className="flex items-center space-x-3 bg-muted/20 rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{station.station}</div>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="0"
                          value={station.quantity}
                          onChange={(e) => updateStationQuantity(station.id, e.target.value)}
                          className="text-right text-sm"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-6">L</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStationFromShare(station.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Summary Section */}
            <div className="space-y-4 bg-muted/20 rounded-lg p-4">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Total Quantity</Label>
                  <div className="text-sm font-medium">
                    {shareForm.totalQty ? `${parseFloat(shareForm.totalQty).toLocaleString()} L` : '0 L'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Expected Profit</Label>
                  <div className={`text-sm font-medium ${parseFloat(shareForm.expectedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {shareForm.expectedProfit ? formatCurrency(parseFloat(shareForm.expectedProfit)) : '₵0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('shareProduct')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShareProduct}
              disabled={parseFloat(shareForm.totalQty) <= 0 || shareForm.selectedStations.length === 0 || isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Product ({shareForm.totalQty || '0'}L total)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tank Modal */}
      <Dialog open={modals.addTank} onOpenChange={() => closeModal('addTank')}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Plus className="h-5 w-5" />
              <span>Add New Tank</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Add a new fuel tank to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Station</Label>
              <SearchableStationSelect 
                stations={stationOptions}
                value={stations.find(s => s.name === addTankForm.station)?.id || ''} 
                onValueChange={(value) => {
                  console.log('Selected station:', value);
                  const selectedStation = stations.find(station => station.id === value);
                  console.log('Found station data:', selectedStation);
                  console.log('Current fuel type:', addTankForm.fuelType);
                  
                  let capacity = '';
                  if (selectedStation?.operational?.tankCapacity && addTankForm.fuelType) {
                    const capacityValue = selectedStation.operational.tankCapacity[addTankForm.fuelType];
                    capacity = capacityValue ? capacityValue.toString() : '';
                    console.log('Found capacity:', capacity);
                  }
                  
                  setAddTankForm(prev => ({ 
                    ...prev, 
                    station: selectedStation?.name || '',
                    capacity: capacity.toString()
                  }));
                }}
                placeholder="Search and select station..."
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Fuel Type</Label>
                <Select value={addTankForm.fuelType} onValueChange={(value) => {
                  console.log('Selected fuel type:', value);
                  console.log('Current station:', addTankForm.station);
                  
                  const selectedStation = stations.find(station => station.name === addTankForm.station);
                  console.log('Found station for fuel type:', selectedStation);
                  
                  let capacity = '';
                  if (selectedStation?.operational?.tankCapacity && value) {
                    const capacityValue = selectedStation.operational.tankCapacity[value];
                    capacity = capacityValue ? capacityValue.toString() : '';
                    console.log('Found capacity for fuel type:', capacity);
                  }
                  
                  setAddTankForm(prev => ({ 
                    ...prev, 
                    fuelType: value,
                    capacity: capacity.toString()
                  }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Tank Name</Label>
                <Input
                  placeholder="e.g., Tank A"
                  value={addTankForm.name}
                  onChange={(e) => setAddTankForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              
            </div>

            

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Capacity (Liters)</Label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={addTankForm.capacity}
                  onChange={(e) => setAddTankForm(prev => ({ ...prev, capacity: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Current Stock (Liters)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={addTankForm.currentStock}
                  onChange={(e) => setAddTankForm(prev => ({ ...prev, currentStock: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Price per Liter (₵)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="8.50"
                value={addTankForm.pricePerLiter}
                onChange={(e) => setAddTankForm(prev => ({ ...prev, pricePerLiter: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('addTank')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddTank}
              disabled={isSubmitting || !addTankForm.name || !addTankForm.fuelType || !addTankForm.station}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tank
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Tank Modal */}
      <Dialog open={modals.manageTank} onOpenChange={() => closeModal('manageTank')}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Settings className="h-5 w-5" />
              <span>Manage Tank Settings</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Configure tank parameters and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Tank Name</Label>
                <Input
                  placeholder="Tank A"
                  value={manageForm.name}
                  onChange={(e) => setManageForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Capacity (Liters)</Label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={manageForm.capacity}
                  onChange={(e) => setManageForm(prev => ({ ...prev, capacity: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Min Level (%)</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={manageForm.minLevel}
                  onChange={(e) => setManageForm(prev => ({ ...prev, minLevel: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Max Level (%)</Label>
                <Input
                  type="number"
                  placeholder="95"
                  value={manageForm.maxLevel}
                  onChange={(e) => setManageForm(prev => ({ ...prev, maxLevel: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={manageForm.autoReorder}
                  onCheckedChange={(checked) => setManageForm(prev => ({ ...prev, autoReorder: checked }))}
                />
                <Label className="text-sm sm:text-base font-medium">Enable Auto Reorder</Label>
              </div>
              
              {manageForm.autoReorder && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Reorder Threshold (%)</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={manageForm.reorderThreshold}
                    onChange={(e) => setManageForm(prev => ({ ...prev, reorderThreshold: e.target.value }))}
                    className="text-sm sm:text-base font-normal"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Status</Label>
              <Select value={manageForm.status} onValueChange={(value) => setManageForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('manageTank')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManageTank}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tank Confirmation Modal */}
      <Dialog open={modals.deleteTank} onOpenChange={() => closeModal('deleteTank')}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete Tank</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to delete this tank? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTank && (
            <div className="py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-sm sm:text-base font-medium">{selectedTank.name} - {selectedTank.fuelType}</div>
                <div className="text-muted-foreground text-sm sm:text-base font-normal">{selectedTank.station}</div>
                <div className="text-muted-foreground text-sm sm:text-base font-normal">
                  Capacity: {formatLiters(selectedTank.capacity)} | Current: {formatLiters(selectedTank.currentStock)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('deleteTank')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTank}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Tank
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tank History Modal */}
      <Dialog open={modals.viewHistory} onOpenChange={() => closeModal('viewHistory')}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <History className="h-5 w-5" />
              <span>Tank History</span>
              {selectedTank && (
                <span className="text-muted-foreground text-sm sm:text-base font-normal">
                  - {selectedTank.name} ({selectedTank.station})
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              View transaction history and activities for this tank
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-muted-foreground text-sm sm:text-base font-normal">
                {loadingHistory ? 'Loading...' : `Showing ${tankHistory.length} entries`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistorySortOrder(historySortOrder === 'newest' ? 'oldest' : 'newest')}
                className="text-sm sm:text-base font-medium"
              >
                Sort: {historySortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
            
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span className="text-sm sm:text-base font-normal">Loading tank history...</span>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-sm sm:text-base font-medium">Date</TableHead>
                      <TableHead className="text-sm sm:text-base font-medium">Type</TableHead>
                      <TableHead className="text-sm sm:text-base font-medium">Details</TableHead>
                      <TableHead className="text-sm sm:text-base font-medium">Operator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSortedHistoryData(tankHistory, historySortOrder).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm sm:text-base font-normal">{entry.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm sm:text-base font-normal">
                          {entry.amount && `${formatLiters(entry.amount)}`}
                          {entry.supplier && ` from ${entry.supplier}`}
                          {entry.source && ` from ${entry.source}`}
                          {entry.destination && ` to ${entry.destination}`}
                          {entry.cost && ` (${formatCurrency(entry.cost)})`}
                          {entry.oldPrice && entry.newPrice && 
                            ` ${formatCurrency(entry.oldPrice)} → ${formatCurrency(entry.newPrice)}`}
                          {entry.description && entry.description}
                          {entry.urgency && (
                            <Badge className="ml-2 bg-red-100 text-red-800">
                              {entry.urgency}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm sm:text-base font-normal">{entry.operator}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => closeModal('viewHistory')}
              className="text-sm sm:text-base font-medium"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Refill Modal */}
      <Dialog open={modals.orderRefill} onOpenChange={() => closeModal('orderRefill')}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Truck className="h-5 w-5" />
              <span>Order Fuel Refill</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Place an order for fuel refill for {selectedTank?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Supplier</Label>
              <Select value={refillForm.supplier} onValueChange={(value) => setRefillForm(prev => ({ ...prev, supplier: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIERS.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Amount (Liters)</Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={refillForm.amount}
                  onChange={(e) => setRefillForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Estimated Cost (₵)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="127500.00"
                  value={refillForm.estimatedCost}
                  onChange={(e) => setRefillForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Urgency</Label>
                <Select value={refillForm.urgency} onValueChange={(value) => setRefillForm(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Scheduled Date</Label>
                <Input
                  type="date"
                  value={refillForm.scheduledDate}
                  onChange={(e) => setRefillForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Notes</Label>
              <Textarea
                placeholder="Additional notes or special instructions..."
                value={refillForm.notes}
                onChange={(e) => setRefillForm(prev => ({ ...prev, notes: e.target.value }))}
                className="text-sm sm:text-base font-normal"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('orderRefill')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleOrderRefill}
              disabled={isSubmitting || !refillForm.supplier || !refillForm.amount}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Shared Product Modal */}
      <Dialog open={modals.viewSharedProduct} onOpenChange={() => closeModal('viewSharedProduct')}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Eye className="h-5 w-5" />
              <span>View Shared Product Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSharedProduct && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Date</Label>
                  <p className="text-sm sm:text-base font-normal">{selectedSharedProduct.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Product</Label>
                  <p className="text-sm sm:text-base font-normal">{selectedSharedProduct.product}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm sm:text-base font-medium">Station Quantities ({ensureArray(selectedSharedProduct.stationQuantities).length})</Label>
                <div className="mt-2 space-y-2">
                  {ensureArray(selectedSharedProduct.stationQuantities).map((sq, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm sm:text-base font-normal">{(sq as { station: string }).station}</span>
                      </div>
                      <span className="text-sm sm:text-base font-medium">{((sq as { qty?: number }).qty || 0).toLocaleString()} L</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Total Quantity</Label>
                  <p className="text-sm sm:text-base font-normal">{(selectedSharedProduct.qty || 0).toLocaleString()} L</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Expected Profit</Label>
                  <p className={`text-sm sm:text-base font-normal ${(selectedSharedProduct.expectedProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedSharedProduct.expectedProfit || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedSharedProduct.status)}>
                      {selectedSharedProduct.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Created By</Label>
                  <p className="text-sm sm:text-base font-normal">{selectedSharedProduct.createdBy}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => closeModal('viewSharedProduct')}
              className="text-sm sm:text-base font-medium"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Shared Product Modal */}
      <Dialog open={modals.updateSharedProduct} onOpenChange={() => closeModal('updateSharedProduct')}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Edit className="h-5 w-5" />
              <span>Update Shared Product</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Edit product details and quantities for each station
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Date</Label>
                <Input
                  type="date"
                  value={updateSharedProductForm.date}
                  onChange={(e) => handleUpdateSharedProductFormChange('date', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Product</Label>
                <Select value={updateSharedProductForm.product} onValueChange={(value) => handleUpdateSharedProductFormChange('product', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base font-medium">Station Quantities</Label>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(updateSharedProductForm.stationQuantities).length} station{Object.keys(updateSharedProductForm.stationQuantities).length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              {/* Add Station Section */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <SearchableStationSelect
                    stations={stationOptions.filter(station => 
                      !Object.keys(updateSharedProductForm.stationQuantities).includes(station.name)
                    )}
                    value={newStationSelection}
                    onValueChange={setNewStationSelection}
                    placeholder="Add another station..."
                    className="w-full"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (newStationSelection) {
                      const selectedStationData = stations.find(station => station.id === newStationSelection);
                      if (selectedStationData) {
                        handleStationQuantityChange(selectedStationData.name, '0');
                        setNewStationSelection('');
                      }
                    }
                  }}
                  disabled={!newStationSelection}
                  size="sm"
                  className="text-sm sm:text-base font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {Object.keys(updateSharedProductForm.stationQuantities).map(station => (
                  <div key={station} className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm truncate">{station}</Label>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="0"
                        value={updateSharedProductForm.stationQuantities[station] || ''}
                        onChange={(e) => handleStationQuantityChange(station, e.target.value)}
                        className="text-right text-sm"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-6">L</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newStationQuantities = { ...updateSharedProductForm.stationQuantities };
                        delete newStationQuantities[station];
                        handleUpdateSharedProductFormChange('stationQuantities', newStationQuantities);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {Object.keys(updateSharedProductForm.stationQuantities).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No stations selected. Use the dropdown above to add stations.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Cost Rate (₵/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={updateSharedProductForm.rate}
                  onChange={(e) => handleUpdateSharedProductFormChange('rate', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Sales Rate (₵/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={updateSharedProductForm.salesRate}
                  onChange={(e) => handleUpdateSharedProductFormChange('salesRate', e.target.value)}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4 bg-muted/20 rounded-lg p-4">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">Updated Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Total Quantity</Label>
                  <div className="text-sm font-medium">
                    {updateSharedProductForm.totalQty ? `${parseFloat(updateSharedProductForm.totalQty).toLocaleString()} L` : '0 L'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm sm:text-base font-medium">Expected Profit</Label>
                  <div className={`text-sm font-medium ${parseFloat(updateSharedProductForm.expectedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {updateSharedProductForm.expectedProfit ? formatCurrency(parseFloat(updateSharedProductForm.expectedProfit)) : '₵0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('updateSharedProduct')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSharedProduct}
              disabled={parseFloat(updateSharedProductForm.totalQty) <= 0 || isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shared Product Confirmation Modal */}
      <Dialog open={modals.deleteSharedProduct} onOpenChange={() => closeModal('deleteSharedProduct')}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete Shared Product</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to delete this shared product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSharedProduct && (
            <div className="py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-sm sm:text-base font-medium">{selectedSharedProduct.product} - {(selectedSharedProduct.totalQty || 0).toLocaleString()}L</div>
                <div className="text-muted-foreground text-sm sm:text-base font-normal">
                  {ensureArray(selectedSharedProduct.stationQuantities).map(sq => (sq as { station: string }).station).join(', ')}
                </div>
                <div className="text-muted-foreground text-sm sm:text-base font-normal">
                  Expected Profit: {formatCurrency(selectedSharedProduct.expectedProfit || 0)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeModal('deleteSharedProduct')}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteSharedProduct}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}