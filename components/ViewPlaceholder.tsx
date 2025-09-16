import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Package, 
  PlusCircle, 
  FileText, 
  Receipt, 
  Zap, 
  Scale, 
  Droplets, 
  BarChart3,
  Share2,
  CheckCircle,
  CheckCircle2,
  Settings
} from 'lucide-react';

interface ViewPlaceholderProps {
  view: string;
}

const viewConfig = {
  // Super Admin specific
  'daily-sales-approval': {
    title: 'Daily Sales Approval',
    description: 'Review and approve daily sales reports from all stations',
    icon: <CheckCircle2 className="h-12 w-12 text-muted-foreground" />,
    features: ['Review pending sales reports', 'Approve or reject submissions', 'Add approval comments', 'Track approval history']
  },
  'product-sharing-approval': {
    title: 'Product Sharing Approval',
    description: 'Approve product sharing requests between stations',
    icon: <CheckCircle className="h-12 w-12 text-muted-foreground" />,
    features: ['Review sharing requests', 'Approve transfers', 'Monitor stock levels', 'Generate transfer reports']
  },

  // Admin specific
  'product-sharing': {
    title: 'Product Sharing',
    description: 'Manage product sharing between stations',
    icon: <Share2 className="h-12 w-12 text-muted-foreground" />,
    features: ['Initiate product transfers', 'Monitor stock distribution', 'Track transfer history', 'Optimize inventory allocation']
  },
  'daily-sales-validation': {
    title: 'Daily Sales Validation',
    description: 'Validate daily sales entries before approval',
    icon: <CheckCircle className="h-12 w-12 text-muted-foreground" />,
    features: ['Review sales entries', 'Validate calculations', 'Check discrepancies', 'Forward for approval']
  },

  // Station Manager (and higher roles)
  'supply': {
    title: 'Supply Management',
    description: 'Manage fuel supply and inventory levels',
    icon: <Package className="h-12 w-12 text-muted-foreground" />,
    features: ['Track fuel deliveries', 'Monitor inventory levels', 'Order new supplies', 'Generate supply reports']
  },
  'daily-sales-entry': {
    title: 'Daily Sales Entry',
    description: 'Record daily sales transactions and data',
    icon: <PlusCircle className="h-12 w-12 text-muted-foreground" />,
    features: ['Enter daily sales figures', 'Record fuel dispensed', 'Update payment methods', 'Submit for validation']
  },
  'sales-entries': {
    title: 'Sales Entries',
    description: 'View and manage all sales entries',
    icon: <FileText className="h-12 w-12 text-muted-foreground" />,
    features: ['View all sales records', 'Edit pending entries', 'Search by date/type', 'Export sales data']
  },
  'expenses': {
    title: 'Expenses',
    description: 'Track and manage station expenses',
    icon: <Receipt className="h-12 w-12 text-muted-foreground" />,
    features: ['Record daily expenses', 'Categorize costs', 'Upload receipts', 'Generate expense reports']
  },
  'utility': {
    title: 'Utility Management',
    description: 'Manage utility bills and services',
    icon: <Zap className="h-12 w-12 text-muted-foreground" />,
    features: ['Track electricity bills', 'Monitor water usage', 'Record service costs', 'Plan utility budgets']
  },
  'statutory': {
    title: 'Statutory Compliance',
    description: 'Manage regulatory and compliance requirements',
    icon: <Scale className="h-12 w-12 text-muted-foreground" />,
    features: ['Track compliance deadlines', 'Submit regulatory reports', 'Maintain licenses', 'Monitor safety standards']
  },
  'washing-bay': {
    title: 'Washing Bay',
    description: 'Manage car wash services and revenue',
    icon: <Droplets className="h-12 w-12 text-muted-foreground" />,
    features: ['Track wash services', 'Monitor equipment status', 'Record revenue', 'Schedule maintenance']
  },
  'reporting': {
    title: 'Reporting',
    description: 'Generate comprehensive station reports',
    icon: <BarChart3 className="h-12 w-12 text-muted-foreground" />,
    features: ['Generate daily reports', 'Create monthly summaries', 'Custom report builder', 'Export to various formats']
  },
  'settings': {
    title: 'Settings',
    description: 'System configuration and preferences',
    icon: <Settings className="h-12 w-12 text-muted-foreground" />,
    features: ['User preferences', 'Station configuration', 'Notification settings', 'Security settings']
  }
};

export function ViewPlaceholder({ view }: ViewPlaceholderProps) {
  const config = viewConfig[view as keyof typeof viewConfig];
  
  if (!config) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p>View not found: {view}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription className="text-lg">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Key Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              This section is under development. Full functionality will be available in the next update.
            </p>
            <Button className="w-full md:w-auto">
              Request Early Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}