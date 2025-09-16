export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actionRequired?: boolean;
  relatedItem?: {
    type: 'sales_entry' | 'product_sharing' | 'supply' | 'expense';
    id: string;
    station?: string;
  };
  role?: string[]; // Which roles should see this notification
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'maintenance';
  title: string;
  message: string;
  startDate: Date;
  endDate?: Date;
  dismissible: boolean;
  roles?: string[]; // Which roles should see this alert
}