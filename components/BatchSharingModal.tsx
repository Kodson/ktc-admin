import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { 
  Layers,
  Plus,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Loader2,
  Package,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { availableStations, sharingTemplates } from '../constants/productSharingData';
import { formatCurrency, calculateTotals, exportBatchTemplate } from '../utils/productSharingHelpers';
import type { BatchProductEntry } from '../types/productSharing';

interface BatchSharingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (products: BatchProductEntry[]) => Promise<void>;
  isSubmitting: boolean;
}

export function BatchSharingModal({ open, onClose, onSubmit, isSubmitting }: BatchSharingModalProps) {
  const [batchProducts, setBatchProducts] = useState<BatchProductEntry[]>([]);
  const [batchStep, setBatchStep] = useState(1); // 1: Setup, 2: Review, 3: Confirm
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const addBatchProduct = () => {
    const newProduct: BatchProductEntry = {
      id: Date.now().toString(),
      product: '',
      stationQuantities: {},
      rate: '',
      salesRate: '',
      totalQty: '0',
      amountCost: '0.00',
      amountSales: '0.00',
      expectedProfit: '0.00'
    };
    setBatchProducts(prev => [...prev, newProduct]);
  };

  const removeBatchProduct = (id: string) => {
    setBatchProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateBatchProduct = (id: string, field: keyof BatchProductEntry, value: any) => {
    setBatchProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };
        
        // Auto-calculate totals for this product
        if (field === 'stationQuantities' || field === 'rate' || field === 'salesRate') {
          const calculated = calculateTotals(
            field === 'stationQuantities' ? value : updated.stationQuantities,
            field === 'rate' ? value : updated.rate,
            field === 'salesRate' ? value : updated.salesRate
          );
          
          updated.totalQty = calculated.totalQty;
          updated.amountCost = calculated.amountCost;
          updated.amountSales = calculated.amountSales;
          updated.expectedProfit = calculated.expectedProfit;
        }
        
        return updated;
      }
      return product;
    }));
  };

  const handleBatchStationQuantityChange = (productId: string, station: string, quantity: string) => {
    updateBatchProduct(productId, 'stationQuantities', {
      ...batchProducts.find(p => p.id === productId)?.stationQuantities,
      [station]: quantity
    });
  };

  const calculateBatchTotals = () => {
    return batchProducts.reduce((totals, product) => {
      totals.totalQty += parseFloat(product.totalQty) || 0;
      totals.totalCost += parseFloat(product.amountCost) || 0;
      totals.totalSales += parseFloat(product.amountSales) || 0;
      totals.totalProfit += parseFloat(product.expectedProfit) || 0;
      return totals;
    }, { totalQty: 0, totalCost: 0, totalSales: 0, totalProfit: 0 });
  };

  const applyTemplate = (templateId: string) => {
    const template = sharingTemplates.find(t => t.id === templateId);
    if (!template) return;

    const templateProducts: BatchProductEntry[] = template.products.map((product, index) => {
      const stationQuantities: Record<string, string> = {};
      product.stationQuantities.forEach(sq => {
        stationQuantities[sq.station] = sq.qty.toString();
      });

      const calculated = calculateTotals(stationQuantities, product.rate.toString(), product.salesRate.toString());

      return {
        id: `template_${Date.now()}_${index}`,
        product: product.product,
        stationQuantities,
        rate: product.rate.toString(),
        salesRate: product.salesRate.toString(),
        totalQty: calculated.totalQty,
        amountCost: calculated.amountCost,
        amountSales: calculated.amountSales,
        expectedProfit: calculated.expectedProfit
      };
    });

    setBatchProducts(templateProducts);
    setSelectedTemplate(templateId);
    setShowTemplateModal(false);
    toast.success(`Applied template: ${template.name}`);
  };

  const handleExportTemplate = () => {
    const message = exportBatchTemplate();
    toast.success(message);
  };

  const handleSubmit = async () => {
    await onSubmit(batchProducts);
    // Reset state after successful submission
    setBatchProducts([]);
    setBatchStep(1);
    setSelectedTemplate('');
  };

  const handleClose = () => {
    setBatchProducts([]);
    setBatchStep(1);
    setSelectedTemplate('');
    onClose();
  };

  return (
    <>
      {/* Main Batch Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Batch Product Sharing</span>
            </DialogTitle>
            <DialogDescription>
              Share multiple products across stations efficiently
            </DialogDescription>
          </DialogHeader>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= batchStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step < batchStep ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                <div className="ml-2 text-sm font-medium">
                  {step === 1 && 'Setup'}
                  {step === 2 && 'Review'}
                  {step === 3 && 'Confirm'}
                </div>
                {step < 3 && (
                  <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Setup */}
          {batchStep === 1 && (
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h3>Quick Start</h3>
                  <p className="text-muted-foreground">Use a template or start from scratch</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Products List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Products ({batchProducts.length})</h3>
                  <Button
                    onClick={addBatchProduct}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {batchProducts.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3>No products added</h3>
                    <p className="text-muted-foreground">Add products manually, use a template, or import from CSV</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {batchProducts.map((product, index) => (
                      <Card key={product.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4>Product {index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBatchProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Product</Label>
                              <Select 
                                value={product.product} 
                                onValueChange={(value) => updateBatchProduct(product.id, 'product', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Super">Super Petrol</SelectItem>
                                  <SelectItem value="Regular">Regular Petrol</SelectItem>
                                  <SelectItem value="Diesel">Diesel</SelectItem>
                                  <SelectItem value="Gas">Gas (LPG)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Cost Rate (₵/L)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.rate}
                                onChange={(e) => updateBatchProduct(product.id, 'rate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sales Rate (₵/L)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.salesRate}
                                onChange={(e) => updateBatchProduct(product.id, 'salesRate', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Station Quantities */}
                          <div className="space-y-2">
                            <Label>Station Quantities</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {availableStations.map(station => (
                                <div key={station} className="flex items-center space-x-2">
                                  <div className="flex-1 min-w-0">
                                    <Label className="text-xs truncate">{station}</Label>
                                  </div>
                                  <div className="w-20">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={product.stationQuantities[station] || ''}
                                      onChange={(e) => handleBatchStationQuantityChange(product.id, station, e.target.value)}
                                      className="text-right text-xs"
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-4">L</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Product Summary */}
                          <div className="bg-muted/20 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <div className="font-medium">{parseFloat(product.totalQty).toLocaleString()} L</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Cost:</span>
                                <div className="font-medium">{formatCurrency(parseFloat(product.amountCost))}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sales:</span>
                                <div className="font-medium">{formatCurrency(parseFloat(product.amountSales))}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Profit:</span>
                                <div className={`font-medium ${parseFloat(product.expectedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(parseFloat(product.expectedProfit))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {batchStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3>Review Batch</h3>
                <p className="text-muted-foreground">Verify all product details before submission</p>
              </div>

              {/* Batch Summary */}
              <Card className="p-4 bg-muted/20">
                <h4 className="font-medium mb-4">Batch Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totals = calculateBatchTotals();
                    return (
                      <>
                        <div>
                          <span className="text-muted-foreground">Total Products:</span>
                          <div className="font-medium">{batchProducts.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Quantity:</span>
                          <div className="font-medium">{totals.totalQty.toLocaleString()} L</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Value:</span>
                          <div className="font-medium">{formatCurrency(totals.totalSales)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Profit:</span>
                          <div className={`font-medium ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(totals.totalProfit)}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Card>

              {/* Product Details */}
              <div className="space-y-4">
                <h4>Product Details</h4>
                {batchProducts.map((product, index) => (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{product.product} - Product {index + 1}</h5>
                        <Badge variant="outline">{parseFloat(product.totalQty).toLocaleString()} L</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-medium mb-2">Station Distribution</h6>
                          <div className="space-y-1">
                            {Object.entries(product.stationQuantities)
                              .filter(([_, qty]) => parseFloat(qty) > 0)
                              .map(([station, qty]) => (
                                <div key={station} className="flex justify-between text-sm">
                                  <span>{station}</span>
                                  <span className="font-medium">{parseFloat(qty).toLocaleString()} L</span>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="text-sm font-medium mb-2">Financial Summary</h6>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Cost Rate:</span>
                              <span>{formatCurrency(parseFloat(product.rate))}/L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sales Rate:</span>
                              <span>{formatCurrency(parseFloat(product.salesRate))}/L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Cost:</span>
                              <span>{formatCurrency(parseFloat(product.amountCost))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Sales:</span>
                              <span>{formatCurrency(parseFloat(product.amountSales))}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Expected Profit:</span>
                              <span className={parseFloat(product.expectedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(parseFloat(product.expectedProfit))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {batchStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <div>
                  <h3>Batch Ready for Submission</h3>
                  <p className="text-muted-foreground">All products have been validated and are ready to be shared</p>
                </div>
              </div>

              {/* Final Summary */}
              <Card className="p-6 text-left">
                <h4 className="font-medium mb-4 text-center">Final Summary</h4>
                {(() => {
                  const totals = calculateBatchTotals();
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Products to Share:</span>
                          <span className="font-medium">{batchProducts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Quantity:</span>
                          <span className="font-medium">{totals.totalQty.toLocaleString()} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stations Involved:</span>
                          <span className="font-medium">
                            {new Set(batchProducts.flatMap(p => 
                              Object.entries(p.stationQuantities)
                                .filter(([_, qty]) => parseFloat(qty) > 0)
                                .map(([station, _]) => station)
                            )).size}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-medium">{formatCurrency(totals.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Sales Value:</span>
                          <span className="font-medium">{formatCurrency(totals.totalSales)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Expected Profit:</span>
                          <span className={totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(totals.totalProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2">
            {batchStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setBatchStep(prev => prev - 1)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            {batchStep < 3 ? (
              <Button 
                onClick={() => setBatchStep(prev => prev + 1)}
                disabled={batchProducts.length === 0 || batchProducts.some(p => !p.product || parseFloat(p.totalQty) <= 0)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={batchProducts.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share All Products
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Select Template</span>
            </DialogTitle>
            <DialogDescription>
              Choose from pre-defined sharing templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {sharingTemplates.map((template) => (
              <Card key={template.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
                onClick={() => applyTemplate(template.id)}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.products.length} products</Badge>
                  </div>
                  <p className="text-muted-foreground">{template.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Products: {template.products.map(p => p.product).join(', ')}</span>
                    <span>•</span>
                    <span>
                      Stations: {new Set(template.products.flatMap(p => p.stationQuantities.map(sq => sq.station))).size}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}