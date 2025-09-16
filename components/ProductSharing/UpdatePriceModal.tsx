import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TrendingUp, Calculator, Info, Loader2 } from 'lucide-react';
import { formatCurrency} from '../../utils/productSharingHelpers';
import { ensureArray } from '../../utils/productSharingHelpers';
import { FUEL_TYPES, PRICE_UPDATE_SCOPES, type AffectedTank } from '../../constants/productSharingConstants';
import type { SelectedTank } from '../../types/productSharing';

interface UpdatePriceModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  selectedTank: SelectedTank | null;
  tankData: any[];
  priceForm: {
    tankId: string;
    applyTo: 'selected' | 'current_station' | 'all_stations';
    fuelType: string;
    newPrice: string;
    effectiveDate: string;
    reason: string;
    currentStation: string;
  };
  setPriceForm: (form: any) => void;
  isSubmitting: boolean;
}

export function UpdatePriceModal({
  open,
  onClose,
  onUpdate,
  selectedTank,
  tankData,
  priceForm,
  setPriceForm,
  isSubmitting
}: UpdatePriceModalProps) {
  const [affectedTanks, setAffectedTanks] = useState<AffectedTank[]>([]);
  const [calculatingAffected, setCalculatingAffected] = useState(false);

  // Calculate affected tanks for price updates
  const calculateAffectedTanks = () => {
    if (!priceForm.newPrice || !priceForm.fuelType || !priceForm.applyTo) {
      setAffectedTanks([]);
      return;
    }

    setCalculatingAffected(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const newPrice = parseFloat(priceForm.newPrice);
      const validatedTankData = ensureArray(tankData);
      
      let tanksToUpdate: AffectedTank[] = [];
      
      switch (priceForm.applyTo) {
        case 'selected':
          if (selectedTank) {
            const tank = validatedTankData.find(t => t.id === selectedTank.id);
            if (tank && tank.fuelType === priceForm.fuelType) {
              tanksToUpdate = [{
                id: tank.id,
                name: tank.name,
                station: tank.station,
                fuelType: tank.fuelType,
                currentPrice: tank.pricePerLiter,
                newPrice: newPrice,
                priceDifference: newPrice - tank.pricePerLiter,
                percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
              }];
            }
          }
          break;
          
        case 'current_station':
          if (selectedTank) {
            tanksToUpdate = validatedTankData
              .filter(tank => tank.station === selectedTank.station && tank.fuelType === priceForm.fuelType)
              .map(tank => ({
                id: tank.id,
                name: tank.name,
                station: tank.station,
                fuelType: tank.fuelType,
                currentPrice: tank.pricePerLiter,
                newPrice: newPrice,
                priceDifference: newPrice - tank.pricePerLiter,
                percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
              }));
          }
          break;
          
        case 'all_stations':
          tanksToUpdate = validatedTankData
            .filter(tank => tank.fuelType === priceForm.fuelType)
            .map(tank => ({
              id: tank.id,
              name: tank.name,
              station: tank.station,
              fuelType: tank.fuelType,
              currentPrice: tank.pricePerLiter,
              newPrice: newPrice,
              priceDifference: newPrice - tank.pricePerLiter,
              percentageChange: ((newPrice - tank.pricePerLiter) / tank.pricePerLiter) * 100
            }));
          break;
      }
      
      setAffectedTanks(tanksToUpdate);
      setCalculatingAffected(false);
    }, 300);
  };

  // Effect to recalculate affected tanks when price form changes
  useEffect(() => {
    calculateAffectedTanks();
  }, [priceForm.newPrice, priceForm.fuelType, priceForm.applyTo, selectedTank, tankData]);

  // Auto-select "All Stations" when no tank is selected (header button)
  useEffect(() => {
    if (open && !selectedTank && priceForm.applyTo !== 'all_stations') {
      setPriceForm(prev => ({ ...prev, applyTo: 'all_stations' }));
    }
  }, [open, selectedTank]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
            <TrendingUp className="h-5 w-5" />
            <span>Update Fuel Prices</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-normal">
            Update pricing for fuel products with smart scope selection
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Context Header */}
          {selectedTank ? (
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm sm:text-base font-medium">Selected Tank</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTank.name} - {selectedTank.fuelType} at {selectedTank.station}
              </div>
              <div className="text-sm">
                Current Price: <span className="font-medium">{formatCurrency(selectedTank.pricePerLiter)}/L</span>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm sm:text-base font-medium text-blue-900">Enterprise Price Update</span>
              </div>
              <div className="text-sm text-blue-700">
                Update fuel prices across all KTC Energy stations for consistent enterprise-wide pricing.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Apply To</Label>
              <Select value={priceForm.applyTo} onValueChange={(value) => setPriceForm(prev => ({ ...prev, applyTo: value as 'selected' | 'current_station' | 'all_stations' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_UPDATE_SCOPES.map(scope => {
                    // Only disable options when no tank is selected (header button)
                    const shouldDisable = !selectedTank && (scope.value === 'selected' || scope.value === 'current_station');
                    
                    return (
                      <SelectItem 
                        key={scope.value} 
                        value={scope.value}
                        disabled={shouldDisable}
                        className={shouldDisable ? 'text-muted-foreground cursor-not-allowed' : ''}
                      >
                        {scope.value === 'current_station' && selectedTank ? 
                          `Current Station (${selectedTank.station})` : 
                          scope.label
                        }
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Fuel Type</Label>
              <Select value={priceForm.fuelType} onValueChange={(value) => setPriceForm(prev => ({ ...prev, fuelType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map(fuel => (
                    <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">New Price (₵/L)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="8.50"
                value={priceForm.newPrice}
                onChange={(e) => setPriceForm(prev => ({ ...prev, newPrice: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Effective Date & Time</Label>
              <Input
                type="datetime-local"
                value={priceForm.effectiveDate}
                onChange={(e) => setPriceForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                className="text-sm sm:text-base font-normal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium">Reason for Change</Label>
            <Textarea
              placeholder="Enter reason for price change (e.g., market rate adjustment, supplier cost increase)..."
              value={priceForm.reason}
              onChange={(e) => setPriceForm(prev => ({ ...prev, reason: e.target.value }))}
              className="text-sm sm:text-base font-normal"
              rows={3}
            />
          </div>

          <Separator />

          {/* Enhanced Affected Tanks Preview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <Label className="text-sm sm:text-base font-medium">Affected Tanks Preview</Label>
              {calculatingAffected && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            {affectedTanks.length > 0 ? (
              <div className="border rounded-lg">
                <div className="bg-muted/50 px-4 py-3 rounded-t-lg">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {affectedTanks.length} tank{affectedTanks.length !== 1 ? 's' : ''} will be updated
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {priceForm.fuelType}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      New Price: <span className="font-medium text-foreground">{formatCurrency(parseFloat(priceForm.newPrice || '0'))}/L</span>
                    </div>
                  </div>
                  
                  {/* Station Summary when All Stations selected */}
                  {priceForm.applyTo === 'all_stations' && affectedTanks.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Stations affected:</strong> {[...new Set(affectedTanks.map(tank => tank.station))].join(', ')}
                    </div>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/25">
                        <TableHead className="text-xs font-medium">Tank</TableHead>
                        <TableHead className="text-xs font-medium">Station</TableHead>
                        <TableHead className="text-right text-xs font-medium">Current Price</TableHead>
                        <TableHead className="text-right text-xs font-medium">New Price</TableHead>
                        <TableHead className="text-right text-xs font-medium">Price Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affectedTanks
                        .sort((a, b) => {
                          // Sort by station first, then by tank name
                          if (a.station !== b.station) {
                            return a.station.localeCompare(b.station);
                          }
                          return a.name.localeCompare(b.name);
                        })
                        .map((tank, index, sortedArray) => {
                          const previousTank = index > 0 ? sortedArray[index - 1] : null;
                          const isNewStation = !previousTank || previousTank.station !== tank.station;
                          
                          return (
                            <TableRow 
                              key={tank.id} 
                              className={`text-xs hover:bg-muted/30 ${isNewStation && index > 0 ? 'border-t-2 border-muted' : ''}`}
                            >
                              <TableCell className="font-medium">{tank.name}</TableCell>
                              <TableCell className={`${isNewStation ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                {tank.station}
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(tank.currentPrice)}</TableCell>
                              <TableCell className="text-right font-medium text-blue-600">
                                {formatCurrency(tank.newPrice)}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${tank.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <div className="flex flex-col items-end">
                                  <span>
                                    {tank.priceDifference >= 0 ? '+' : ''}{formatCurrency(tank.priceDifference)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({tank.percentageChange >= 0 ? '+' : ''}{tank.percentageChange.toFixed(1)}%)
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Summary Footer for All Stations */}
                {priceForm.applyTo === 'all_stations' && affectedTanks.length > 0 && (
                  <div className="bg-muted/25 px-4 py-2 rounded-b-lg border-t">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <span className="text-xs text-muted-foreground">
                        <strong>Enterprise-wide {priceForm.fuelType} price update</strong> across {[...new Set(affectedTanks.map(tank => tank.station))].length} stations
                      </span>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Avg. Change: </span>
                        <span className={`font-medium ${affectedTanks.reduce((sum, tank) => sum + tank.priceDifference, 0) / affectedTanks.length >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {affectedTanks.reduce((sum, tank) => sum + tank.priceDifference, 0) / affectedTanks.length >= 0 ? '+' : ''}
                          {formatCurrency(affectedTanks.reduce((sum, tank) => sum + tank.priceDifference, 0) / affectedTanks.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm font-normal">
                  {priceForm.newPrice && priceForm.fuelType ? 
                    'No tanks match the selected criteria' : 
                    'Enter price and fuel type to see affected tanks'
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm sm:text-base font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={onUpdate}
            disabled={isSubmitting || affectedTanks.length === 0 || !priceForm.newPrice || !priceForm.reason.trim()}
            className="text-sm sm:text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Update {affectedTanks.length} Tank{affectedTanks.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}