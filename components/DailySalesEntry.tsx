import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wifi,
  WifiOff,
  DollarSign,
  Gauge,
  Package,
  Info,
  Save,
} from 'lucide-react';
//import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { StationIndicator } from './StationIndicator';
import { useDailySalesEntry } from '../hooks/useDailySalesEntry';
import { 
  FUEL_PRODUCTS,
  formatCurrency,
  formatLiters,
  GHANA_FUEL_RATES
} from '../constants/dailySalesConstants';

export function DailySalesEntry() {
  //const { user } = useAuth();
  const { selectedStation } = useStation();
  
  const {
    entry,
    updateEntry,
    previousDayData,
    supplyData,
    isFirstEntry,
    isSubmitting,
    connectionStatus,
    lastError,
    validationErrors,
    submitEntry,
    canSubmit,
    hasRequiredFields
  } = useDailySalesEntry();

  // UI state
  const [showCalculations, setShowCalculations] = useState(false);
  const [rateInput, setRateInput] = useState(entry.rate?.toString() ?? '');
  const [closingStockInput, setClosingStockInput] = useState(entry.closingSL?.toLocaleString() ?? '');

  // Sync rateInput with entry.rate changes
  useEffect(() => {
    setRateInput(entry.rate?.toString() ?? '');
  }, [entry.rate]);

  // Sync closingStockInput with entry.closingSL changes
  useEffect(() => {
    setClosingStockInput(entry.closingSL?.toLocaleString() ?? '');
  }, [entry.closingSL]);

  // Add debugging effect
  useEffect(() => {
    console.log('DailySalesEntry - Entry state changed:', {
      openSL: entry.openSL,
      supply: entry.supply,
      overageShortageL: entry.overageShortageL,
      availableL: entry.availableL,
      product: entry.product,
      date: entry.date
    });
  }, [entry.openSL, entry.supply, entry.overageShortageL, entry.availableL, entry.product, entry.date]);

  // Handle form submission
  const handleSubmit = async () => {
    const success = await submitEntry();
    if (success) {
      // Form is reset in the hook
    }
  };

  // Format number for display
  /*const formatNumber = (value: number | undefined): string => {
    return value !== undefined ? value.toLocaleString() : '';
  };*/

  // Handle input changes with proper number conversion
  const handleNumericInput = (field: keyof typeof entry, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      updateEntry(field, numericValue);
    } else if (value === '') {
      updateEntry(field, 0);
    }
  };

  return (
    <div className="card-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium">Daily Sales Entry</h1>
          <p className="text-muted-foreground text-sm sm:text-base font-normal">
            {selectedStation?.name || 'Select a station'} - Record daily fuel sales and stock movements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            {connectionStatus.connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  Connected {connectionStatus.responseTime && `(${connectionStatus.responseTime}ms)`}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-medium">Mock Mode</span>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculations(!showCalculations)}
            className="text-sm sm:text-base font-medium"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {showCalculations ? 'Hide' : 'Show'} Calculations
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {lastError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {lastError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Validation Issues:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm font-normal">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Debug Info:</strong> openSL: {entry.openSL || 'undefined'}, supply: {entry.supply || 'undefined'}, overage: {entry.overageShortageL || 'undefined'}, available: {entry.availableL || 'undefined'}
          </AlertDescription>
        </Alert>
      )}

      {/* Station Indicator */}
      <StationIndicator />

      {/* Main Entry Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Entry Form - Takes 2 columns on XL screens */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                <Calendar className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Select date and product for daily sales entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Date *</Label>
                  <Input
                    type="date"
                    value={entry.date || ''}
                    onChange={(e) => updateEntry('date', e.target.value)}
                    className="text-sm sm:text-base font-normal"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Product *</Label>
                  <Select 
                    value={entry.product || ''} 
                    onValueChange={(value) => updateEntry('product', value)}
                  >
                    <SelectTrigger className="text-sm sm:text-base font-normal">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_PRODUCTS.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data Source Information */}
              {(previousDayData || supplyData || isFirstEntry) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Data Source Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Previous Day Data:</span>
                      {previousDayData ? (
                        <div className="text-blue-600 font-normal">
                          Found - Opening values pre-filled
                        </div>
                      ) : isFirstEntry ? (
                        <div className="text-blue-600 font-normal">
                          First entry - Please enter opening values
                        </div>
                      ) : (
                        <div className="text-gray-600 font-normal">Not available</div>
                      )}
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Supply Data:</span>
                      {supplyData ? (
                        <div className="text-blue-600 font-normal">
                          Found - {formatLiters(supplyData.qty)} 
                          {supplyData.hasOverageShortage && ` (${supplyData.overageShortageAmount > 0 ? '+' : ''}${supplyData.overageShortageAmount}L)`}
                        </div>
                      ) : (
                        <div className="text-gray-600 font-normal">No supply for this date</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                <Package className="h-5 w-5" />
                <span>Stock Management</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Enter stock levels and movements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">
                    Opening Stock (L) *
                    {isFirstEntry && <span className="text-orange-600"> - First Entry</span>}
                  </Label>
                  <Input
                    type="number"
                    value={entry.openSL !== undefined ? entry.openSL.toString() : ''}
                    onChange={(e) => handleNumericInput('openSL', e.target.value)}
                    placeholder="Enter opening stock"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="1"
                    disabled={!isFirstEntry && previousDayData !== null}
                  />
                  {previousDayData && !isFirstEntry && (
                    <p className="text-xs text-green-600 font-normal">
                      Auto-filled from previous day: {formatLiters(previousDayData.closingSL)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Supply Received (L)</Label>
                  <Input
                    type="number"
                    value={entry.supply !== undefined ? entry.supply.toString() : ''}
                    onChange={(e) => handleNumericInput('supply', e.target.value)}
                    placeholder="Enter supply"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="1"
                    disabled={supplyData !== null}
                  />
                  {supplyData && (
                    <p className="text-xs text-green-600 font-normal">
                      Auto-filled from supply: {formatLiters(supplyData.qty)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Overage/Shortage (L)</Label>
                  <Input
                    type="number"
                    value={entry.overageShortageL !== undefined ? entry.overageShortageL.toString() : ''}
                    onChange={(e) => handleNumericInput('overageShortageL', e.target.value)}
                    placeholder="+ for overage, - for shortage"
                    className="text-sm sm:text-base font-normal"
                    step="1"
                    disabled={supplyData?.hasOverageShortage}
                  />
                  {supplyData?.hasOverageShortage && (
                    <p className="text-xs text-green-600 font-normal">
                      Auto-filled: {supplyData.overageShortageAmount > 0 ? '+' : ''}{supplyData.overageShortageAmount}L
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Available Stock (L)</Label>
                  <Input
                    type="text"
                    value={entry.availableL !== undefined ? formatLiters(entry.availableL) : ''}
                    className="text-sm sm:text-base font-normal bg-green-50 text-green-700"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-green-600 font-normal">
                    Calculated: Opening ({entry.openSL || 0}) + Supply ({entry.supply || 0}) + Overage/Shortage ({entry.overageShortageL || 0}) = {entry.availableL || 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Closing Stock (L) *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={closingStockInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      
                      // Allow empty, digits, and commas
                      if (/^[\d,]*$/.test(value)) {
                        setClosingStockInput(value);
                        
                        // Convert to number by removing commas
                        if (value === '') {
                          updateEntry('closingSL', 0);
                        } else {
                          const numericValue = parseFloat(value.replace(/,/g, ''));
                          if (!isNaN(numericValue)) {
                            updateEntry('closingSL', numericValue);
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      // Format with commas on blur if it's a number
                      if (closingStockInput !== '' && !isNaN(parseFloat(closingStockInput.replace(/,/g, '')))) {
                        const numericValue = parseFloat(closingStockInput.replace(/,/g, ''));
                        const formatted = numericValue.toLocaleString();
                        setClosingStockInput(formatted);
                        updateEntry('closingSL', numericValue);
                      }
                    }}
                    placeholder="Enter closing stock (e.g., 7,000)"
                    className="text-sm sm:text-base font-normal"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Sales Check (L)</Label>
                  <Input
                    type="text"
                    value={entry.checkL !== undefined ? formatLiters(entry.checkL) : ''}
                    className="text-sm sm:text-base font-normal bg-blue-50 text-blue-700"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-blue-600 font-normal">
                    Calculated: Available - Closing Stock
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meter Readings & Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                <Gauge className="h-5 w-5" />
                <span>Meter Readings & Sales</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Enter meter readings and calculate sales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">
                    Opening Reading *
                    {isFirstEntry && <span className="text-orange-600"> - First Entry</span>}
                  </Label>
                  <Input
                    type="number"
                    value={entry.openSR !== undefined ? entry.openSR.toString() : ''}
                    onChange={(e) => handleNumericInput('openSR', e.target.value)}
                    placeholder="Enter opening reading"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="0.01"
                    disabled={!isFirstEntry && previousDayData !== null}
                  />
                  {previousDayData && !isFirstEntry && (
                    <p className="text-xs text-green-600 font-normal">
                      Auto-filled: {previousDayData.closingSR.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Closing Reading *</Label>
                  <Input
                    type="number"
                    value={entry.closingSR !== undefined ? entry.closingSR.toString() : ''}
                    onChange={(e) => handleNumericInput('closingSR', e.target.value)}
                    placeholder="Enter closing reading"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Return to Tank (L)</Label>
                  <Input
                    type="number"
                    value={entry.returnTT !== undefined ? entry.returnTT.toString() : ''}
                    onChange={(e) => handleNumericInput('returnTT', e.target.value)}
                    placeholder="Enter return amount"
                    className="text-sm sm:text-base font-normal"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Sales Volume (L)</Label>
                  <Input
                    type="text"
                    value={entry.salesL !== undefined ? formatLiters(entry.salesL) : ''}
                    className="text-sm sm:text-base font-normal bg-purple-50 text-purple-700"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-purple-600 font-normal">
                    Calculated: Closing - Opening - Return
                  </p>
                </div>
              </div>

              {/* Sales Value Calculation */}
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Rate per Liter (₵) *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={rateInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      
                      // Allow empty, digits, and a single optional decimal
                      if (/^\d*\.?\d*$/.test(value)) {
                        setRateInput(value);
                        
                        // Update numeric value only if it's valid and not just "."
                        if (value === '' || value === '.') {
                          updateEntry('rate', 0);
                        } else {
                          const numericValue = parseFloat(value);
                          if (!isNaN(numericValue)) {
                            updateEntry('rate', numericValue);
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      // Format to 2 decimal places on blur if it's a number
                      if (rateInput !== '' && !isNaN(parseFloat(rateInput))) {
                        const formatted = parseFloat(rateInput).toFixed(2);
                        setRateInput(formatted);
                        updateEntry('rate', parseFloat(formatted));
                      }
                    }}
                    placeholder="Enter rate"
                    className="text-sm sm:text-base font-normal"
                  />
                  {entry.product && (
                    <p className="text-xs text-blue-600 font-normal">
                      Current market rate: {formatCurrency(GHANA_FUEL_RATES[entry.product as keyof typeof GHANA_FUEL_RATES])}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Total Sales Value (₵)</Label>
                  <Input
                    type="text"
                    value={entry.value ? formatCurrency(entry.value) : ''}
                    className="text-sm sm:text-base font-normal bg-green-50 text-green-700"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-green-600 font-normal">
                    Calculated: Rate × Sales Volume
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Difference (L)</Label>
                  <Input
                    type="text"
                    value={entry.differenceL !== undefined ? formatLiters(entry.differenceL) : ''}
                    className={`text-sm sm:text-base font-normal ${
                      entry.differenceL === 0 ? 'bg-green-50 text-green-700' : 
                      Math.abs(entry.differenceL || 0) > 50 ? 'bg-red-50 text-red-700' : 
                      'bg-yellow-50 text-yellow-700'
                    }`}
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-600 font-normal">
                    Sales Volume - Sales Check
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl font-medium">
                <DollarSign className="h-5 w-5" />
                <span>Financial Management</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Record cash flows and banking transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sales Breakdown */}
              <div>
                <h4 className="text-sm sm:text-base font-medium mb-3">Sales Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Credit Sales (₵)</Label>
                    <Input
                      type="number"
                      value={entry.creditSales !== undefined ? entry.creditSales.toString() : ''}
                      onChange={(e) => handleNumericInput('creditSales', e.target.value)}
                      placeholder="Enter credit sales"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Cash Sales (₵)</Label>
                    <Input
                      type="text"
                      value={entry.cashSales ? formatCurrency(entry.cashSales) : ''}
                      className="text-sm sm:text-base font-normal bg-blue-50 text-blue-700"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-blue-600 font-normal">
                      Calculated: Total Sales - Credit Sales
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cash Management */}
              <div>
                <h4 className="text-sm sm:text-base font-medium mb-3">Cash Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Advances Given (₵)</Label>
                    <Input
                      type="number"
                      value={entry.advances !== undefined ? entry.advances.toString() : ''}
                      onChange={(e) => handleNumericInput('advances', e.target.value)}
                      placeholder="Enter advances"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Shortage/Mobile Money (₵)</Label>
                    <Input
                      type="number"
                      value={entry.shortageMomo !== undefined ? entry.shortageMomo.toString() : ''}
                      onChange={(e) => handleNumericInput('shortageMomo', e.target.value)}
                      placeholder="Enter shortage/momo"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Cash Available (₵)</Label>
                    <Input
                      type="text"
                      value={entry.cashAvailable ? formatCurrency(entry.cashAvailable) : ''}
                      className="text-sm sm:text-base font-normal bg-orange-50 text-orange-700"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-orange-600 font-normal">
                      Cash Sales - Advances - Shortage/Momo
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Repayments & Collections */}
              <div>
                <h4 className="text-sm sm:text-base font-medium mb-3">Repayments & Collections</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Shortage/Momo Repayment (₵)</Label>
                    <Input
                      type="number"
                      value={entry.repaymentShortageMomo !== undefined ? entry.repaymentShortageMomo.toString() : ''}
                      onChange={(e) => handleNumericInput('repaymentShortageMomo', e.target.value)}
                      placeholder="Enter repayment"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Advances Repayment (₵)</Label>
                    <Input
                      type="number"
                      value={entry.repaymentAdvances !== undefined ? entry.repaymentAdvances.toString() : ''}
                      onChange={(e) => handleNumericInput('repaymentAdvances', e.target.value)}
                      placeholder="Enter repayment"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Received from Debtors (₵)</Label>
                    <Input
                      type="number"
                      value={entry.receivedFromDebtors !== undefined ? entry.receivedFromDebtors.toString() : ''}
                      onChange={(e) => handleNumericInput('receivedFromDebtors', e.target.value)}
                      placeholder="Enter amount"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Banking */}
              <div>
                <h4 className="text-sm sm:text-base font-medium mb-3">Banking</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Cash to Bank (₵)</Label>
                    <Input
                      type="text"
                      value={entry.cashToBank ? formatCurrency(entry.cashToBank) : ''}
                      className="text-sm sm:text-base font-normal bg-green-50 text-green-700"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-green-600 font-normal">
                      Cash Available + All Repayments + Debtors
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Bank Lodgement (₵) *</Label>
                    <Input
                      type="number"
                      value={entry.bankLodgement !== undefined ? entry.bankLodgement.toString() : ''}
                      onChange={(e) => handleNumericInput('bankLodgement', e.target.value)}
                      placeholder="Enter actual bank lodgement"
                      className="text-sm sm:text-base font-normal"
                      min="0"
                      step="0.01"
                    />
                    {entry.cashToBank && entry.bankLodgement && (
                      <p className={`text-xs font-normal ${
                        Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Variance: {formatCurrency(Math.abs(entry.cashToBank - entry.bankLodgement))}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Notes</Label>
                <Textarea
                  value={entry.notes || ''}
                  onChange={(e) => updateEntry('notes', e.target.value)}
                  placeholder="Any additional notes or explanations..."
                  className="text-sm sm:text-base font-normal"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel - Takes 1 column on XL screens */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Entry Summary</CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">
                Overview of current entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Product:</span>
                  <span className="text-sm font-medium">{entry.product || 'Not selected'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{entry.date || 'Not selected'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Available Stock:</span>
                  <span className="text-sm font-medium">{entry.availableL ? formatLiters(entry.availableL) : '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Sales Volume:</span>
                  <span className="text-sm font-medium">{entry.salesL ? formatLiters(entry.salesL) : '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Sales Value:</span>
                  <span className="text-sm font-medium">{entry.value ? formatCurrency(entry.value) : '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Cash to Bank:</span>
                  <span className="text-sm font-medium">{entry.cashToBank ? formatCurrency(entry.cashToBank) : '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-muted-foreground">Bank Lodgement:</span>
                  <span className="text-sm font-medium">{entry.bankLodgement ? formatCurrency(entry.bankLodgement) : '—'}</span>
                </div>
                
                {/* Variance Alert */}
                {entry.cashToBank && entry.bankLodgement && (
                  <div className={`p-3 rounded-lg ${
                    Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 ? 'Variance OK' : 'High Variance'}
                      </span>
                    </div>
                    <p className={`text-xs font-normal mt-1 ${
                      Math.abs(entry.cashToBank - entry.bankLodgement) <= 100 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(Math.abs(entry.cashToBank - entry.bankLodgement))} difference
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full text-sm sm:text-base font-medium"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Entry
                  </>
                )}
              </Button>

              {/* Completion Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {hasRequiredFields ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className={`text-sm font-medium ${hasRequiredFields ? 'text-green-700' : 'text-yellow-700'}`}>
                    {hasRequiredFields ? 'Required fields complete' : 'Missing required fields'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {validationErrors.length === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${validationErrors.length === 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {validationErrors.length === 0 ? 'Validation passed' : `${validationErrors.length} validation errors`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculations Card - Show when toggled */}
          {showCalculations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-medium">Calculation Details</CardTitle>
                <CardDescription className="text-sm sm:text-base font-normal">
                  How values are calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-medium">Available Stock:</span>
                    <br />
                    Opening + Supply + Overage/Shortage
                    <br />
                    <span className="text-muted-foreground">
                      {entry.openSL || 0} + {entry.supply || 0} + {entry.overageShortageL || 0} = {entry.availableL || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Sales Check:</span>
                    <br />
                    Available - Closing Stock
                  </div>
                  <div>
                    <span className="font-medium">Sales Volume:</span>
                    <br />
                    Closing Reading - Opening Reading - Return TT
                  </div>
                  <div>
                    <span className="font-medium">Difference:</span>
                    <br />
                    Sales Volume - Sales Check
                  </div>
                  <div>
                    <span className="font-medium">Sales Value:</span>
                    <br />
                    Rate × Sales Volume
                  </div>
                  <div>
                    <span className="font-medium">Cash Sales:</span>
                    <br />
                    Total Sales - Credit Sales
                  </div>
                  <div>
                    <span className="font-medium">Cash Available:</span>
                    <br />
                    Cash Sales - Advances - Shortage/Momo
                  </div>
                  <div>
                    <span className="font-medium">Cash to Bank:</span>
                    <br />
                    Cash Available + All Repayments + Debtors
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}