import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Search,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building,
  Share2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  TrendingDown,
  Info
} from 'lucide-react';
import{
  calculateProfitMargin
} from '../constants/supplyConstants';

// Import the shared hook
import { useProductSharing } from '../hooks/useProductSharing';
import { ensureArray } from '../utils/productSharingHelpers';
import { SharedProduct } from '../types/productSharing';
import { API_ENDPOINTS } from '../constants/productSharingConstants';

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ktc_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

interface ModalState {
  viewDetails: boolean;
  approve: boolean;
  reject: boolean;
  bulkApprove: boolean;
  bulkReject: boolean;
}

interface SelectedRequest {
  id: string;
  originalProductId: number;
  requestDate: string;
  requestTime: string;
  fromStation: string;
  toStation: string;
  requestedBy: string;
  product: string;
  requestedAmount: number;
  estimatedValue: number;
  urgency: string;
  status: string;
  requestInfo: string;
  details: any;
}

export function ProductSharingApproval() {
  // Use the shared product sharing hook
  const {
    sharedProductsData,
    formatCurrency,
    user,
    fetchSharedProducts
  } = useProductSharing();

  const [searchTerm, setSearchTerm] = useState('');
  const [transferSearchTerm, setTransferSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [urgencyFilter, setUrgencyFilter] = useState('All Urgency');
  const [stationFilter, setStationFilter] = useState('All Stations');
  const [selectedRequest, setSelectedRequest] = useState<SelectedRequest | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Transform shared products data to approval request format
  const transformToApprovalRequests = (sharedProducts: SharedProduct[]) => {
    return ensureArray(sharedProducts).map((product: any) => {
      // Get station quantities - handle both array and flattened formats
      const stationQuantities = product.stationQuantities || 
        (product.station && product.qty ? [{ station: product.station, qty: product.qty }] : []);
      
      // For approval requests, we treat each station quantity as a separate request
      // or combine them as a multi-station request
      const allStations = ensureArray(stationQuantities).map((sq: any) => sq.station).join(', ');
      
      return {
        id: `STR-${String(product.id).padStart(3, '0')}`,
        originalProductId: product.id, // Store the original product ID
        requestDate: product.date || new Date().toISOString().split('T')[0],
        requestTime: product.createdAt ? new Date(product.createdAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '09:00 AM',
        fromStation: 'Central Distribution', // Assuming central distribution
        toStation: allStations,
        requestedBy: product.createdBy || user?.name || 'Unknown User',
        product: product.product || 'Unknown',
        requestedAmount: product.qty || product.totalQty || 0,
        estimatedValue: product.expProfit || 0,
        urgency: product.status === 'PENDING' ? 'NORMAL' : 'HIGH',
        status: product.status || 'PENDING',
        requestInfo: `${product.date || 'Unknown Date'}\nby ${product.createdBy || 'Unknown'} (Admin)`,
        salesRate: product.salesRate || 0, // Add salesRate property
        rate: product.rate || 0, // Add rate property for consistency
        details: {
          currentStockFrom: 50000, // Mock value
          currentStockTo: 2000, // Mock value  
          pricePerLiter: product.rate || 0,
          estimatedTransferCost: Math.round((product.qty || product.totalQty || 0) * 0.02), // 2% of volume as transfer cost
          expectedDeliveryDate: product.date || new Date().toISOString().split('T')[0],
          driverAssigned: 'Auto-assigned',
          vehicleNumber: `GT-${Math.floor(Math.random() * 9999)}-20`,
          notes: `Product sharing request for ${product.qty || product.totalQty || 0}L of ${product.product} to ${allStations}`
        }
      };
    });
  };
  
  // Get approval requests from shared products data
  const sharingRequests = transformToApprovalRequests(sharedProductsData);
  
  // Calculate metrics from actual data
  const approvalMetrics = {
    pendingApprovals: sharingRequests.filter(req => req.status === 'PENDING').length,
    emergencyRequests: sharingRequests.filter(req => req.urgency === 'EMERGENCY').length,
    approvedToday: sharingRequests.filter(req => req.status === 'APPROVED' && 
      req.requestDate === new Date().toISOString().split('T')[0]).length,
    totalRequests: sharingRequests.length,
    todaysRequests: sharingRequests.filter(req => 
      req.requestDate === new Date().toISOString().split('T')[0]).length,
    transferValue: sharingRequests.reduce((sum, req) => sum + (req.estimatedValue || 0), 0)
  };
  
  const [modals, setModals] = useState<ModalState>({
    viewDetails: false,
    approve: false,
    reject: false,
    bulkApprove: false,
    bulkReject: false
  });

  const [approvalForm, setApprovalForm] = useState({
    notes: '',
    sendNotification: true,
    approveTransfer: true
  });

  const [rejectionForm, setRejectionForm] = useState({
    reason: '',
    comments: '',
    alternativeSolution: ''
  });

  const filteredRequests = sharingRequests.filter(request => {
    const matchesSearch = 
      request.fromStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.toStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTransferSearch = 
      request.fromStation.toLowerCase().includes(transferSearchTerm.toLowerCase()) ||
      request.toStation.toLowerCase().includes(transferSearchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(transferSearchTerm.toLowerCase()) ||
      request.product.toLowerCase().includes(transferSearchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(transferSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All Urgency' || request.urgency === urgencyFilter;
    const matchesStation = stationFilter === 'All Stations' || 
      request.fromStation === stationFilter || request.toStation === stationFilter;
    
    return matchesSearch && matchesTransferSearch && matchesStatus && matchesUrgency && matchesStation;
  });

  const openModal = (modalName: keyof ModalState, request?: SelectedRequest) => {
    if (request) setSelectedRequest(request);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedRequest(null);
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(filteredRequests.map(request => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedRequests([]);
  };

  // API functions for approve/decline
  const approveSupplyRequest = async (productId: string, approvedBy: string, reason: string) => {

    try {
      console.log('Approving product with ID:', productId, approvedBy, reason);
      const response = await fetch(`${API_ENDPOINTS.approve}/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: productId, approvedBy, reason })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve request: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Approval successful:', result);
      return result;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const declineSupplyRequest = async (productId: string) => {
    try {
      console.log('Declining product with ID:', productId);
      const response = await fetch(API_ENDPOINTS.decline, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: productId })
      });

      if (!response.ok) {
        throw new Error(`Failed to decline request: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Decline successful:', result);
      return result;
    } catch (error) {
      console.error('Error declining request:', error);
      throw error;
    }
  };

  // Helper function to get product ID from selected request
  const getProductIdFromRequest = (request: SelectedRequest): string => {
    // Use the original product ID stored in the request object
    return request.originalProductId.toString();
  };

  // Helper function to extract product ID from request ID (for bulk operations)
  const getProductIdFromRequestId = (requestId: string): string => {
    // Find the request with this ID and get its original product ID
    const request = sharingRequests.find(req => req.id === requestId);
    return request ? request.originalProductId.toString() : requestId;
  };

  const handleReset = () => {
    setSearchTerm('');
    setTransferSearchTerm('');
    setStatusFilter('All Status');
    setUrgencyFilter('All Urgency');
    setStationFilter('All Stations');
  };

  const handleSingleApprove = async () => {
    if (selectedRequest) {
      try {
        const productId = getProductIdFromRequest(selectedRequest);
        const approvedBy = user?.name || 'Current User';
        const reason = approvalForm.notes || 'Request approved';
        await approveSupplyRequest(productId, approvedBy, reason);
        console.log('Request approved:', approvalForm, selectedRequest);
        
        // Refresh the data to get updated status
        await fetchSharedProducts();
        
      } catch (error) {
        console.error('Failed to approve request:', error);
        // You might want to show an error toast here
      }
    }
    closeModal('approve');
    setApprovalForm({ notes: '', sendNotification: true, approveTransfer: true });
  };

  const handleSingleReject = async () => {
    if (selectedRequest) {
      try {
        const productId = getProductIdFromRequest(selectedRequest);
        await declineSupplyRequest(productId);
        console.log('Request rejected:', rejectionForm, selectedRequest);
        
        // Refresh the data to get updated status
        await fetchSharedProducts();
        
      } catch (error) {
        console.error('Failed to reject request:', error);
        // You might want to show an error toast here
      }
    }
    closeModal('reject');
    setRejectionForm({ reason: '', comments: '', alternativeSolution: '' });
  };

  const handleBulkApprove = async () => {
    try {
      const productIds = selectedRequests.map(requestId => getProductIdFromRequestId(requestId));
      const approvedBy = user?.name || 'Current User';
      const reason = approvalForm.notes || 'Bulk approval request';
      await Promise.all(productIds.map(id => approveSupplyRequest(id, approvedBy, reason)));
      console.log('Bulk approved requests:', selectedRequests);
      
      // Refresh the data to get updated status
      await fetchSharedProducts();
      
    } catch (error) {
      console.error('Failed to bulk approve requests:', error);
      // You might want to show an error toast here
    }
    
    setSelectedRequests([]);
    closeModal('bulkApprove');
    setApprovalForm({ notes: '', sendNotification: true, approveTransfer: true });
  };

  const handleBulkReject = async () => {
    try {
      const productIds = selectedRequests.map(requestId => getProductIdFromRequestId(requestId));
      await Promise.all(productIds.map(id => declineSupplyRequest(id)));
      console.log('Bulk rejected requests:', selectedRequests, rejectionForm);
      
      // Refresh the data to get updated status
      await fetchSharedProducts();
      
    } catch (error) {
      console.error('Failed to bulk reject requests:', error);
      // You might want to show an error toast here
    }
    
    setSelectedRequests([]);
    closeModal('bulkReject');
    setRejectionForm({ reason: '', comments: '', alternativeSolution: '' });
  };

  const formatVolume = (volume: number) => {
    return volume.toLocaleString() + 'L';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allSelected = filteredRequests.length > 0 && selectedRequests.length === filteredRequests.length;
  const someSelected = selectedRequests.length > 0 && selectedRequests.length < filteredRequests.length;

  const emergencyCount = sharingRequests.filter(req => req.urgency === 'EMERGENCY' && req.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      {/* Overview Metrics - 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Pending Approvals
              <Info className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{approvalMetrics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Emergency Requests
              <AlertTriangle className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{approvalMetrics.emergencyRequests}</div>
            <p className="text-xs text-muted-foreground">Urgent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Approved Today
              <CheckCircle className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{approvalMetrics.approvedToday}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Total Requests
              <Building className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{approvalMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Today's Requests
              <Calendar className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">{approvalMetrics.todaysRequests}</div>
            <p className="text-xs text-muted-foreground">New today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Transfer Value
              <TrendingUp className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{formatCurrency(approvalMetrics.transferValue)}</div>
            <p className="text-xs text-muted-foreground">Active transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert Banner */}
      {emergencyCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">
              {emergencyCount} emergency transfer request{emergencyCount > 1 ? 's' : ''} require{emergencyCount === 1 ? 's' : ''} immediate approval!
            </span>
          </div>
        </div>
      )}

      {/* Selection Bar */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              {selectedRequests.length} request{selectedRequests.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => openModal('bulkApprove')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => openModal('bulkReject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleClearSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 mb-4">
            {filtersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Filters & Search
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Urgency</Label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Urgency">All Urgency</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Station</Label>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Stations">All Stations</SelectItem>
                  <SelectItem value="Accra Central">Accra Central</SelectItem>
                  <SelectItem value="Kumasi North">Kumasi North</SelectItem>
                  <SelectItem value="Tema Main">Tema Main</SelectItem>
                  <SelectItem value="Cape Coast">Cape Coast</SelectItem>
                  <SelectItem value="Takoradi Central">Takoradi Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Actions</Label>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full mt-1 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Entry Count and Search */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredRequests.length} of {sharingRequests.length} entries
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transfer requests..."
          value={transferSearchTerm}
          onChange={(e) => setTransferSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sharing Requests Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      ref={(el) => {
                        if (el) {
                          const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                          if (checkbox) {
                            checkbox.indeterminate = someSelected;
                          }
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Transfer Route</TableHead>
                  <TableHead>Product & Quantity</TableHead>
                  <TableHead className="text-right text-sm sm:text-base font-medium">Rates</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Info</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) => handleSelectRequest(request.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{request.fromStation}</div>
                          <div className="text-xs text-muted-foreground">From</div>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div>
                          <div className="font-medium">{request.toStation}</div>
                          <div className="text-xs text-muted-foreground">To</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.product}</div>
                        <div className="text-sm">{formatVolume(request.requestedAmount)}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(request.estimatedValue)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                                          <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground font-normal">
                                              Cost: {formatCurrency(request.rate)}/L
                                            </div>
                                            <div className="text-sm sm:text-base font-medium">
                                              Sales: {formatCurrency(request.salesRate)}/L
                                            </div>
                                            <div className="text-xs text-green-600 font-medium">
                                              {calculateProfitMargin(request.salesRate, request.rate).toFixed(1)}% margin
                                            </div>
                                          </div>
                                        </TableCell>
                    <TableCell>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.requestInfo.split('\n').map((line, index) => (
                          <div key={index} className={index === 0 ? 'font-medium' : 'text-muted-foreground'}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => openModal('viewDetails', request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() => openModal('approve', request)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => openModal('reject', request)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3>No requests found</h3>
              <p className="text-muted-foreground">No requests match your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={modals.viewDetails} onOpenChange={() => closeModal('viewDetails')}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Transfer Request Details</span>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `Request ${selectedRequest.id} - ${selectedRequest.fromStation} to ${selectedRequest.toStation}`}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Request ID</Label>
                  <p className="text-sm mt-1 font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <p className="text-sm mt-1">{selectedRequest.requestDate} at {selectedRequest.requestTime}</p>
                </div>
                <div>
                  <Label>From Station</Label>
                  <p className="text-sm mt-1">{selectedRequest.fromStation}</p>
                </div>
                <div>
                  <Label>To Station</Label>
                  <p className="text-sm mt-1">{selectedRequest.toStation}</p>
                </div>
                <div>
                  <Label>Requested By</Label>
                  <p className="text-sm mt-1">{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <Label>Urgency</Label>
                  <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                    {selectedRequest.urgency}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Transfer Details */}
              <div>
                <h4 className="mb-3">Transfer Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product</Label>
                    <p className="text-sm mt-1">{selectedRequest.product}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm mt-1 font-medium">{formatVolume(selectedRequest.requestedAmount)}</p>
                  </div>
                  <div>
                    <Label>Estimated Value</Label>
                    <p className="text-sm mt-1 font-medium">{formatCurrency(selectedRequest.estimatedValue)}</p>
                  </div>
                  <div>
                    <Label>Price per Liter</Label>
                    <p className="text-sm mt-1">{formatCurrency(selectedRequest.details.pricePerLiter)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stock Information */}
              <div>
                <h4 className="mb-3">Current Stock Levels</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Station Stock</Label>
                    <p className="text-sm mt-1">{formatVolume(selectedRequest.details.currentStockFrom)}</p>
                  </div>
                  <div>
                    <Label>To Station Stock</Label>
                    <p className="text-sm mt-1">{formatVolume(selectedRequest.details.currentStockTo)}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.details.notes && (
                <>
                  <Separator />
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm mt-1">{selectedRequest.details.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('viewDetails')}>Close</Button>
            {selectedRequest && selectedRequest.status === 'PENDING' && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    closeModal('viewDetails');
                    openModal('reject', selectedRequest);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    closeModal('viewDetails');
                    openModal('approve', selectedRequest);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Approve Modal */}
      <Dialog open={modals.approve} onOpenChange={() => closeModal('approve')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Transfer Request</span>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `Approve transfer request ${selectedRequest.id}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <div className="font-medium">{selectedRequest.fromStation}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <div className="font-medium">{selectedRequest.toStation}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <div className="font-medium">{selectedRequest.product}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-medium">{formatVolume(selectedRequest.requestedAmount)}</div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes or comments for this approval..."
                value={approvalForm.notes}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approveTransfer"
                  checked={approvalForm.approveTransfer}
                  onCheckedChange={(checked) => setApprovalForm(prev => ({ ...prev, approveTransfer: !!checked }))}
                />
                <Label htmlFor="approveTransfer" className="text-sm">
                  Authorize immediate transfer execution
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNotification"
                  checked={approvalForm.sendNotification}
                  onCheckedChange={(checked) => setApprovalForm(prev => ({ ...prev, sendNotification: !!checked }))}
                />
                <Label htmlFor="sendNotification" className="text-sm">
                  Send notifications to both station managers
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('approve')}>Cancel</Button>
            <Button onClick={handleSingleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Reject Modal */}
      <Dialog open={modals.reject} onOpenChange={() => closeModal('reject')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject Transfer Request</span>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `Reject transfer request ${selectedRequest.id}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Select value={rejectionForm.reason} onValueChange={(value) => setRejectionForm(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insufficient-stock">Insufficient Stock at Source</SelectItem>
                  <SelectItem value="operational-concerns">Operational Concerns</SelectItem>
                  <SelectItem value="cost-ineffective">Cost Ineffective Transfer</SelectItem>
                  <SelectItem value="priority-conflicts">Priority Conflicts</SelectItem>
                  <SelectItem value="transport-unavailable">Transport Unavailable</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Explain the reason for rejection..."
                value={rejectionForm.comments}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, comments: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('reject')}>Cancel</Button>
            <Button 
              onClick={handleSingleReject} 
              variant="destructive"
              disabled={!rejectionForm.reason || !rejectionForm.comments}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Modal */}
      <Dialog open={modals.bulkApprove} onOpenChange={() => closeModal('bulkApprove')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Selected Requests</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedRequests.length} selected requests?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Selected Requests:</div>
                {selectedRequests.map(id => {
                  const request = sharingRequests.find(r => r.id === id);
                  return request ? (
                    <div key={id} className="flex justify-between py-1">
                      <span>{request.id}: {request.fromStation} → {request.toStation}</span>
                      <span className="font-medium">{formatCurrency(request.estimatedValue)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="bulkApprovalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="bulkApprovalNotes"
                placeholder="Add any notes or comments for these approvals..."
                value={approvalForm.notes}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('bulkApprove')}>Cancel</Button>
            <Button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedRequests.length} Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Modal */}
      <Dialog open={modals.bulkReject} onOpenChange={() => closeModal('bulkReject')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject Selected Requests</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedRequests.length} selected requests?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkReason">Reason for Rejection</Label>
              <Select value={rejectionForm.reason} onValueChange={(value) => setRejectionForm(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insufficient-stock">Insufficient Stock at Source</SelectItem>
                  <SelectItem value="operational-concerns">Operational Concerns</SelectItem>
                  <SelectItem value="cost-ineffective">Cost Ineffective Transfer</SelectItem>
                  <SelectItem value="priority-conflicts">Priority Conflicts</SelectItem>
                  <SelectItem value="transport-unavailable">Transport Unavailable</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulkComments">Comments</Label>
              <Textarea
                id="bulkComments"
                placeholder="Explain the reason for rejection..."
                value={rejectionForm.comments}
                onChange={(e) => setRejectionForm(prev => ({ ...prev, comments: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('bulkReject')}>Cancel</Button>
            <Button 
              onClick={handleBulkReject} 
              variant="destructive"
              disabled={!rejectionForm.reason || !rejectionForm.comments}
            >
              Reject {selectedRequests.length} Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}