import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  FileText, 
  Clock, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Download,
  Plus,
  Search,
  Eye,
  RotateCcw,
 // ExternalLink,
  Calendar,
  Building,
  Shield,
  Flame,
  Droplets,
  Zap,
  Heart,
  X,
  Edit,
  //Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStatutoryManagement } from '../hooks/useStatutoryManagement';

// Initial form data
const initialDocumentForm = {
  type: '',
  title: '',
  authority: '',
  reference: '',
  registeredDate: '',
  issuedDate: '',
  expiresDate: '',
  fees: '',
  paymentStatus: 'PENDING',
  assignee: '',
  notes: ''
};

export function Statutory() {
  const {
    // Data
    documents,
    statistics,
    monthlyExpirations,
    documentDistribution,
    upcomingDeadlines,
    
    // State
    isLoading,
    //isSubmitting,
    //connectionStatus,
    lastError,
    filters,
    
    // Actions
    createStatutoryDocument,
    updateStatutoryDocument,
    renewStatutoryDocument,
   // deleteStatutoryDocument,
    exportStatutoryData,
    updateFilters,
    
    // Utilities
    formatCurrency
  } = useStatutoryManagement();

  const [activeTab, setActiveTab] = useState('documents');
  
  // Modal states
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false);
  const [isEditDocumentOpen, setIsEditDocumentOpen] = useState(false);
  const [isRenewDocumentOpen, setIsRenewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentForm, setDocumentForm] = useState(initialDocumentForm);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'expiring soon':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-blue-600 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'overdue':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business license':
        return <Building className="h-4 w-4" />;
      case 'environmental permit':
        return <Droplets className="h-4 w-4" />;
      case 'fire safety certificate':
        return <Flame className="h-4 w-4" />;
      case 'fuel retail license':
        return <Zap className="h-4 w-4" />;
      case 'health permit':
        return <Heart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = filters.search ? (
      doc.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.authority.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.type.toLowerCase().includes(filters.search.toLowerCase())
    ) : true;
    const matchesStatus = filters.status === 'all' || doc.status.toLowerCase().replace(' ', ' ') === filters.status?.toLowerCase();
    const matchesDocType = filters.documentType === 'all' || doc.type.toLowerCase() === filters.documentType?.toLowerCase();
    const matchesPayment = filters.paymentStatus === 'all' || doc.paymentStatus.toLowerCase() === filters.paymentStatus?.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesDocType && matchesPayment;
  });

  const handleAddDocument = async () => {
    const success = await createStatutoryDocument(documentForm);
    if (success) {
      setDocumentForm(initialDocumentForm);
      setIsAddDocumentOpen(false);
    }
  };

  const handleEditDocument = async () => {
    if (!selectedDocument) return;
    
    const success = await updateStatutoryDocument({
      ...documentForm,
      id: selectedDocument.id
    });
    
    if (success) {
      setDocumentForm(initialDocumentForm);
      setIsEditDocumentOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleRenewDocument = async () => {
    if (!selectedDocument) return;
    
    const currentDate = new Date();
    const newExpiryDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
    
    const success = await renewStatutoryDocument({
      id: selectedDocument.id,
      newExpiresDate: newExpiryDate.toISOString().split('T')[0],
      renewalFees: (selectedDocument.fees * 1.1).toString(), // 10% increase
      renewedBy: 'Current User',
      renewedAt: new Date().toISOString(),
      notes: 'Document renewed for one year'
    });
    
    if (success) {
      setIsRenewDocumentOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsViewDocumentOpen(true);
  };

  const handleEditDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setDocumentForm({
      type: document.type,
      title: document.title,
      authority: document.authority,
      reference: document.reference,
      registeredDate: document.registeredDate,
      issuedDate: document.issuedDate,
      expiresDate: document.expiresDate,
      fees: document.fees.toString(),
      paymentStatus: document.paymentStatus,
      assignee: document.assignee,
      notes: ''
    });
    setIsEditDocumentOpen(true);
  };

  const handleRenewDocumentClick = (document: any) => {
    setSelectedDocument(document);
    setIsRenewDocumentOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setDocumentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleExportReport = async () => {
    await exportStatutoryData('csv');
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm font-medium">Loading statutory data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-medium">Statutory Compliance</h1>
          <p className="text-sm text-muted-foreground">Manage regulatory compliance and documentation</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-sm font-medium"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button 
            onClick={() => setIsAddDocumentOpen(true)}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-medium"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Document</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="font-medium text-red-800 text-sm">Error: {lastError.message}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{statistics.complianceScore}%</div>
            <Progress value={statistics.complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{statistics.activeDocuments.count}</div>
            <p className="text-xs text-muted-foreground">of {statistics.activeDocuments.total} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{statistics.expiringSoon.count}</div>
            <p className="text-xs text-muted-foreground">within {statistics.expiringSoon.days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(statistics.overdueFees.amount)}</div>
            <p className="text-xs text-muted-foreground">{statistics.overdueFees.count} expired docs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{statistics.criticalAlerts.count}</div>
            <p className="text-xs text-muted-foreground">{statistics.criticalAlerts.unread} unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Expirations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Monthly Expirations</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Document expiration schedule for the next 12 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyExpirations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Bar dataKey="count" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">Document Distribution</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Current statutory documents by category</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getDocumentIcon(item.name)}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <Badge variant="outline" className="font-medium text-sm">
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Upcoming Deadlines</CardTitle>
          <p className="text-sm text-muted-foreground">Important dates and deadlines in the next 30 days</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingDeadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {deadline.type === 'Document Expiry' ? <Flame className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-medium text-sm">{deadline.title}</div>
                  <div className="text-sm text-muted-foreground">{deadline.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{deadline.date}</div>
                <div className="text-xs text-muted-foreground">{deadline.daysRemaining} days left</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Statutory Documents</CardTitle>
                  <p className="text-sm text-muted-foreground">Track and manage all regulatory documents and permits</p>
                </div>
                <p className="text-sm text-muted-foreground">{filteredDocuments.length} of {documents.length} entries</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, authority, or document number..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-10 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters({ status: value as any })}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="expiring soon">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="under review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.documentType || 'all'} onValueChange={(value) => updateFilters({ documentType: value as any })}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Document Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Document Type</SelectItem>
                      <SelectItem value="business license">Business License</SelectItem>
                      <SelectItem value="environmental permit">Environmental Permit</SelectItem>
                      <SelectItem value="fire safety certificate">Fire Safety Certificate</SelectItem>
                      <SelectItem value="fuel retail license">Fuel Retail License</SelectItem>
                      <SelectItem value="health permit">Health Permit</SelectItem>
                      <SelectItem value="insurance policy">Insurance Policy</SelectItem>
                      <SelectItem value="tax certificate">Tax Certificate</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => updateFilters({ paymentStatus: value as any })}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documents Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Document</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Key Dates</TableHead>
                      <TableHead className="text-center">Fees</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div>
                              <div className="font-medium text-blue-600 text-sm">{doc.type}</div>
                              <div className="text-sm text-muted-foreground">{doc.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doc.authority}</div>
                            <div className="text-sm text-muted-foreground">{doc.reference}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span className="text-muted-foreground">Registered:</span>
                              <span>{doc.registeredDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span className="text-muted-foreground">Issued:</span>
                              <span>{doc.issuedDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span className="text-muted-foreground">Expires:</span>
                              <span className={doc.daysRemaining < 0 ? 'text-red-600' : doc.daysRemaining < 30 ? 'text-orange-600' : ''}>{doc.expiresDate}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {doc.daysRemaining < 0 
                                ? `${Math.abs(doc.daysRemaining)} days overdue`
                                : `${doc.daysRemaining} days remaining`
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div>
                            <div className="font-medium text-sm">{formatCurrency(doc.fees)}</div>
                            <Badge className={getPaymentStatusColor(doc.paymentStatus)}>
                              {doc.paymentStatus}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">{doc.assignee}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleRenewDocumentClick(doc)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditDocumentClick(doc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Inspections Management</h3>
              <p className="text-muted-foreground">Track scheduled inspections and compliance reviews.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Compliance Alerts</h3>
              <p className="text-muted-foreground">Monitor critical compliance alerts and notifications.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Document Modal */}
      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Document
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddDocumentOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select value={documentForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business License">Business License</SelectItem>
                        <SelectItem value="Environmental Permit">Environmental Permit</SelectItem>
                        <SelectItem value="Fire Safety Certificate">Fire Safety Certificate</SelectItem>
                        <SelectItem value="Fuel Retail License">Fuel Retail License</SelectItem>
                        <SelectItem value="Health Permit">Health Permit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Title *</Label>
                    <Input
                      placeholder="e.g., Business Operating License"
                      value={documentForm.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issuing Authority *</Label>
                    <Input
                      placeholder="e.g., Accra Metropolitan Assembly"
                      value={documentForm.authority}
                      onChange={(e) => handleFormChange('authority', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Number *</Label>
                    <Input
                      placeholder="e.g., BOL-2024-001"
                      value={documentForm.reference}
                      onChange={(e) => handleFormChange('reference', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Registered Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.registeredDate}
                      onChange={(e) => handleFormChange('registeredDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issued Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.issuedDate}
                      onChange={(e) => handleFormChange('issuedDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.expiresDate}
                      onChange={(e) => handleFormChange('expiresDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial & Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fees (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2500.00"
                      value={documentForm.fees}
                      onChange={(e) => handleFormChange('fees', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={documentForm.paymentStatus} onValueChange={(value) => handleFormChange('paymentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To *</Label>
                    <Input
                      placeholder="e.g., Station Manager"
                      value={documentForm.assignee}
                      onChange={(e) => handleFormChange('assignee', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this document..."
                    value={documentForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddDocument}
                disabled={!documentForm.type || !documentForm.title || !documentForm.authority || !documentForm.reference || !documentForm.fees}
                className="bg-black text-white hover:bg-gray-800"
              >
                Add Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Modal */}
      <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Document Details - {selectedDocument?.reference}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsViewDocumentOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Document Type</p>
                      <div className="flex items-center gap-2">
                        {selectedDocument.icon}
                        <span className="font-medium">{selectedDocument.type}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{selectedDocument.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-medium">{selectedDocument.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issuing Authority</p>
                      <p className="font-medium">{selectedDocument.authority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{selectedDocument.assignee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedDocument.status)}>
                        {selectedDocument.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dates & Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Registered Date</p>
                      <p className="font-medium">{selectedDocument.registeredDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issued Date</p>
                      <p className="font-medium">{selectedDocument.issuedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{selectedDocument.expiresDate}</p>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className={`font-medium ${selectedDocument.daysRemaining < 0 ? 'text-red-600' : selectedDocument.daysRemaining < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                        {selectedDocument.daysRemaining < 0 
                          ? `${Math.abs(selectedDocument.daysRemaining)} days overdue`
                          : `${selectedDocument.daysRemaining} days remaining`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fees</p>
                      <p className="text-lg font-bold">€{selectedDocument.fees.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge className={getPaymentStatusColor(selectedDocument.paymentStatus)}>
                        {selectedDocument.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsViewDocumentOpen(false);
                    handleEditDocumentClick(selectedDocument);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Document
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDocumentOpen(false);
                    handleRenewDocumentClick(selectedDocument);
                  }}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Renew Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Document Modal */}
      <Dialog open={isEditDocumentOpen} onOpenChange={setIsEditDocumentOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Document - {selectedDocument?.reference}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsEditDocumentOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select value={documentForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business License">Business License</SelectItem>
                        <SelectItem value="Environmental Permit">Environmental Permit</SelectItem>
                        <SelectItem value="Fire Safety Certificate">Fire Safety Certificate</SelectItem>
                        <SelectItem value="Fuel Retail License">Fuel Retail License</SelectItem>
                        <SelectItem value="Health Permit">Health Permit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Title *</Label>
                    <Input
                      placeholder="e.g., Business Operating License"
                      value={documentForm.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issuing Authority *</Label>
                    <Input
                      placeholder="e.g., Accra Metropolitan Assembly"
                      value={documentForm.authority}
                      onChange={(e) => handleFormChange('authority', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Number *</Label>
                    <Input
                      placeholder="e.g., BOL-2024-001"
                      value={documentForm.reference}
                      onChange={(e) => handleFormChange('reference', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Registered Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.registeredDate}
                      onChange={(e) => handleFormChange('registeredDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issued Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.issuedDate}
                      onChange={(e) => handleFormChange('issuedDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={documentForm.expiresDate}
                      onChange={(e) => handleFormChange('expiresDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial & Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fees (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2500.00"
                      value={documentForm.fees}
                      onChange={(e) => handleFormChange('fees', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={documentForm.paymentStatus} onValueChange={(value) => handleFormChange('paymentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To *</Label>
                    <Input
                      placeholder="e.g., Station Manager"
                      value={documentForm.assignee}
                      onChange={(e) => handleFormChange('assignee', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this document..."
                    value={documentForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDocumentOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditDocument}
                disabled={!documentForm.type || !documentForm.title || !documentForm.authority || !documentForm.reference || !documentForm.fees}
                className="bg-black text-white hover:bg-gray-800"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Document Modal */}
      <Dialog open={isRenewDocumentOpen} onOpenChange={setIsRenewDocumentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Renew Document
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsRenewDocumentOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="p-3 bg-muted rounded-lg inline-block mb-4">
                  {selectedDocument.icon}
                </div>
                <h3 className="font-medium">{selectedDocument.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedDocument.reference}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Expiry Date</p>
                <p className="font-medium">{selectedDocument.expiresDate}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDocument.daysRemaining < 0 
                    ? `${Math.abs(selectedDocument.daysRemaining)} days overdue`
                    : `${selectedDocument.daysRemaining} days remaining`
                  }
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Renewing this document will extend the expiry date by one year and mark the payment as paid.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRenewDocumentOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRenewDocument}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Confirm Renewal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}