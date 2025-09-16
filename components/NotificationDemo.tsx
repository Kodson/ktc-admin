import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Zap,
  RefreshCw
} from 'lucide-react';

export function NotificationDemo() {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [demoCount, setDemoCount] = useState(0);

  const showSuccessToast = () => {
    toast.success('Operation completed successfully!', {
      title: 'Success',
      description: 'Your fuel supply has been updated.'
    });
  };

  const showWarningToast = () => {
    toast.warning('Low fuel levels detected at Tema Station', {
      title: 'Fuel Alert',
      persistent: true,
      actionRequired: true,
      relatedItem: {
        type: 'supply',
        id: 'supply-tema-low',
        station: 'Tema Station'
      }
    });
  };

  const showErrorToast = () => {
    toast.error('Failed to connect to fuel monitoring system', {
      title: 'System Error',
      persistent: true,
      actionRequired: true
    });
  };

  const showInfoToast = () => {
    toast.info('Daily maintenance check completed for all pumps', {
      title: 'Maintenance Update',
      persistent: true
    });
  };

  const showLoadingToast = () => {
    const loadingPromise = new Promise((resolve) => {
      setTimeout(() => resolve('Data processed successfully'), 3000);
    });

    toast.loading('Processing fuel delivery data...', loadingPromise);
  };

  const addPersistentNotification = () => {
    setDemoCount(prev => prev + 1);
    addNotification({
      type: 'info',
      title: `Demo Notification #${demoCount + 1}`,
      message: 'This is a persistent notification that will appear in your notification center.',
      persistent: true,
      actionRequired: Math.random() > 0.5,
      relatedItem: {
        type: 'sales_entry',
        id: `demo-${demoCount + 1}`,
        station: 'Demo Station'
      }
    });
  };

  const addUrgentNotification = () => {
    addNotification({
      type: 'error',
      title: 'Urgent: System Alert',
      message: 'Critical fuel shortage detected at multiple stations. Immediate action required.',
      persistent: true,
      actionRequired: true,
      relatedItem: {
        type: 'supply',
        id: 'urgent-shortage',
        station: 'Multiple Stations'
      }
    });
  };

  const addApprovalNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Approval Required',
      message: 'New daily sales entries are pending your approval.',
      persistent: true,
      actionRequired: true,
      relatedItem: {
        type: 'sales_entry',
        id: 'pending-approval',
        station: 'Accra Central'
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification System Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toast Notifications Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span>Toast Notifications</span>
              <Badge variant="secondary" className="text-xs">
                Temporary
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These notifications appear temporarily in the bottom-right corner of the screen.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={showSuccessToast}
                className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Success</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={showWarningToast}
                className="flex items-center space-x-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Warning</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={showErrorToast}
                className="flex items-center space-x-2 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Error</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={showInfoToast}
                className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Info className="h-4 w-4" />
                <span>Info</span>
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <Button
              variant="outline"
              onClick={showLoadingToast}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Loading Demo</span>
            </Button>
          </div>

          <Separator />

          {/* Persistent Notifications Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center space-x-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <span>Notification Center</span>
              <Badge variant="secondary" className="text-xs">
                Persistent
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These notifications are added to your notification center and remain until you dismiss them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={addPersistentNotification}
                className="flex items-center space-x-2"
              >
                <Info className="h-4 w-4" />
                <span>Add Demo</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={addUrgentNotification}
                className="flex items-center space-x-2 border-red-200 text-red-700 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Add Urgent</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={addApprovalNotification}
                className="flex items-center space-x-2 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Add Approval</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to Use Notifications</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Toast notifications</strong> appear temporarily for immediate feedback</li>
              <li>• <strong>Notification center</strong> (bell icon in header) stores important alerts</li>
              <li>• <strong>Red badge</strong> on bell icon shows unread notification count</li>
              <li>• <strong>System alerts</strong> appear at the top of the screen for critical information</li>
              <li>• <strong>Role-based</strong> notifications ensure users see relevant information only</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}