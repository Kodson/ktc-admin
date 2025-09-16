import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useStation } from '../contexts/StationContext';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Fuel,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Settings
} from 'lucide-react';

export function AdminDashboard() {
  const { selectedStation } = useStation();

  // Mock data for admin/super admin dashboard with all stations overview
  const dashboardData = {
    totalStations: 8,
    totalSales: 1247890,
    dailyTarget: 1440000,
    validationsPending: 12,
    approvalsPending: 8,
    stationPerformance: [
      {
        id: '1',
        name: 'KTC Energy Tema',
        sales: 189560,
        target: 180000,
        status: 'performing',
        inventory: { super: 85, diesel: 65, kerosene: 90 }
      },
      {
        id: '2', 
        name: 'KTC Energy Circle',
        sales: 156780,
        target: 180000,
        status: 'below_target',
        inventory: { super: 75, diesel: 45, kerosene: 80 }
      },
      {
        id: '3',
        name: 'KTC Energy Madina',
        sales: 198450,
        target: 180000,
        status: 'performing',
        inventory: { super: 90, diesel: 85, kerosene: 70 }
      },
      {
        id: '4',
        name: 'KTC Energy Achimota',
        sales: 142560,
        target: 180000,
        status: 'below_target',
        inventory: { super: 60, diesel: 30, kerosene: 85 }
      }
    ],
    pendingApprovals: [
      { id: 1, type: 'sales', station: 'KTC Energy Tema', date: '2024-01-20', status: 'pending_validation' },
      { id: 2, type: 'product_sharing', station: 'KTC Energy Circle', date: '2024-01-20', status: 'pending_approval' },
      { id: 3, type: 'sales', station: 'KTC Energy Madina', date: '2024-01-19', status: 'pending_validation' },
      { id: 4, type: 'expenses', station: 'KTC Energy Achimota', date: '2024-01-19', status: 'pending_approval' }
    ],
    alerts: [
      { id: 1, type: 'critical', message: 'KTC Energy Achimota - Diesel critically low (30%)', station: 'Achimota', priority: 'high' },
      { id: 2, type: 'warning', message: 'KTC Energy Circle - Daily target not met for 3 days', station: 'Circle', priority: 'medium' },
      { id: 3, type: 'info', message: '12 daily sales entries pending validation', station: 'Multiple', priority: 'low' }
    ]
  };

  const overallProgress = (dashboardData.totalSales / dashboardData.dailyTarget) * 100;

  const getStationStatusColor = (status: string) => {
    switch (status) {
      case 'performing': return 'bg-green-100 text-green-800';
      case 'below_target': return 'bg-red-100 text-red-800';
      case 'meeting_target': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getApprovalIcon = (type: string) => {
    switch (type) {
      case 'sales': return FileText;
      case 'product_sharing': return Users;
      case 'expenses': return DollarSign;
      default: return Clock;
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'pending_validation': return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayTitle = selectedStation ? `${selectedStation.name} Dashboard` : 'Network Overview Dashboard';
  const displayDescription = selectedStation 
    ? `Managing operations for ${selectedStation.name}` 
    : 'Managing all KTC Energy stations across Ghana';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">{displayTitle}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{displayDescription}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Eye className="mr-2 h-4 w-4" />
            Monitor Live
          </Button>
          <Button className="w-full sm:w-auto">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">₵{dashboardData.totalSales.toLocaleString()}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Daily Target</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: ₵{dashboardData.dailyTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Active Stations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stations</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardData.totalStations}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">All operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across Greater Accra
            </p>
          </CardContent>
        </Card>

        {/* Pending Validations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Validations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardData.validationsPending}</div>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-600">Requires attention</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Daily sales entries
            </p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardData.approvalsPending}</div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-600">Action needed</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Various requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Station Performance - Takes up 2/3 on large screens */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Station Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.stationPerformance.map((station) => {
                  const stationProgress = (station.sales / station.target) * 100;
                  return (
                    <div key={station.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{station.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              ₵{station.sales.toLocaleString()} / ₵{station.target.toLocaleString()}
                            </span>
                            <Badge className={`${getStationStatusColor(station.status)} text-xs w-fit`}>
                              {station.status === 'performing' ? 'Meeting Target' : 'Below Target'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex-1 sm:max-w-xs">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{stationProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={stationProgress} className="h-2" />
                        </div>
                      </div>
                      
                      {/* Inventory Levels */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground">Super</div>
                          <div className={`font-medium ${station.inventory.super < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {station.inventory.super}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Diesel</div>
                          <div className={`font-medium ${station.inventory.diesel < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {station.inventory.diesel}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Kerosene</div>
                          <div className={`font-medium ${station.inventory.kerosene < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {station.inventory.kerosene}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Pending Actions - Takes up 1/3 on large screens */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${getAlertColor(alert.priority)}`}
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.station}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.pendingApprovals.map((approval) => {
                  const Icon = getApprovalIcon(approval.type);
                  return (
                    <div key={approval.id} className="flex items-start space-x-3">
                      <div className="bg-muted rounded-full p-2 mt-0.5">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {approval.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{approval.station}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 gap-1">
                          <span className="text-xs text-muted-foreground">{approval.date}</span>
                          <Badge className={`${getApprovalColor(approval.status)} text-xs w-fit`}>
                            {approval.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Validate Sales</div>
                <div className="text-xs text-muted-foreground">Review daily entries</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Users className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Approve Requests</div>
                <div className="text-xs text-muted-foreground">Process pending items</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Network Reports</div>
                <div className="text-xs text-muted-foreground">View analytics</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Settings className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">System Settings</div>
                <div className="text-xs text-muted-foreground">Manage configuration</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}