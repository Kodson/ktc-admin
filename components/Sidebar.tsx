import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  FileText, 
  Receipt, 
  Zap, 
  Scale, 
  Droplets, 
  BarChart3,
  Share2,
  CheckCircle,
  CheckCircle2,
  TrendingUp,
  Settings,
  Building2
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  category?: string;
}

const menuItems: MenuItem[] = [
  // Dashboard - Available to all roles
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER']
  },

  // Super Admin specific items
  {
    id: 'daily-sales-approval',
    label: 'Daily Sales Approval',
    icon: <CheckCircle2 className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN'],
    category: 'Approvals'
  },
  {
    id: 'product-sharing-approval',
    label: 'Product Sharing Approval',
    icon: <CheckCircle className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN'],
    category: 'Approvals'
  },
  {
    id: 'price-approval',
    label: 'Price Approval',
    icon: <TrendingUp className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
    category: 'Approvals'
  },

  // Admin specific items
  {
    id: 'product-sharing',
    label: 'Product Sharing',
    icon: <Share2 className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
    category: 'Management'
  },
  {
    id: 'station-management',
    label: 'Station Management',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
    category: 'Management'
  },
  {
    id: 'daily-sales-validation',
    label: 'Daily Sales Validation',
    icon: <CheckCircle className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
    category: 'Validation'
  },

  // Station Manager items (also available to Admin and Super Admin)
  {
    id: 'supply',
    label: 'Supply',
    icon: <Package className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'daily-sales-entry',
    label: 'Daily Sales Entry',
    icon: <PlusCircle className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'sales-entries',
    label: 'Sales Entries',
    icon: <FileText className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: <Receipt className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: <Zap className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'statutory',
    label: 'Statutory',
    icon: <Scale className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'washing-bay',
    label: 'Washing Bay',
    icon: <Droplets className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER'],
    category: 'Operations'
  },

  // Settings - Available to all roles
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER']
  }
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  collapsed?: boolean;
}

export function Sidebar({ activeView, onViewChange, collapsed = false }: SidebarProps) {
  const { user } = useAuth();

  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User role:', user?.role);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  console.log('Sidebar - Filtered menu items:', filteredMenuItems);

  // Fallback: if no items are filtered (which shouldn't happen), show basic dashboard and settings
  const finalMenuItems: MenuItem[] = filteredMenuItems.length > 0 ? filteredMenuItems : [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STATION_MANAGER']
    }
  ];

  // Group items by category for better organization
  const groupedItems = finalMenuItems.reduce((acc, item) => {
    const category = item.category || 'Main';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <div key={title} className="space-y-2">
      {title !== 'Main' && !collapsed && (
        <div className="px-3 py-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h4>
        </div>
      )}
      {items.map(item => {
        const buttonContent = (
          <Button
            key={item.id}
            variant={activeView === item.id ? "default" : "ghost"}
            className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} ${
              activeView === item.id 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                : 'hover:bg-sidebar-accent'
            }`}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon}
            {!collapsed && <span className="ml-2">{item.label}</span>}
          </Button>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                {buttonContent}
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        }

        return buttonContent;
      })}
    </div>
  );

  return (
    <TooltipProvider>
      <aside 
        className={`
          bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out
          ${collapsed 
            ? 'fixed md:relative w-64 h-full z-50 -translate-x-full md:translate-x-0 md:w-16' 
            : 'fixed md:relative w-64 h-full z-50 translate-x-0'
          }
        `}
      >
        <nav className={`${collapsed ? 'p-2' : 'p-4'} space-y-4 h-full overflow-y-auto`}>
          {/* Debug indicator */}
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded mb-2">
            User: {user?.name || 'None'} | Role: {user?.role || 'None'} | Items: {finalMenuItems.length}
            {user?.role === 'ROLE_STATION_MANAGER' && user?.stationId && (
              <div className="mt-1 font-medium">Station: {user.stationId}</div>
            )}
          </div>
          
          {/* Main items (Dashboard and Settings) */}
          {groupedItems.Main && renderMenuSection('Main', groupedItems.Main.filter(item => item.id !== 'settings'))}
          
          {/* Approvals section (Super Admin only) */}
          {groupedItems.Approvals && renderMenuSection('Approvals', groupedItems.Approvals)}
          
          {/* Management section (Admin only) */}
          {groupedItems.Management && renderMenuSection('Management', groupedItems.Management)}
          
          {/* Validation section (Admin only) */}
          {groupedItems.Validation && renderMenuSection('Validation', groupedItems.Validation)}
          
          {/* Operations section (Station Manager + higher roles) */}
          {groupedItems.Operations && renderMenuSection('Operations', groupedItems.Operations)}
          
          {/* Settings - always at bottom */}
          {(() => {
            const settingsItem = groupedItems.Main?.find(item => item.id === 'settings');
            if (settingsItem) {
              return (
                <div className={`pt-4 border-t border-sidebar-border ${collapsed ? 'border-t-0 pt-2' : ''}`}>
                  {renderMenuSection('', [settingsItem])}
                </div>
              );
            }
            return null;
          })()}
        </nav>
      </aside>
    </TooltipProvider>
  );
}