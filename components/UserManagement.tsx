import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { 
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Power,
  PowerOff,
  Key,
  Activity,
  Wifi,
  WifiOff,
  X,
  UserCheck,
  UserX,
  UserMinus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserManagement } from '../hooks/useUserManagement';
import { PasswordStrengthIndicator } from './StationManagement/PasswordStrengthIndicator';
import { 
  USER_ROLES,
  USER_STATUS,
  USER_STATUS_COLORS,
  USER_ROLE_COLORS,
  formatPhoneNumber
} from '../constants/userManagementConstants';
import type { User, UserFormData } from '../types/userManagement';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  
  const {
    users,
    statistics,
    isLoading,
    isSubmitting,
    connectionStatus,
    lastError,
    filters,
    validationErrors,
    createUser,
    updateUserStatus,
    resetPassword,
    deleteUser,
    refreshData,
    updateFilters,
    generatePassword,
    validatePasswordStrength,
    canManageUsers,
    hasData
  } = useUserManagement();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    role: 'station_manager',
    password: '',
    confirmPassword: '',
    mustChangePassword: true,
    notes: '',
    isActive: true,
    isNonLocked: true,
  });

  // Password reset form
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: '',
    confirmPassword: '',
    mustChangePassword: true
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isValid: boolean }>({ score: 0, feedback: [], isValid: false });

  // Handle form field changes
  const updateFormField = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle password changes with strength validation
  const handlePasswordChange = (password: string) => {
    updateFormField('password', password);
    setPasswordStrength(validatePasswordStrength(password));
  };

  // Generate secure password
  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    updateFormField('password', newPassword);
    updateFormField('confirmPassword', newPassword);
    setPasswordStrength(validatePasswordStrength(newPassword));
  };

  // Handle create user
  const handleCreateUser = async () => {
    const success = await createUser(formData);
    if (success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  // Handle view details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handle password reset request
  const handlePasswordResetRequest = (user: User) => {
    setSelectedUser(user);
    setPasswordResetData({
      newPassword: '',
      confirmPassword: '',
      mustChangePassword: true
    });
    setShowPasswordResetModal(true);
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!selectedUser) return;
    
    const success = await resetPassword(selectedUser.id, passwordResetData);
    if (success) {
      setShowPasswordResetModal(false);
      setSelectedUser(null);
      setPasswordResetData({
        newPassword: '',
        confirmPassword: '',
        mustChangePassword: true
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const success = await deleteUser(selectedUser.id);
    if (success) {
      setShowDeleteConfirmModal(false);
      setSelectedUser(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      role: 'station_manager',
      password: '',
      confirmPassword: '',
      mustChangePassword: true,
      notes: '',
      isActive: true,
      isNonLocked: true,
    });
    setPasswordStrength({ score: 0, feedback: [], isValid: false });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return USER_STATUS_COLORS[status as keyof typeof USER_STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get role color
  const getRoleColor = (role: string) => {
    return USER_ROLE_COLORS[role as keyof typeof USER_ROLE_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters({
      status: 'ALL',
      role: 'ALL',
      assignmentStatus: 'ALL',
      needsPasswordReset: 'ALL',
      search: ''
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.status !== 'ALL',
    filters.role !== 'ALL',
    filters.assignmentStatus !== 'ALL',
    filters.needsPasswordReset !== 'ALL',
    filters.search
  ].filter(Boolean).length;

  // Role-based access check
  if (!canManageUsers) {
    return (
      <div className="card-responsive">
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base sm:text-lg lg:text-xl font-medium">Access Restricted</h3>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            You don't have permission to manage users. Please contact an administrator.
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">User Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            Manage KTC Energy system users and their access permissions
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
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium">{statistics.totalUsers}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">System accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-green-600">{statistics.activeUsers}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Can access system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Station Managers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-blue-600">{statistics.stationManagers}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Operational staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm sm:text-base font-medium">Need Password Reset</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-orange-600">{statistics.usersNeedingPasswordReset}</div>
            <p className="text-muted-foreground text-xs sm:text-sm font-normal">Require action</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">KTC Energy Users</CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Manage system users and their permissions
              </CardDescription>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              {users.length} users
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
                Add User
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, email, phone, or name..."
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
                      {Object.entries(USER_STATUS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Select 
                    value={filters.role || 'ALL'} 
                    onValueChange={(value) => updateFilters({ role: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      {Object.entries(USER_ROLES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Assignment Status</Label>
                  <Select 
                    value={filters.assignmentStatus || 'ALL'} 
                    onValueChange={(value) => updateFilters({ assignmentStatus: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned to Stations</SelectItem>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Password Reset</Label>
                  <Select 
                    value={filters.needsPasswordReset || 'ALL'} 
                    onValueChange={(value) => updateFilters({ needsPasswordReset: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="YES">Needs Reset</SelectItem>
                      <SelectItem value="NO">No Reset Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-sm sm:text-base font-medium">User Details</TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">Contact</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Role</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Status</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Assignments</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Last Login</TableHead>
                  <TableHead className="text-center text-sm sm:text-base font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium flex items-center">
                          <UserPlus className="h-3 w-3 mr-1" />
                          {user.fullName}
                        </div>
                        <div className="text-muted-foreground text-xs sm:text-sm font-normal">
                          {user.username}
                        </div>
                        {user.mustChangePassword && (
                          <Badge variant="outline" className="text-xs font-medium bg-yellow-50 text-yellow-700">
                            Password Reset Required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">
                          {user.email}
                        </div>
                        <div className="text-muted-foreground text-xs sm:text-sm font-normal">
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getRoleColor(user.role)} variant="outline">
                        {user.role === 'station_manager' ? 'Station Manager' : user.role === 'admin' ? 'Admin' : user.role === 'super_admin' ? 'Super Admin' : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Badge className={getStatusColor(user.status)} variant="outline">
                          {USER_STATUS[user.status]}
                        </Badge>
                        {user.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateUserStatus(user.id, 'INACTIVE')}
                            disabled={isSubmitting}
                          >
                            <PowerOff className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                        {user.status === 'INACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                            disabled={isSubmitting}
                          >
                            <Power className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {user.assignedStations.length} station{user.assignedStations.length !== 1 ? 's' : ''}
                        </div>
                        {user.assignedStations.length === 0 && (
                          <Badge variant="outline" className="text-xs font-medium bg-gray-50 text-gray-700">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">
                        {user.lastLogin ? 
                          new Date(user.lastLogin).toLocaleDateString('en-GH') : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.mustChangePassword && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handlePasswordResetRequest(user)}
                            disabled={isSubmitting}
                          >
                            <Key className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteConfirmation(user)}
                          disabled={isSubmitting || user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium">No users found</h3>
              <p className="text-muted-foreground text-sm sm:text-base font-normal">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No users have been added to the system yet.'
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
                  Add First User
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Add New User</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Create a new user account for the KTC Energy system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 mt-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm sm:text-base font-medium mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => updateFormField('firstName', e.target.value)}
                    placeholder="e.g., Samuel"
                    className="text-sm sm:text-base font-normal"
                  />
                  {validationErrors.firstName && (
                    <p className="text-xs text-red-600">{validationErrors.firstName[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Last Name *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => updateFormField('lastName', e.target.value)}
                    placeholder="e.g., Osei"
                    className="text-sm sm:text-base font-normal"
                  />
                  {validationErrors.lastName && (
                    <p className="text-xs text-red-600">{validationErrors.lastName[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h4 className="text-sm sm:text-base font-medium mb-3">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Username *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => updateFormField('username', e.target.value)}
                    placeholder="e.g., samuel.osei"
                    className="text-sm sm:text-base font-normal"
                  />
                  {validationErrors.username && (
                    <p className="text-xs text-red-600">{validationErrors.username[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormField('email', e.target.value)}
                    placeholder="samuel.osei@ktcenergy.com.gh"
                    className="text-sm sm:text-base font-normal"
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-600">{validationErrors.email[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateFormField('phone', formatPhoneNumber(e.target.value))}
                    placeholder="+233 XX XXX XXXX"
                    className="text-sm sm:text-base font-normal"
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-red-600">{validationErrors.phone[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => updateFormField('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(USER_ROLES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.role && (
                    <p className="text-xs text-red-600">{validationErrors.role[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Setup */}
            <div>
              <h4 className="text-sm sm:text-base font-medium mb-3">Password Setup</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Password *</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Enter secure password"
                        className="text-sm sm:text-base font-normal"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                      className="text-sm sm:text-base font-medium"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                  
                  <PasswordStrengthIndicator 
                    password={formData.password} 
                    strength={passwordStrength} 
                  />
                  
                  {validationErrors.password && (
                    <p className="text-xs text-red-600">{validationErrors.password[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Confirm Password *</Label>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormField('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className="text-sm sm:text-base font-normal"
                  />
                  {formData.password && formData.confirmPassword && (
                    <div className="text-xs flex items-center space-x-1">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-600">{validationErrors.confirmPassword[0]}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.mustChangePassword}
                    onCheckedChange={(checked) => updateFormField('mustChangePassword', !!checked)}
                  />
                  <Label className="text-sm sm:text-base font-medium">
                    Require password change on first login
                  </Label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormField('notes', e.target.value)}
                placeholder="Additional notes about this user..."
                className="text-sm sm:text-base font-normal"
                rows={3}
              />
            </div>
          </div>

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
              onClick={handleCreateUser}
              disabled={isSubmitting || !formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.password || !passwordStrength.isValid}
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
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Reset password for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">New Password</Label>
              <Input
                type="password"
                value={passwordResetData.newPassword}
                onChange={(e) => setPasswordResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="text-sm sm:text-base font-normal"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Confirm Password</Label>
              <Input
                type="password"
                value={passwordResetData.confirmPassword}
                onChange={(e) => setPasswordResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="text-sm sm:text-base font-normal"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={passwordResetData.mustChangePassword}
                onCheckedChange={(checked) => setPasswordResetData(prev => ({ ...prev, mustChangePassword: !!checked }))}
              />
              <Label className="text-sm sm:text-base font-medium">
                Require password change on next login
              </Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordResetModal(false)}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordReset}
              disabled={isSubmitting || !passwordResetData.newPassword || passwordResetData.newPassword !== passwordResetData.confirmPassword}
              className="text-sm sm:text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Are you sure you want to delete {selectedUser?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Deleting this user will:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Remove all access to the system</li>
                <li>Unassign them from all stations</li>
                <li>Delete all user data permanently</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={isSubmitting}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
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
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}