import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { LogOut, User, Settings, RefreshCw, Menu } from 'lucide-react';
import ktcLogo from '../src/media/klogo.png';
import { StationSelector } from './StationSelector';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ROLE_SUPER_ADMIN':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'ROLE_ADMIN':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'ROLE_STATION_MANAGER':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ROLE_SUPER_ADMIN':
        return 'Super Admin';
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_STATION_MANAGER':
        return 'Station Manager';
      default:
        return role;
    }
  };

  const handleQuickRoleSwitch = () => {
    // Clear current user to show login screen for role switching
    logout();
  };

  return (
    <header className="bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3 sm:space-x-6">
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSidebar();
            }}
            className="p-2 hover:bg-accent active:bg-accent/80 md:hover:bg-accent/50 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-border rounded-md"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5 transition-transform duration-200" />
          </Button>
        )}
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img 
            src={ktcLogo} 
            alt="KTC Energy Logo" 
            className="h-8 sm:h-10 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-medium text-foreground">Fuel Station Management</span>
          </div>
        </div>
        
        {/* Station Selector for Admin and Super Admin - Hidden on small screens */}
        <div className="hidden lg:block">
          <StationSelector />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notification Center */}
        <NotificationCenter />
        
        {/* Development: Quick role switch button - Hidden on mobile */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleQuickRoleSwitch}
          className="hidden md:flex items-center space-x-2 bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden lg:inline">Switch Role</span>
          <span className="lg:hidden">Switch</span>
        </Button>

        <Badge className={`${getRoleBadgeColor(user?.role || '')} hidden sm:inline-flex`}>
          <span className="hidden md:inline">{getRoleDisplayName(user?.role || '')}</span>
          <span className="md:hidden">{user?.role === 'ROLE_SUPER_ADMIN' ? 'SA' : user?.role === 'ROLE_ADMIN' ? 'A' : 'SM'}</span>
        </Badge>
        
        {/* Direct logout button for quick access - Hidden on mobile */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="hidden lg:flex items-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent p-1 sm:p-2">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 sm:w-64">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email || user?.username}</p>
              <p className="text-xs text-muted-foreground">
                Role: {getRoleDisplayName(user?.role || '')}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleQuickRoleSwitch} className="text-orange-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Switch Role (Dev)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}