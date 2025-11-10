import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Share2, 
  Mail, 
  Link, 
  Calendar, 
  Copy, 
  Check, 
  Send, 
  Users, 
  Clock, 
  Shield,
  Download,
  FileText,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  reportType: string;
  reportData: any;
  children: React.ReactNode;
}

const shareTemplates = {
  'weekly-operations': {
    subject: 'Weekly Operations Report - {station}',
    body: `Hi {recipient},

Please find the weekly operations report for {station} attached.

Key highlights:
• Total Sales: {totalSales}
• Net Profit: {totalProfit}
• Vehicles Served: {totalVehicles}
• Operational Efficiency: {efficiency}%

Report Period: {period}
Generated: {date}

Best regards,
KTC Energy Management System`
  },
  'weekly-sales': {
    subject: 'Weekly Sales Analysis - {station}',
    body: `Hi {recipient},

Please find the weekly sales analysis report for {station} attached.

Performance Summary:
• Weekly Revenue: {totalSales}
• Profit Margin: {profitMargin}%
• Transaction Volume: {totalVehicles} vehicles
• Growth Rate: {growthRate}%

This report provides detailed insights into our sales performance and trends.

Best regards,
KTC Energy Management System`
  },
  'monthly': {
    subject: 'End of Month Report - {station}',
    body: `Hi {recipient},

Please find the end of month report for {station} attached.

Monthly Overview:
• Total Revenue: {totalSales}
• Net Profit: {totalProfit}
• Monthly Growth: {growthRate}%
• Operational Efficiency: {efficiency}%

This comprehensive report covers all aspects of our monthly operations.

Best regards,
KTC Energy Management System`
  },
  'annual': {
    subject: 'Annual Performance Report - {station}',
    body: `Hi {recipient},

Please find the annual performance report for {station} attached.

Annual Highlights:
• Total Revenue: {totalSales}
• Annual Profit: {totalProfit}
• Year-over-Year Growth: {growthRate}%
• Total Vehicles Served: {totalVehicles}

This report provides a comprehensive overview of our annual performance.

Best regards,
KTC Energy Management System`
  }
};

const predefinedRecipients = [
  { id: 'admin', name: 'Admin Team', email: 'admin@ktcenergy.com', role: 'Admin' },
  { id: 'management', name: 'Management Team', email: 'management@ktcenergy.com', role: 'Management' },
  { id: 'finance', name: 'Finance Department', email: 'finance@ktcenergy.com', role: 'Finance' },
  { id: 'operations', name: 'Operations Team', email: 'operations@ktcenergy.com', role: 'Operations' }
];

const sharePermissions = [
  { id: 'view', label: 'View Only', description: 'Recipients can view the report but cannot edit or share' },
  { id: 'download', label: 'View & Download', description: 'Recipients can view and download the report' },
  { id: 'share', label: 'View, Download & Share', description: 'Recipients can view, download, and share with others' }
];

