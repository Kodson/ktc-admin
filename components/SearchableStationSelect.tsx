import { useState } from 'react';
import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown, Building } from 'lucide-react';
import { cn } from './ui/utils';
import { useStationManagement } from '../hooks/useStationManagement';
// Ghana stations data for the searchable dropdown


interface SearchableStationSelectProps {
  stations: Array<{ name: string; location: string }>;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeValue?: string; // To exclude current station in "to station" dropdowns
}

export function SearchableStationSelect({
  value,
  onValueChange,
  placeholder = "Select station...",
  className,
  disabled = false,
  excludeValue
}: SearchableStationSelectProps) {
  const [open, setOpen] = useState(false);

    const {
    stations
  } = useStationManagement();
const stationsData = stations.map(station => ({
  value: station.id,
  label: station.name,
  region: station.location.region
}));

  // Filter out excluded station if provided
  const availableStations = stationsData.filter(station => 
    !excludeValue || station.value !== excludeValue
  );

  // Group stations by region for better organization
  const stationsByRegion = availableStations.reduce((acc, station) => {
    if (!acc[station.region]) {
      acc[station.region] = [];
    }
    acc[station.region].push(station);
    return acc;
  }, {} as Record<string, typeof stationsData>);

  const selectedStation = stationsData.find(station => station.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Building className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selectedStation ? selectedStation.label : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search stations..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            {Object.entries(stationsByRegion).map(([region, stations]) => (
              <CommandGroup key={region} heading={region}>
                {stations.map((station) => (
                  <CommandItem
                    key={station.value}
                    value={station.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{station.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === station.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}