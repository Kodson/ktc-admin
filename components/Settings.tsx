import { useState } from 'react';
import { NotificationDemo } from './NotificationDemo';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useUserManagement } from '../hooks/useUserManagement';
import { toast } from 'sonner';
import { 
  //Settings as SettingsIcon,
  //Building,
  Users,
  DollarSign,
  Monitor,
  Shield,
  Plug,
  Bell,
  Database,
  Save,
  RefreshCw,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  AlertTriangle,
  Fuel,
  Droplets,
  Key,
  Lock,
  CreditCard,
} from 'lucide-react';

// Mock data for settings

const productPricing = [
  { id: 1, name: 'Petrol (95 Octane)', price: 8.50, commissionRate: 15, active: true },
  { id: 2, name: 'Petrol (98 Octane)', price: 9.20, commissionRate: 15, active: true },
  { id: 3, name: 'Diesel', price: 7.80, commissionRate: 12, active: true },
  { id: 4, name: 'Washing Bay Service', price: 25.00, commissionRate: 20, active: true }
];



const systemPreferences = {
  theme: 'light',
  language: 'en',
  timezone: 'GMT+0',
  dateFormat: 'DD/MM/YYYY',
  currency: 'GHS',
  notifications: {
    email: true,
    sms: true,
    push: true,
    lowStock: true,
    highTransactions: true,
    systemUpdates: false
  },
  autoBackup: true,
  backupFrequency: 'daily',
  reportGeneration: 'automatic'
};

const securitySettings = {
  twoFactorAuth: true,
  sessionTimeout: 30,
  passwordExpiry: 90,
  loginAttempts: 5,
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  encryptionEnabled: true,
  auditLogging: true
};

