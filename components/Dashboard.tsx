import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  Fuel, 
  DollarSign, 
  Droplets, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Truck
} from 'lucide-react';

export function Dashboard() {
  // Mock data for station manager dashboard
  const stationData = {
    totalSales: 156780,
    dailyTarget: 180000,
    fuelInventory: {
      super: { current: 15420, capacity: 25000 },
      diesel: { current: 8900, capacity: 20000 },
      kerosene: { current: 3200, capacity: 8000 }
    },
    recentActivities: [
      { id: 1, type: 'sale', description: 'Daily sales entry completed', time: '2 hours ago', status: 'completed' },
      { id: 2, type: 'supply', description: 'Fuel delivery received - Super 10,000L', time: '4 hours ago', status: 'completed' },
      { id: 3, type: 'validation', description: 'Sales validation pending', time: '6 hours ago', status: 'pending' },
      { id: 4, type: 'maintenance', description: 'Pump 3 maintenance scheduled', time: '1 day ago', status: 'scheduled' }
    ],
    alerts: [
      { id: 1, type: 'warning', message: 'Diesel stock running low - 8,900L remaining', priority: 'medium' },
      { id: 2, type: 'info', message: 'Daily sales validation required by 6 PM', priority: 'low' }
    ]
  };

  const salesProgress = (stationData.totalSales / stationData.dailyTarget) * 100;

  const getFuelLevel = (current: number, capacity: number) => (current / capacity) * 100;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return DollarSign;
      case 'supply': return Fuel;
      case 'validation': return CheckCircle;
      case 'maintenance': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Station Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your station overview.</p>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          View Detailed Reports
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stationData.totalSales.toLocaleString()}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Target Progress</span>
                <span>{salesProgress.toFixed(1)}%</span>
              </div>
              <Progress value={salesProgress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: ₵{stationData.dailyTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Fuel Inventory - Super */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Petrol</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stationData.fuelInventory.super.current.toLocaleString()}L</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Capacity</span>
                <span>{getFuelLevel(stationData.fuelInventory.super.current, stationData.fuelInventory.super.capacity).toFixed(1)}%</span>
              </div>
              <Progress 
                value={getFuelLevel(stationData.fuelInventory.super.current, stationData.fuelInventory.super.capacity)} 
                className="h-2" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Capacity: {stationData.fuelInventory.super.capacity.toLocaleString()}L
            </p>
          </CardContent>
        </Card>

        {/* Fuel Inventory - Diesel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diesel</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stationData.fuelInventory.diesel.current.toLocaleString()}L</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Capacity</span>
                <span>{getFuelLevel(stationData.fuelInventory.diesel.current, stationData.fuelInventory.diesel.capacity).toFixed(1)}%</span>
              </div>
              <Progress 
                value={getFuelLevel(stationData.fuelInventory.diesel.current, stationData.fuelInventory.diesel.capacity)} 
                className="h-2" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Capacity: {stationData.fuelInventory.diesel.capacity.toLocaleString()}L
            </p>
          </CardContent>
        </Card>

        {/* Fuel Inventory - Kerosene */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kerosene</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stationData.fuelInventory.kerosene.current.toLocaleString()}L</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Capacity</span>
                <span>{getFuelLevel(stationData.fuelInventory.kerosene.current, stationData.fuelInventory.kerosene.capacity).toFixed(1)}%</span>
              </div>
              <Progress 
                value={getFuelLevel(stationData.fuelInventory.kerosene.current, stationData.fuelInventory.kerosene.capacity)} 
                className="h-2" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Capacity: {stationData.fuelInventory.kerosene.capacity.toLocaleString()}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stationData.recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-muted rounded-full p-2 mt-0.5">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stationData.alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${getAlertColor(alert.priority)}`}
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
              
              {stationData.alerts.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <FileText className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Daily Sales</div>
                <div className="text-xs text-muted-foreground">Enter today's sales</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <Truck className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Supply</div>
                <div className="text-xs text-muted-foreground">Manage inventory</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Reports</div>
                <div className="text-xs text-muted-foreground">View analytics</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">Expenses</div>
                <div className="text-xs text-muted-foreground">Track costs</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}