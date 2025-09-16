import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, SystemAlert } from '../types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  systemAlerts: SystemAlert[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock system alerts - in real app these would come from API
const mockSystemAlerts: SystemAlert[] = [
  {
    id: 'maintenance-1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for December 20, 2024 from 2:00 AM to 4:00 AM GMT. Some features may be temporarily unavailable.',
    startDate: new Date('2024-12-20T02:00:00Z'),
    endDate: new Date('2024-12-20T04:00:00Z'),
    dismissible: true,
    roles: ['super_admin', 'admin', 'station_manager']
  }
];

// Mock notifications based on user role
const generateMockNotifications = (userRole: string, userName: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: 'welcome-1',
      type: 'info',
      title: 'Welcome to KTC Energy',
      message: `Welcome ${userName}! You have successfully logged in to the KTC Energy Management System.`,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      role: ['super_admin', 'admin', 'station_manager']
    }
  ];

  const roleSpecificNotifications: Record<string, Notification[]> = {
    station_manager: [
      {
        id: 'supply-low-1',
        type: 'warning',
        title: 'Low Fuel Supply Alert',
        message: 'Petrol levels are running low at Tema Station. Current level: 15% of tank capacity.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        persistent: true,
        relatedItem: {
          type: 'supply',
          id: 'supply-tema-001',
          station: 'Tema Station'
        }
      },
      {
        id: 'sales-reminder-1',
        type: 'info',
        title: 'Daily Sales Entry Reminder',
        message: 'Don\'t forget to submit your daily sales entry for December 15, 2024.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        relatedItem: {
          type: 'sales_entry',
          id: 'sales-2024-12-15'
        }
      }
    ],
    admin: [
      {
        id: 'validation-pending-1',
        type: 'warning',
        title: 'Sales Validation Required',
        message: '3 daily sales entries are pending validation from Accra Central, Tema, and Kumasi stations.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        read: false,
        actionRequired: true,
        persistent: true
      },
      {
        id: 'sharing-request-1',
        type: 'info',
        title: 'Product Sharing Request',
        message: 'Tema Station has requested 5,000L of Premium Petrol from Accra Central Station.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: false,
        actionRequired: true,
        relatedItem: {
          type: 'product_sharing',
          id: 'share-req-001'
        }
      }
    ],
    super_admin: [
      {
        id: 'approval-pending-1',
        type: 'error',
        title: 'Urgent: Sales Approval Required',
        message: '2 daily sales entries require final approval. Entries from Kumasi and Takoradi stations.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        actionRequired: true,
        persistent: true
      },
      {
        id: 'system-update-1',
        type: 'success',
        title: 'System Update Complete',
        message: 'KTC Energy Management System has been successfully updated to version 1.2.0 with enhanced reporting features.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        read: true
      },
      {
        id: 'monthly-report-1',
        type: 'info',
        title: 'Monthly Report Available',
        message: 'November 2024 comprehensive station performance report is now available for review.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        read: false
      }
    ]
  };

  return [
    ...baseNotifications,
    ...(roleSpecificNotifications[userRole] || [])
  ];
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(mockSystemAlerts);

  // Initialize notifications based on user role
  useEffect(() => {
    if (user) {
      const mockNotifications = generateMockNotifications(user.role, user.name);
      setNotifications(mockNotifications);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const dismissAlert = (id: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    systemAlerts: systemAlerts.filter(alert => 
      !alert.roles || alert.roles.includes(user?.role || '')
    ),
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    clearNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}