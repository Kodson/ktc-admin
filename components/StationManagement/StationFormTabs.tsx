import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

import { 
  GHANA_REGIONS, 
  GHANA_FUEL_TYPES, 
  STANDARD_TANK_CAPACITIES, 
  formatPhoneNumber 
} from '../../constants/stationManagementConstants';
import type { StationFormData } from '../../types/stationManagement';

interface StationFormTabsProps {
  formData: StationFormData;
  validationErrors: { [key: string]: string[] };
  onUpdateField: (field: keyof StationFormData, value: any) => void;
  onFuelTypesChange: (fuelType: string, checked: boolean) => void;
  onTankCapacityChange: (fuelType: string, capacity: number) => void;
}

export function StationFormTabs({
  formData,
  validationErrors,
  onUpdateField,
  onFuelTypesChange,
  onTankCapacityChange
}: StationFormTabsProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic" className="text-sm sm:text-base font-medium">Basic Info</TabsTrigger>
        <TabsTrigger value="location" className="text-sm sm:text-base font-medium">Location</TabsTrigger>
        <TabsTrigger value="operations" className="text-sm sm:text-base font-medium">Operations</TabsTrigger>
        <TabsTrigger value="financial" className="text-sm sm:text-base font-medium">Financial</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4 sm:space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Station Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              placeholder="e.g., KTC Accra Central"
              className="text-sm sm:text-base font-normal"
            />
            {validationErrors.name && (
              <p className="text-xs text-red-600">{validationErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Station Code *</Label>
            <Input
              value={formData.code}
              onChange={(e) => onUpdateField('code', e.target.value)}
              placeholder="e.g., KTC-ACC-01"
              className="text-sm sm:text-base font-normal"
            />
            {validationErrors.code && (
              <p className="text-xs text-red-600">{validationErrors.code[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Phone *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => onUpdateField('phone', formatPhoneNumber(e.target.value))}
              placeholder="+233 XX XXX XXXX"
              className="text-sm sm:text-base font-normal"
            />
            {validationErrors.phone && (
              <p className="text-xs text-red-600">{validationErrors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              placeholder="station@ktcenergy.com.gh"
              className="text-sm sm:text-base font-normal"
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600">{validationErrors.email[0]}</p>
            )}
          </div>
        </div>


      </TabsContent>
      
      <TabsContent value="location" className="space-y-4 sm:space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Region *</Label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => onUpdateField('region', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {GHANA_REGIONS.map(({ region }) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose from Ghana's 16 regions
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">City/Town *</Label>
            <Select 
              value={formData.city} 
              onValueChange={(value) => onUpdateField('city', value)}
              disabled={!formData.region}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city or town" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {formData.region && GHANA_REGIONS
                  .find(r => r.region === formData.region)?.cities
                  .map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.region 
                ? `Choose from cities/towns in ${formData.region}` 
                : 'Select a region first'
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm sm:text-base font-medium">Address *</Label>
          <Textarea
            value={formData.address}
            onChange={(e) => onUpdateField('address', e.target.value)}
            placeholder="Street address, landmarks, etc."
            className="text-sm sm:text-base font-normal"
            rows={3}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="operations" className="space-y-4 sm:space-y-6 mt-6">
        <div>
          <h4 className="text-sm sm:text-base font-medium mb-3">Operating Hours</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Opening Time</Label>
              <Input
                type="time"
                value={formData.operatingHours.open}
                onChange={(e) => onUpdateField('operatingHours', {
                  ...formData.operatingHours,
                  open: e.target.value
                })}
                className="text-sm sm:text-base font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Closing Time</Label>
              <Input
                type="time"
                value={formData.operatingHours.close}
                onChange={(e) => onUpdateField('operatingHours', {
                  ...formData.operatingHours,
                  close: e.target.value
                })}
                className="text-sm sm:text-base font-normal"
                disabled={formData.operatingHours.is24Hours}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">24 Hours Operation</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formData.operatingHours.is24Hours}
                  onCheckedChange={(checked) => onUpdateField('operatingHours', {
                    ...formData.operatingHours,
                    is24Hours: !!checked
                  })}
                />
                <span className="text-sm font-normal">Open 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm sm:text-base font-medium mb-3">Fuel Types & Capacity</h4>
          <div className="space-y-4">
            {GHANA_FUEL_TYPES.map(fuelType => (
              <div key={fuelType} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.fuelTypes.includes(fuelType)}
                    onCheckedChange={(checked) => onFuelTypesChange(fuelType, !!checked)}
                  />
                  <span className="text-sm font-medium">{fuelType}</span>
                </div>
                {formData.fuelTypes.includes(fuelType) && (
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-normal">Capacity (L):</Label>
                    <Input
                      type="number"
                      value={formData.tankCapacity[fuelType] || ''}
                      onChange={(e) => onTankCapacityChange(fuelType, parseInt(e.target.value) || 0)}
                      placeholder="40000"
                      className="w-24 text-sm font-normal"
                      min="10000"
                      max="100000"
                      step="1000"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm sm:text-base font-medium">Number of Pumps</Label>
          <Input
            type="number"
            value={formData.pumpCount}
            onChange={(e) => onUpdateField('pumpCount', parseInt(e.target.value) || 0)}
            placeholder="4"
            className="text-sm sm:text-base font-normal w-32"
            min="2"
            max="20"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="financial" className="space-y-4 sm:space-y-6 mt-6">
        <div className="space-y-2">
          <Label className="text-sm sm:text-base font-medium">Monthly Target (₵)</Label>
          <Input
            type="number"
            value={formData.monthlyTarget}
            onChange={(e) => onUpdateField('monthlyTarget', parseFloat(e.target.value) || 0)}
            placeholder="200000"
            className="text-sm sm:text-base font-normal w-full md:w-1/2"
            min="50000"
            max="2000000"
            step="10000"
          />
          {validationErrors.monthlyTarget && (
            <p className="text-xs text-red-600">{validationErrors.monthlyTarget[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Set the monthly sales target for this station in Ghana Cedis
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm sm:text-base font-medium">Notes</Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => onUpdateField('notes', e.target.value)}
            placeholder="Additional information about the station..."
            className="text-sm sm:text-base font-normal"
            rows={3}
          />
        </div>
      </TabsContent>


    </Tabs>
  );
}