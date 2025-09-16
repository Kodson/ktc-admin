import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StationProvider } from './contexts/StationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ViewPlaceholder } from './components/ViewPlaceholder';
import { SupplyManagement } from './components/SupplyManagement';
import { DailySalesEntry } from './components/DailySalesEntry';
import { SalesEntries } from './components/SalesEntries';
import { Utility } from './components/Utility';
import { Statutory } from './components/Statutory';
import { WashingBay } from './components/WashingBay';
import { Reporting } from './components/Reporting';
import { Settings } from './components/Settings';
import { ProductSharing } from './components/ProductSharing';
import { DailySalesValidation } from './components/DailySalesValidation';
import { DailySalesApproval } from './components/DailySalesApproval';
import { ProductSharingApproval } from './components/ProductSharingApproval';
import { PriceApproval } from './components/PriceApproval';
import { SystemAlerts } from './components/SystemAlerts';
import { StationManagement } from './components/StationManagement';
import { UserManagement } from './components/UserManagement';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // For debugging, start with sidebar visible on all screen sizes
    // Initialize based on screen size - collapsed on mobile by default
    if (typeof window !== 'undefined') {
      console.log('Initial window width:', window.innerWidth);
      return window.innerWidth < 768;
    }
    return false; // Default to visible for SSR
  });

  // Auto-collapse sidebar when resizing to mobile, but only if explicitly resizing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      // Clear any pending timeout
      clearTimeout(timeoutId);
      
      // Debounce the resize to avoid rapid calls
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        const wasDesktop = window.innerWidth >= 768;
        
        // Only auto-collapse if we're resizing from desktop to mobile
        // Don't interfere with manual toggle actions
        if (isMobile && !sidebarCollapsed && wasDesktop) {
          setSidebarCollapsed(true);
        }
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Keyboard accessibility - ESC to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  console.log('App - Current user:', user);
  console.log('App - Active view:', activeView);
  console.log('App - Sidebar collapsed:', sidebarCollapsed);

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        // Show AdminDashboard for Admin and Super Admin users
        if (user.role === 'admin' || user.role === 'super_admin') {
          return <AdminDashboard />;
        }
        // Show regular Dashboard for Station Manager
        return <Dashboard />;
      case 'supply':
        return <SupplyManagement />;
      case 'daily-sales-entry':
        return <DailySalesEntry />;
      case 'sales-entries':
        return <SalesEntries onViewChange={setActiveView} />;
      case 'utility':
        return <Utility />;
      case 'statutory':
        return <Statutory />;
      case 'washing-bay':
        return <WashingBay />;
      case 'reporting':
        return <Reporting />;
      case 'settings':
        return <Settings />;
      case 'product-sharing':
        return <ProductSharing />;
      case 'daily-sales-validation':
        return <DailySalesValidation />;
      case 'daily-sales-approval':
        return <DailySalesApproval />;
      case 'product-sharing-approval':
        return <ProductSharingApproval />;
      case 'price-approval':
        return <PriceApproval />;
      case 'station-management':
        return <StationManagement />;
      case 'user-management':
        return <UserManagement />;
      default:
        return <ViewPlaceholder view={activeView} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <NotificationProvider>
        <StationProvider>
          {/* Mobile overlay when sidebar is expanded */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden cursor-pointer"
              onClick={() => setSidebarCollapsed(true)}
              onTouchEnd={() => setSidebarCollapsed(true)}
              aria-hidden="true"
            />
          )}
          
          <Sidebar 
            activeView={activeView} 
            onViewChange={(view) => {
              setActiveView(view);
              // Auto-collapse on mobile after navigation (with small delay to allow the navigation to complete)
              if (window.innerWidth < 768) {
                setTimeout(() => setSidebarCollapsed(true), 150);
              }
            }}
            collapsed={sidebarCollapsed}
          />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header 
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              sidebarCollapsed={sidebarCollapsed}
            />
            
            {/* System Alerts */}
            <div className="px-4 sm:px-6 pt-4">
              <SystemAlerts />
            </div>
            
            <main className="flex-1 overflow-auto">
              {renderMainContent()}
            </main>
          </div>
          
          {/* Toast notifications */}
          <Toaster />
        </StationProvider>
      </NotificationProvider>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}