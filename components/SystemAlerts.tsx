import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { useNotifications } from '../contexts/NotificationContext';
import { X, AlertTriangle, Info, Wrench, XCircle } from 'lucide-react';

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'maintenance':
      return <Wrench className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getAlertVariant = (type: string) => {
  switch (type) {
    case 'error':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
};

const getAlertStyles = (type: string) => {
  switch (type) {
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600';
    case 'maintenance':
      return 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600';
    case 'info':
      return 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600';
    case 'error':
      return ''; // Uses default destructive styling
    default:
      return '';
  }
};

export function SystemAlerts() {
  const { systemAlerts, dismissAlert } = useNotifications();

  if (systemAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {systemAlerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={getAlertVariant(alert.type)}
          className={getAlertStyles(alert.type)}
        >
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              <span>{alert.title}</span>
              {alert.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Dismiss alert</span>
                </Button>
              )}
            </AlertTitle>
            <AlertDescription>
              {alert.message}
              {alert.endDate && (
                <div className="mt-2 text-xs opacity-80">
                  Until: {alert.endDate.toLocaleDateString()} at {alert.endDate.toLocaleTimeString()}
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
}