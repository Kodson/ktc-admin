import { Building2, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { useStation } from '../contexts/StationContext';

export function StationIndicator() {
  const { selectedStation } = useStation();

  if (!selectedStation) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <span>Viewing data for:</span>
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4" />
        <span className="font-medium text-foreground">{selectedStation.name}</span>
        <Badge variant="secondary" className="text-xs">
          {selectedStation.location.city}, {selectedStation.location.region}
        </Badge>
      </div>
    </div>
  );
}