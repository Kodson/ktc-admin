import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useStationManagement } from '../hooks/useStationManagement';
import type { Station } from '../types/stationManagement';

interface StationContextType {
  stations: Station[];
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
  canSelectStation: boolean;
}

const StationContext = createContext<StationContextType | undefined>(undefined);


export function StationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { stations, lastError, refreshData } = useStationManagement();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    if (lastError) {
      console.error('Station fetch error:', lastError);
    }
  }, [lastError]);

  // Always fetch stations for station managers on login
  useEffect(() => {
    if (user?.role === 'ROLE_STATION_MANAGER') {
      refreshData();
      console.log('Triggered station fetch for station manager:', user?.name);
    }
  }, [user, refreshData]);

  useEffect(() => {
    if (stations.length > 0) {
      // For station managers, auto-select their station using manager object
      if (user?.role === 'ROLE_STATION_MANAGER') {
        const found = stations.find(station => station.contact.manager && station.contact.manager.name === user.name);
        setSelectedStation(found || stations[0]);
        console.log('Auto-selected station for manager:', found || stations[0]);
      } else {
        // For admin/super admin, default to first station
        setSelectedStation(stations[0]);
        console.log('Auto-selected first station for admin/super admin:', stations[0]);
      }
    } else {
      setSelectedStation(null);
      console.warn('No stations available to select.');
    }
  }, [stations, user]);

  // Only admin and super admin can select different stations
  const canSelectStation = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN';

  return (
    <StationContext.Provider value={{
      stations,
      selectedStation,
      setSelectedStation,
      canSelectStation
    }}>
      {children}
    </StationContext.Provider>
  );
}


export function useStation() {
  const context = useContext(StationContext);
  if (context === undefined) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}