export function ShareModal({ reportType, reportData, children }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customEmails, setCustomEmails] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [scheduleSharing, setScheduleSharing] = useState(false);
  const [shareFrequency, setShareFrequency] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize email template when modal opens
  const initializeEmailTemplate = () => {
    const template = shareTemplates[reportType as keyof typeof shareTemplates];
    if (template && reportData) {
      setEmailSubject(template.subject
        .replace('{station}', 'Accra Central Station')
      );
      
      setEmailBody(template.body
        .replace('{station}', 'Accra Central Station')
        .replace('{totalSales}', `₵${reportData.totalSales?.toLocaleString()}`)
        .replace('{totalProfit}', `₵${reportData.totalProfit?.toLocaleString()}`)
        .replace('{totalVehicles}', reportData.totalVehicles?.toLocaleString())
        .replace('{efficiency}', reportData.operationalEfficiency?.toString())
        .replace('{profitMargin}', reportData.profitMargin?.toString())
        .replace('{growthRate}', reportData.growthRate?.toString())
        .replace('{period}', new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }))
        .replace('{date}', new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
        .replace('{recipient}', 'there')
      );
    }
  };

  const handleModalOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      initializeEmailTemplate();
    }
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    
    // Simulate API call to generate secure share link
    setTimeout(() => {
      const linkId = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared-report/${linkId}`;
      setGeneratedLink(shareUrl);
      setIsGeneratingLink(false);
      toast.success('Share link generated successfully');
    }, 1500);
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleEmailShare = () => {
    // Validate form
    if (selectedRecipients.length === 0 && !customEmails.trim()) {
      toast.error('Please select recipients or enter email addresses');
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please enter subject and message');
      return;
    }

    // Simulate sending email
    toast.success(`Report shared via email with ${selectedRecipients.length + (customEmails ? customEmails.split(',').length : 0)} recipients`);
    setOpen(false);
    
    // Reset form
    setSelectedRecipients([]);
    setCustomEmails('');
    setEmailSubject('');
    setEmailBody('');
  };

  const handleScheduleShare = () => {
    if (!shareFrequency) {
      toast.error('Please select sharing frequency');
      return;
    }

    toast.success(`Scheduled sharing set up for ${shareFrequency} delivery`);
    setOpen(false);
  };

  const formatReportType = (type: string) => {
    switch (type) {
      case 'weekly-operations': return 'Weekly Operations Report';
      case 'weekly-sales': return 'Weekly Sales Analysis';
      case 'monthly': return 'End of Month Report';
      case 'annual': return 'Annual Report';
      default: return 'Report';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Report</span>
          </DialogTitle>
          <DialogDescription>
            Share {formatReportType(reportType)} with team members and stakeholders
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Share Link</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
          </TabsList>

          {/* Email Sharing Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Recipients</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Predefined Recipients */}
                <div>
                  <Label className="text-sm font-medium">Select Recipients</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {predefinedRecipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={recipient.id}
                          checked={selectedRecipients.includes(recipient.id)}
                          onCheckedChange={() => handleRecipientToggle(recipient.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={recipient.id} className="font-medium">
                              {recipient.name}
                            </Label>
                            <Badge variant="secondary" className="text-xs">
                              {recipient.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Custom Email Addresses */}
                <div>
                  <Label htmlFor="customEmails" className="text-sm font-medium">
                    Additional Email Addresses
                  </Label>
                  <Input
                    id="customEmails"
                    placeholder="Enter email addresses separated by commas"
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple email addresses with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Email Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailSubject" className="text-sm font-medium">Subject</Label>
                  <Input
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="emailBody" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="emailBody"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attachReport"
                    defaultChecked
                  />
                  <Label htmlFor="attachReport" className="text-sm">
                    Attach PDF report
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmailShare} className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </Button>
            </div>
          </TabsContent>

          {/* Link Sharing Tab */}
          <TabsContent value="link" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Share Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Access Level</Label>
                  <Select value={sharePermission} onValueChange={setSharePermission}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sharePermissions.map((permission) => (
                        <SelectItem key={permission.id} value={permission.id}>
                          <div>
                            <div className="font-medium">{permission.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expirationDate" className="text-sm font-medium">
                    Link Expiration (Optional)
                  </Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requirePassword"
                    checked={requirePassword}
                    onCheckedChange={(checked) => setRequirePassword(checked as boolean)}
                  />
                  <Label htmlFor="requirePassword" className="text-sm flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>Require password to access</span>
                  </Label>
                </div>

                {requirePassword && (
                  <div>
                    <Label htmlFor="sharePassword" className="text-sm font-medium">
                      Access Password
                    </Label>
                    <Input
                      id="sharePassword"
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Enter password"
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedLink ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Share Link Generated</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={copyLinkToClipboard}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Link Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Access Level: {sharePermissions.find(p => p.id === sharePermission)?.label}</p>
                      {expirationDate && <p>• Expires: {new Date(expirationDate).toLocaleDateString()}</p>}
                      {requirePassword && <p>• Password protected</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={generateShareLink} 
                  disabled={isGeneratingLink}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingLink ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4" />
                      <span>Generate Link</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Schedule Sharing Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Automated Sharing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableSchedule"
                    checked={scheduleSharing}
                    onCheckedChange={(checked) => setScheduleSharing(checked as boolean)}
                  />
                  <Label htmlFor="enableSchedule" className="text-sm font-medium">
                    Enable automatic report sharing
                  </Label>
                </div>

                {scheduleSharing && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Frequency</Label>
                      <Select value={shareFrequency} onValueChange={setShareFrequency}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Recipients</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {predefinedRecipients.map((recipient) => (
                          <div key={recipient.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`schedule-${recipient.id}`}
                              checked={selectedRecipients.includes(recipient.id)}
                              onCheckedChange={() => handleRecipientToggle(recipient.id)}
                            />
                            <Label htmlFor={`schedule-${recipient.id}`} className="text-sm">
                              {recipient.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">Scheduled Sharing Summary</h4>
                      <p className="text-sm text-blue-700">
                        {formatReportType(reportType)} will be automatically shared {shareFrequency} with {selectedRecipients.length} recipients.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleShare}
                disabled={!scheduleSharing || !shareFrequency || selectedRecipients.length === 0}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Setup Schedule</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}