import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import { useStation } from '../contexts/StationContext';

export function StationSelector() {
  const { stations, selectedStation, setSelectedStation, canSelectStation } = useStation();

  console.log('StationSelector stations:', stations);
  console.log('StationSelector selectedStation:', selectedStation);

  if (!canSelectStation) {
    // Station managers see their station as a badge (non-selectable)
    return selectedStation ? (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{selectedStation.name}</span>
        <Badge variant="secondary" className="text-xs">
          {selectedStation.location.city}, {selectedStation.location.region}
        </Badge>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedStation?.id || ''}
        onValueChange={(value) => {
          const station = stations.find(s => s.id === value);
          setSelectedStation(station || null);
          console.log('Station selected:', station);
        }}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a station">
            {selectedStation ? (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{selectedStation.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedStation.location.city}, {selectedStation.location.region}
                </Badge>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stations.map((station) => (
            <SelectItem key={station.id} value={station.id}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{station.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {station.location.city}, {station.location.region}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Manager: {station.contact.manager?.name || 'N/A'}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}