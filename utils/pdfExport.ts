// Simple PDF Export using browser's print functionality
// This provides a lightweight alternative to jsPDF for basic PDF export

interface ExportData {
  title: string;
  subtitle: string;
  period: string;
  station: string;
  generatedDate: string;
  kpiData?: {
    totalSales: number;
    totalProfit: number;
    totalExpenses: number;
    totalVehicles: number;
    avgTransactionValue: number;
    profitMargin: number;
    growthRate: number;
    operationalEfficiency: number;
  };
  tableData?: Array<{
    headers: string[];
    rows: (string | number)[][];
    title?: string;
  }>;
  chartData?: any[];
  summaryData?: Array<{
    label: string;
    value: string | number;
    subValue?: string;
  }>;
}

export class PDFExportService {
  private formatCurrency(amount: number): string {
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private generateHTML(exportData: ExportData): string {
    const kpiHTML = exportData.kpiData ? `
      <div class="kpi-section">
        <h2>Key Performance Indicators</h2>
        <table class="kpi-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Additional Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Sales</td>
              <td>${this.formatCurrency(exportData.kpiData.totalSales)}</td>
              <td>+${this.formatPercentage(exportData.kpiData.growthRate)} growth</td>
            </tr>
            <tr>
              <td>Net Profit</td>
              <td>${this.formatCurrency(exportData.kpiData.totalProfit)}</td>
              <td>${this.formatPercentage(exportData.kpiData.profitMargin)} profit margin</td>
            </tr>
            <tr>
              <td>Total Vehicles</td>
              <td>${exportData.kpiData.totalVehicles.toLocaleString()}</td>
              <td>Avg: ${this.formatCurrency(exportData.kpiData.avgTransactionValue)} per transaction</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td>${this.formatCurrency(exportData.kpiData.totalExpenses)}</td>
              <td></td>
            </tr>
            <tr>
              <td>Operational Efficiency</td>
              <td>${this.formatPercentage(exportData.kpiData.operationalEfficiency)}</td>
              <td>Performance score</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';

    const tablesHTML = exportData.tableData ? exportData.tableData.map(table => `
      <div class="table-section">
        ${table.title ? `<h3>${table.title}</h3>` : ''}
        <table class="data-table">
          <thead>
            <tr>
              ${table.headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${typeof cell === 'number' && cell > 1000 && !cell.toString().includes('₵') ? this.formatCurrency(cell) : cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('') : '';

    const summaryHTML = exportData.summaryData ? `
      <div class="summary-section">
        <h2>Summary</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Value</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.summaryData.map(item => `
              <tr>
                <td>${item.label}</td>
                <td>${typeof item.value === 'number' ? this.formatCurrency(item.value) : item.value}</td>
                <td>${item.subValue || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${exportData.title}</title>
          <style>
            @page {
              margin: 1in;
              size: A4;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 14px;
              line-height: 1.5;
              color: #333;
              margin: 0;
              padding: 0;
            }
            
            .header {
              border-bottom: 2px solid #030213;
              padding-bottom: 20px;
              margin-bottom: 30px;
              position: relative;
            }
            
            .header h1 {
              color: #030213;
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            
            .header .subtitle {
              color: #666;
              font-size: 12px;
              margin: 0 0 15px 0;
            }
            
            .header .report-info {
              position: absolute;
              top: 0;
              right: 0;
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            
            .report-title {
              font-size: 18px;
              font-weight: bold;
              color: #030213;
              margin: 0 0 5px 0;
            }
            
            .report-subtitle {
              font-size: 14px;
              color: #666;
              margin: 0 0 5px 0;
            }
            
            .report-period {
              font-size: 12px;
              color: #666;
              margin: 0 0 20px 0;
            }
            
            h2 {
              color: #030213;
              font-size: 16px;
              font-weight: bold;
              margin: 30px 0 15px 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            
            h3 {
              color: #030213;
              font-size: 14px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 12px;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #030213;
              color: white;
              font-weight: bold;
            }
            
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .kpi-table td:nth-child(2),
            .data-table td:last-child,
            .data-table td:nth-last-child(2),
            .data-table td:nth-last-child(3) {
              text-align: right;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 50px;
              border-top: 1px solid #ccc;
              padding: 10px;
              font-size: 10px;
              color: #666;
              background: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KTC ENERGY</h1>
            <div class="subtitle">Fuel Station Management System</div>
            <div class="report-info">
              <div>${exportData.station}</div>
              <div>Generated: ${exportData.generatedDate}</div>
            </div>
            <div class="report-title">${exportData.title}</div>
            <div class="report-subtitle">${exportData.subtitle}</div>
            <div class="report-period">Period: ${exportData.period}</div>
          </div>
          
          ${kpiHTML}
          
          ${tablesHTML}
          
          ${summaryHTML}
          
          <div class="footer">
            <span>KTC Energy Management System - Confidential Report</span>
            <span>Page 1</span>
          </div>
        </body>
      </html>
    `;
  }

  public generatePDF(exportData: ExportData): void {
    // Generate HTML content
    const htmlContent = this.generateHTML(exportData);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to export PDF');
      return;
    }
    
    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (optional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  }
}

// Helper function to create export data from report components
export const createExportData = (
  reportType: string,
  activeTab: string,
  selectedPeriod: string,
  kpiData?: any,
  additionalData?: any
): ExportData => {
  const now = new Date();
  const station = "Accra Central Station"; // This could be dynamic
  
  let title = '';
  let subtitle = '';
  let period = '';
  
  switch (activeTab) {
    case 'weekly-operations':
      title = 'Weekly Operations Report';
      subtitle = 'Comprehensive weekly performance analysis';
      period = 'Dec 2-8, 2024';
      break;
    case 'weekly-sales':
      title = 'Weekly Sales Analysis Report';
      subtitle = 'Detailed weekly sales breakdown and analysis';
      period = 'Dec 2-8, 2024';
      break;
    case 'monthly':
      title = 'End of Month Report';
      subtitle = 'Monthly performance and financial analysis';
      period = additionalData?.selectedMonth || 'JAN 2024';
      break;
    case 'annual':
      title = 'Annual Report';
      subtitle = 'Comprehensive annual performance review';
      period = additionalData?.selectedYear || '2024';
      break;
    default:
      title = 'KTC Energy Report';
      subtitle = 'Performance Analysis';
      period = selectedPeriod;
  }

  return {
    title,
    subtitle,
    period,
    station,
    generatedDate: now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    kpiData,
    tableData: additionalData?.tableData,
    summaryData: additionalData?.summaryData
  };
};