export function Settings() {
  const [activeTab, setActiveTab] = useState('users');

  // Use the comprehensive user management hook
  const { 
    users: fetchedUsers,
    //statistics,
    isLoading: isUsersLoading,
    createUser,
    updateUserStatus,
    deleteUser,
    isSubmitting,
    validationErrors,
    connectionStatus,
    refreshData
  } = useUserManagement();

  const [pricing, setPricing] = useState(productPricing);
  const [preferences, setPreferences] = useState(systemPreferences);
  const [security, setSecurity] = useState(securitySettings);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState<{ 
    username: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: string;
    isActive: boolean;
    isNotLocked: boolean;
  }>({ 
    username: '', 
    name: '',
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    role: 'ROLE_STATION_MANAGER', 
    isActive: true, 
    isNotLocked: true 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChanged, setIsChanged] = useState(false);



  const handlePricingChange = (id: number, field: string, value: any) => {
    setPricing(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setIsChanged(true);
  };

  const handlePreferenceChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPreferences(prev => {
        const parentObj = (prev && typeof prev[parent as keyof typeof prev] === 'object') ? prev[parent as keyof typeof prev] : {};
        return {
          ...prev,
          [parent]: { ...parentObj, [child]: value }
        };
      });
    } else {
      setPreferences(prev => ({ ...prev, [field]: value }));
    }
    setIsChanged(true);
  };

  const handleSecurityChange = (field: string, value: any) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleSaveSettings = () => {
    console.log('Saving settings...');
    setIsChanged(false);
    // Implementation for saving settings
  };

  const resetUserForm = () => {
    setNewUser({ 
      username: '', 
      name: '',
      email: '', 
      phone: '', 
      password: '', 
      confirmPassword: '',
      role: 'ROLE_STATION_MANAGER', 
      isActive: true, 
      isNotLocked: true 
    });
  };

  const handleAddUser = async () => {
    // Basic frontend validation
    if (!newUser.username || !newUser.email || !newUser.phone || !newUser.password) {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields before submitting.'
      });
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newUser.email)) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address.'
      });
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Invalid password', {
        description: 'Password must be at least 8 characters long.'
      });
      return;
    }

    // Map display role to API role values
    const roleMapping: { [key: string]: string } = {
      'Station Manager': 'ROLE_STATION_MANAGER',
      'Admin': 'ROLE_ADMIN',
      'Super Admin': 'ROLE_SUPER_ADMIN'
    };

    // Prepare form data for API call - exact format as specified
    const formData = {
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
      role: roleMapping[newUser.role] || 'ROLE_STATION_MANAGER',
      phone: newUser.phone,
      isActive: newUser.isActive,
      isNonLocked: newUser.isNotLocked
    };

    // Call the API through useUserManagement hook
    const success = await createUser(formData);
    
    if (success) {
      // Reset form and close modal on success
      resetUserForm();
      setIsAddUserOpen(false);
      setIsChanged(true);
      
      toast.success('User created successfully!', {
        description: `${newUser.username} has been added to the system.`
      });
    }
    // Error handling is managed by the useUserManagement hook
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setIsChanged(true);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = fetchedUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const success = await updateUserStatus(userId, newStatus);
    if (success) {
      setIsChanged(true);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'station_manager': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'station_manager': return 'Station Manager';
      default: return role;
    }
  };

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      case 'SUSPENDED': return 'Suspended';
      case 'LOCKED': return 'Locked';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Settings & Configuration</h1>
          <p className="text-muted-foreground">Manage system preferences, users, and application configuration</p>
        </div>
        <div className="flex space-x-2">
          {isChanged && (
            <Button 
              onClick={handleSaveSettings}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          )}
          <Button variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 max-w-5xl">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>



        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>User Management</CardTitle>
                  {/* Connection Status Indicator */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-muted-foreground">
                      {connectionStatus.connected ? 'Connected' : 'Offline (Mock Data)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshData}
                    disabled={isUsersLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isUsersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={() => setIsAddUserOpen(true)} className="bg-black text-white hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  {/* <div className="text-lg font-medium">{statistics.totalUsers}</div> */}
                  <div className="text-xs text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  {/* <div className="text-lg font-medium text-green-700">{statistics.activeUsers}</div> */}
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  {/* <div className="text-lg font-medium text-yellow-700">{statistics.inactiveUsers}</div> */}
                  <div className="text-xs text-muted-foreground">Inactive</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  {/* <div className="text-lg font-medium text-blue-700">{statistics.unassignedUsers}</div> */}
                  <div className="text-xs text-muted-foreground">Unassigned</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isUsersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  </div>
                ) : fetchedUsers.length === 0 ? (
                  <div className="text-center p-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  fetchedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={getRoleColor(user.role)}>
                            {formatRoleDisplay(user.role)}
                          </Badge>
                          <div className="text-sm mt-1">
                            <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {formatStatusDisplay(user.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleUserStatus(user.id)}
                            disabled={isSubmitting}
                          >
                            {user.status === 'ACTIVE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Settings */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Product Pricing & Commission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricing.map((product) => (
                  <div key={product.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {product.name.includes('Washing') ? <Droplets className="h-4 w-4" /> : <Fuel className="h-4 w-4" />}
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price (GHS)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => handlePricingChange(product.id, 'price', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Commission (%)</Label>
                      <Input
                        type="number"
                        value={product.commissionRate}
                        onChange={(e) => handlePricingChange(product.id, 'commissionRate', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={product.active}
                          onCheckedChange={(checked) => handlePricingChange(product.id, 'active', checked)}
                        />
                        <span className="text-sm">{product.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Preferences */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>General Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tw">Twi</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT+0">GMT+0 (Ghana)</SelectItem>
                      <SelectItem value="GMT+1">GMT+1</SelectItem>
                      <SelectItem value="GMT-5">GMT-5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => handlePreferenceChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (Ghanaian Cedi)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Notification Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.sms}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.push', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-xs text-muted-foreground">Alert when inventory is low</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.lowStock}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.lowStock', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Transaction Alerts</Label>
                      <p className="text-xs text-muted-foreground">Alert for unusual transaction volumes</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.highTransactions}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.highTransactions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Updates</Label>
                      <p className="text-xs text-muted-foreground">Notify about system updates</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.systemUpdates}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications.systemUpdates', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup & Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Backup & Data Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-xs text-muted-foreground">Automatically backup data</p>
                    </div>
                    <Switch
                      checked={preferences.autoBackup}
                      onCheckedChange={(checked) => handlePreferenceChange('autoBackup', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select value={preferences.backupFrequency} onValueChange={(value) => handlePreferenceChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Backup
                  </Button>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Restore Backup
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Report Generation</Label>
                  <Select value={preferences.reportGeneration} onValueChange={(value) => handlePreferenceChange('reportGeneration', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Authentication & Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={security.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={security.loginAttempts}
                    onChange={(e) => handleSecurityChange('loginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Security Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Encryption</Label>
                    <p className="text-xs text-muted-foreground">Encrypt sensitive data</p>
                  </div>
                  <Switch
                    checked={security.encryptionEnabled}
                    onCheckedChange={(checked) => handleSecurityChange('encryptionEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Log all user activities</p>
                  </div>
                  <Switch
                    checked={security.auditLogging}
                    onCheckedChange={(checked) => handleSecurityChange('auditLogging', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IP Whitelist</Label>
                  <Textarea
                    value={security.ipWhitelist.join('\n')}
                    onChange={(e) => handleSecurityChange('ipWhitelist', e.target.value.split('\n'))}
                    className="min-h-[100px]"
                    placeholder="Enter IP addresses or ranges, one per line"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">High</div>
                  <p className="text-sm text-muted-foreground">Security Level</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">256-bit</div>
                  <p className="text-sm text-muted-foreground">Encryption</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Key className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Gateway */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Payment Gateway</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Money Integration</Label>
                    <p className="text-xs text-muted-foreground">MTN Mobile Money, Vodafone Cash</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Card Payment</Label>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard support</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value="sk_live_xxxxxxxxxxxxxxxx"
                      className="rounded-r-none"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-l-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External APIs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>External APIs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>KODSON Integration</Label>
                    <p className="text-xs text-muted-foreground">Fuel management system</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>NPA Reporting</Label>
                    <p className="text-xs text-muted-foreground">National Petroleum Authority</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Gateway</Label>
                    <p className="text-xs text-muted-foreground">SMS notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">KODSON Fuel Management</div>
                      <div className="text-sm text-muted-foreground">Connected • Last sync: 2 minutes ago</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">MTN Mobile Money</div>
                      <div className="text-sm text-muted-foreground">Connected • Last transaction: 5 minutes ago</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">NPA Reporting System</div>
                      <div className="text-sm text-muted-foreground">Connection issues • Last report: 2 hours ago</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Demo */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationDemo />
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New User
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddUserOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Create a new user account for the fuel station management system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Station Manager">Station Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email}
                className="bg-black text-white hover:bg-gray-800"
              >
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Add New User</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Create a new user account with password assignment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Full Name *</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="text-sm sm:text-base font-normal"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Email Address *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@ktcenergy.com.gh"
                className="text-sm sm:text-base font-normal"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Station Manager">Station Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password (min 8 characters)"
                  className="text-sm sm:text-base font-normal pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Confirm Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                className="text-sm sm:text-base font-normal"
              />
            </div>
            
            {/* Password validation feedback */}
            {newUser.password && (
              <div className="text-xs space-y-1">
                <div className={`flex items-center space-x-2 ${newUser.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  {newUser.password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>At least 8 characters</span>
                </div>
                {newUser.confirmPassword && (
                  <div className={`flex items-center space-x-2 ${newUser.password === newUser.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {newUser.password === newUser.confirmPassword ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddUserOpen(false);
                setNewUser({
                  username: '',
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  role: 'ROLE_STATION_MANAGER',
                  isActive: true,
                  isNotLocked: true
                });
              }}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword || newUser.password !== newUser.confirmPassword || newUser.password.length < 8}
              className="text-sm sm:text-base font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Edit User</DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-normal">
              Update user information
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Full Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser((prev: Record<string, any>) => ({ ...prev, name: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Email Address</Label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser((prev: Record<string, any>) => ({ ...prev, email: e.target.value }))}
                  className="text-sm sm:text-base font-normal"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Role</Label>
                <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser((prev: Record<string, any>) => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Station Manager">Station Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Status</Label>
                <Select value={selectedUser.status} onValueChange={(value) => setSelectedUser((prev: Record<string, any>) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditUserOpen(false);
                setSelectedUser(null);
              }}
              className="text-sm sm:text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Implement user update logic using fetchedUsers and updateUserStatus if needed
                setIsEditUserOpen(false);
                setSelectedUser(null);
                setIsChanged(true);
              }}
              className="text-sm sm:text-base font-medium"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Add New User</DialogTitle>
            <DialogDescription className="text-sm font-normal">
              Create a new user account for the KTC Energy management system. Data will be synchronized with the backend.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="text-sm font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@ktcenergy.com.gh"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="text-sm font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 XX XXX XXXX or 0XX XXX XXXX"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="text-sm font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (min. 8 characters)"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="text-sm font-normal pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_STATION_MANAGER">Station Manager</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  <SelectItem value="ROLE_SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Active Account</Label>
                  <p className="text-xs text-muted-foreground font-normal">
                    User can log in and access the system
                  </p>
                </div>
                <Switch
                  checked={newUser.isActive}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Account Not Locked</Label>
                  <p className="text-xs text-muted-foreground font-normal">
                    Account is not locked due to failed login attempts
                  </p>
                </div>
                <Switch
                  checked={newUser.isNotLocked}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, isNotLocked: checked })}
                />
              </div>
            </div>
          </div>

          {/* Display validation errors */}
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <div className="space-y-2">
              {Object.entries(validationErrors).map(([field, errors]) => (
                <div key={field} className="text-sm text-red-600">
                  <span className="font-medium capitalize">{field}:</span> {errors.join(', ')}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddUserOpen(false);
                resetUserForm();
              }}
              disabled={isSubmitting}
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800 text-sm font-medium min-w-24"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Edit User</DialogTitle>
            <DialogDescription className="text-sm font-normal">
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Username</Label>
                <Input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="text-sm font-normal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="text-sm font-normal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Station Manager">Station Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-xs text-muted-foreground font-normal">
                    User account is active and can log in
                  </p>
                </div>
                <Switch
                  checked={selectedUser.status === 'Active'}
                  onCheckedChange={(checked) => 
                    setSelectedUser({ ...selectedUser, status: checked ? 'Active' : 'Inactive' })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditUserOpen(false);
                setSelectedUser(null);
              }}
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement user update logic using fetchedUsers and updateUserStatus if needed
                setIsEditUserOpen(false);
                setSelectedUser(null);
                setIsChanged(true);
              }}
              className="bg-black text-white hover:bg-gray-800 text-sm font-medium"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}