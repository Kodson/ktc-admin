import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Shield,
  AlertTriangle,
  Wifi,
  WifiOff,
  X,
  Loader2,
  //UserPlus,
  UserMinus,
  DollarSign,
  Edit3,
  Trash2,
  //Eye,
  UserCheck
} from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useStationManagement } from '../hooks/useStationManagement';
import { StationTable } from './StationManagement/StationTable';
import { StationFormTabs } from './StationManagement/StationFormTabs';
import { UserSearchableSelect } from './UserSearchableSelect';
import { 
  GHANA_REGIONS,
  STATION_STATUS,
  USER_STATUS,
  DEFAULT_OPERATING_HOURS,
  formatCurrency,
  formatPhoneNumber
} from '../constants/stationManagementConstants';
import type { Station, StationFormData } from '../types/stationManagement';
import type { User } from '../types/userManagement';

export function StationManagement() {
  const { user } = useAuth();
  
  const {
    stations,
    //statistics,
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    validationErrors,
    createStation,
    updateStation,
    deleteStation,
    updateStationStatus,
    assignManager,
    unassignManager,
    refreshData,
    updateFilters,
    generateNewStationCode,
    canManageStations,
    //hasData
  } = useStationManagement();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [showUnassignManagerDialog, setShowUnassignManagerDialog] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    code: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    operatingHours: DEFAULT_OPERATING_HOURS,
    fuelTypes: [],
    tankCapacity: {},
    pumpCount: 4,
    monthlyTarget: 200000
  });

  // Manager assignment form - updated to include selected user
  const [managerAssignmentData, setManagerAssignmentData] = useState({
    selectedUser: null as User | null,
    notes: ''
  });

  // Handle form field changes
  const updateFormField = (field: keyof StationFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate station code when city changes
      if (field === 'city' && value) {
        updated.code = generateNewStationCode(value);
      }
      
      return updated;
    });
  };

  // Handle fuel types change
  const handleFuelTypesChange = (fuelType: string, checked: boolean) => {
    setFormData(prev => {
      const updatedFuelTypes = checked 
        ? [...prev.fuelTypes, fuelType]
        : prev.fuelTypes.filter(type => type !== fuelType);
      
      const updatedTankCapacity = { ...prev.tankCapacity };
      
      if (checked) {
        updatedTankCapacity[fuelType] = 40000;
      } else {
        delete updatedTankCapacity[fuelType];
      }
      
      return {
        ...prev,
        fuelTypes: updatedFuelTypes,
        tankCapacity: updatedTankCapacity
      };
    });
  };

  // Handle tank capacity change
  const handleTankCapacityChange = (fuelType: string, capacity: number) => {
    setFormData(prev => ({
      ...prev,
      tankCapacity: {
        ...prev.tankCapacity,
        [fuelType]: capacity
      }
    }));
  };

  // Handle create station
  const handleCreateStation = async () => {
    const success = await createStation(formData);
    if (success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  // Handle view details
  const handleViewDetails = (station: Station) => {
    setSelectedStation(station);
    setShowDetailsModal(true);
  };

  // Handle edit station
  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      address: station.location.address,
      city: station.location.city,
      region: station.location.region,
      phone: station.contact.phone,
      email: station.contact.email,
      operatingHours: station.operational.operatingHours,
      fuelTypes: station.operational.fuelTypes,
      tankCapacity: station.operational.tankCapacity,
      pumpCount: station.operational.pumpCount,
      monthlyTarget: station.financial.monthlyTarget,
      notes: station.notes
    });
    setShowEditModal(true);
  };

  // Handle delete station request
  const handleDeleteStationRequest = (station: Station) => {
    setSelectedStation(station);
    setShowDeleteDialog(true);
  };

  // Handle manager assignment request
  const handleAssignManagerRequest = (station: Station) => {
    setSelectedStation(station);
    setShowAssignManagerModal(true);
  };

  // Handle manager unassignment request
  const handleUnassignManagerRequest = (station: Station) => {
    setSelectedStation(station);
    setShowUnassignManagerDialog(true);
  };

  // Handle assign manager - Updated to use the actual assignManager function
  const handleAssignManager = async () => {
    if (!selectedStation || !managerAssignmentData.selectedUser) return;
    
    const success = await assignManager(
      selectedStation.id,
      managerAssignmentData.selectedUser.id,
      
      {
        manager: managerAssignmentData.selectedUser.username,
        managerEmail: managerAssignmentData.selectedUser.email,
        managerPhone: managerAssignmentData.selectedUser.phone,
        managerUserId: managerAssignmentData.selectedUser.id,
      }
    );
    if (success) {
      setShowAssignManagerModal(false);
      setSelectedStation(null);
      resetManagerAssignmentForm();
    }
  };

  // Handle update station
  const handleUpdateStation = async () => {
    if (!selectedStation) return;
    
    const success = await updateStation(selectedStation.id, formData);
    if (success) {
      setShowEditModal(false);
      setSelectedStation(null);
      resetForm();
    }
  };

  // Handle delete station
  const handleDeleteStation = async () => {
    if (!selectedStation) return;
    
    const success = await deleteStation(selectedStation.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedStation(null);
    }
  };

  // Handle unassign manager
  const handleUnassignManager = async () => {
    if (!selectedStation) return;
    
    const success = await unassignManager(selectedStation.id);
    if (success) {
      setShowUnassignManagerDialog(false);
      setSelectedStation(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      email: '',
      operatingHours: DEFAULT_OPERATING_HOURS,
      fuelTypes: [],
      tankCapacity: {},
      pumpCount: 4,
      monthlyTarget: 200000
    });
  };

  // Reset manager assignment form
  const resetManagerAssignmentForm = () => {
    setManagerAssignmentData({
      selectedUser: null,
      notes: ''
    });
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      status: 'ALL',
      userStatus: 'ALL',
      region: 'ALL',
      hasManager: 'ALL',
      search: ''
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.status !== 'ALL',
    filters.userStatus !== 'ALL',
    filters.region !== 'ALL',
    filters.hasManager !== 'ALL',
    filters.search
  ].filter(Boolean).length;

  // Role-based access check
  if (!canManageStations) {
    return (
      <div className="card-responsive">
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base sm:text-lg lg:text-xl font-medium">Access Restricted</h3>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            You don't have permission to manage stations. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Station Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            Manage KTC Energy fuel stations and user accounts across Ghana
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

      {/* Stats Cards */}
      <div className="responsive-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Stations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{statistics.totalStations}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Operational sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">With Managers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">{statistics.stationsWithManagers}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Have assigned managers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Monthly Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-blue-600">
              {/* {formatCurrency(statistics.totalMonthlyTarget)} */}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Combined target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-orange-600">{statistics.stationsNeedingAttention}</div> */}
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Require review</p>
          </CardContent>
        </Card>
      </div>

      {/* Stations Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">KTC Energy Stations</CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Manage station operations and assign managers from existing users
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              {stations.length} stations
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div></div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, city, region, or username..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Station Status</Label>
                  <Select 
                    value={filters.status || 'ALL'} 
                    onValueChange={(value) => updateFilters({ status: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      {Object.entries(STATION_STATUS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">User Status</Label>
                  <Select 
                    value={filters.userStatus || 'ALL'} 
                    onValueChange={(value) => updateFilters({ userStatus: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      {Object.entries(USER_STATUS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <Select 
                    value={filters.region || 'ALL'} 
                    onValueChange={(value) => updateFilters({ region: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Regions</SelectItem>
                      {GHANA_REGIONS.map(({ region }) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Manager Status</Label>
                  <Select 
                    value={filters.hasManager || 'ALL'} 
                    onValueChange={(value) => updateFilters({ hasManager: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Stations</SelectItem>
                      <SelectItem value="YES">Has Manager</SelectItem>
                      <SelectItem value="NO">No Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            )}
          </div>

          {/* Stations Table */}
          <StationTable
            stations={stations}
            isSubmitting={isSubmitting}
            userRole={user?.role || ''}
            onViewDetails={handleViewDetails}
            onEditStation={handleEditStation}
            onDeleteStation={handleDeleteStationRequest}
            onStatusChange={updateStationStatus}
            onAssignManager={handleAssignManagerRequest}
            onUnassignManager={handleUnassignManagerRequest}
          />

          {stations.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">No stations found</h3>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No stations have been added to the system yet.'
                }
              </p>
              {activeFiltersCount > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4 text-sm sm:text-base font-medium"
                >
                  Clear all filters
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-sm sm:text-base font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Station
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Station Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Add New Station</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Create a new KTC Energy fuel station. Managers can be assigned separately from existing users.
            </DialogDescription>
          </DialogHeader>

          <StationFormTabs
            formData={formData}
            validationErrors={validationErrors}
            onUpdateField={updateFormField}
            onFuelTypesChange={handleFuelTypesChange}
            onTankCapacityChange={handleTankCapacityChange}
          />

          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStation}
              disabled={isSubmitting || !formData.name || !formData.code || !formData.region || !formData.city}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Station
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Station Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Edit Station</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Update details for {selectedStation?.name}
            </DialogDescription>
          </DialogHeader>

          <StationFormTabs
            formData={formData}
            validationErrors={validationErrors}
            onUpdateField={updateFormField}
            onFuelTypesChange={handleFuelTypesChange}
            onTankCapacityChange={handleTankCapacityChange}
          />

          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setSelectedStation(null);
                resetForm();
              }}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStation}
              disabled={isSubmitting || !formData.name || !formData.code || !formData.region || !formData.city}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update Station
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Manager Modal - Enhanced for user selection */}
      <Dialog open={showAssignManagerModal} onOpenChange={setShowAssignManagerModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Assign Manager</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Select an existing user to assign as manager for <strong>{selectedStation?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select User</Label>
              <UserSearchableSelect
                selectedUser={managerAssignmentData.selectedUser ?? null}
                onUserSelect={(user) => 
                  setManagerAssignmentData(prev => ({ ...prev, selectedUser: user }))
                }
                placeholder="Search for existing users..."
                roleFilter="ROLE_STATION_MANAGER,ROLE_ADMIN"
              />
              <p className="text-xs text-muted-foreground font-normal">
                Only users with station manager or admin roles can be assigned as managers
              </p>
            </div>

            {managerAssignmentData.selectedUser && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="text-sm font-medium">Selected User Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-normal">Name:</span>
                    <p className="font-medium">{managerAssignmentData.selectedUser.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-normal">Email:</span>
                    <p className="font-medium">{managerAssignmentData.selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-normal">Phone:</span>
                    <p className="font-medium">{managerAssignmentData.selectedUser.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-normal">Role:</span>
                    <p className="font-medium capitalize">{managerAssignmentData.selectedUser.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="assignment-notes" className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea
                id="assignment-notes"
                placeholder="Add any notes about this assignment..."
                value={managerAssignmentData.notes}
                onChange={(e) => 
                  setManagerAssignmentData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="text-sm sm:text-base font-normal"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignManagerModal(false);
                setSelectedStation(null);
                resetManagerAssignmentForm();
              }}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignManager}
              disabled={isSubmitting || !managerAssignmentData.selectedUser}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Manager
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Station Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Delete Station</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to delete <strong>{selectedStation?.name}</strong>? This action cannot be undone.
              <br /><br />
              <span className="text-red-600 font-medium">Warning: This will also remove any assigned managers and deactivate associated user accounts.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setSelectedStation(null)}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStation}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Station
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unassign Manager Confirmation Dialog */}
      <AlertDialog open={showUnassignManagerDialog} onOpenChange={setShowUnassignManagerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Unassign Manager</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to unassign the manager from <strong>{selectedStation?.name}</strong>?
              <br /><br />
              <span className="text-orange-600 font-medium">
                Manager: {selectedStation?.contact.manager?.name} ({selectedStation?.contact.manager?.email})
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setSelectedStation(null)}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnassignManager}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unassigning...
                </>
              ) : (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unassign Manager
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Station Details Modal */}
      {selectedStation && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">{selectedStation.name}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base font-normal">
                Detailed information for station {selectedStation.code}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-medium">Station Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Station Name</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Station Code</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.location.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">City & Region</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.location.city}, {selectedStation.location.region}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className="mt-1">{STATION_STATUS[selectedStation.operational.status]}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Manager Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-medium">Contact & Manager</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm sm:text-base font-normal">{formatPhoneNumber(selectedStation.contact.phone)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.contact.email}</p>
                  </div>
                  {selectedStation.contact.manager ? (
                    <div>
                      <Label className="text-sm font-medium">Manager</Label>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-normal">{selectedStation.contact.manager.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{selectedStation.contact.manager.email}</p>
                        <p className="text-xs text-muted-foreground font-normal">{selectedStation.contact.manager.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium">Manager</Label>
                      <p className="text-sm text-muted-foreground font-normal">No manager assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operational Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-medium">Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Operating Hours</Label>
                    <p className="text-sm sm:text-base font-normal">
                      {selectedStation.operational.operatingHours.is24Hours 
                        ? '24 Hours' 
                        : `${selectedStation.operational.operatingHours.open} - ${selectedStation.operational.operatingHours.close}`
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Number of Pumps</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.operational.pumpCount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fuel Types</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStation.operational.fuelTypes.map((fuel) => (
                        <Badge key={fuel} variant="outline" className="text-xs font-medium">{fuel}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-medium">Financial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Monthly Target</Label>
                    <p className="text-sm sm:text-base font-normal">{formatCurrency(selectedStation.financial.monthlyTarget)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Commission Rate</Label>
                    <p className="text-sm sm:text-base font-normal">{selectedStation.financial.commissionRate}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Security Deposit</Label>
                    <p className="text-sm sm:text-base font-normal">{formatCurrency(selectedStation.financial.securityDeposit)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedStation(null);
                }}
                className="text-sm sm:text-base font-medium"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}