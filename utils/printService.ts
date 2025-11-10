interface PrintReportData {
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
  summaryData?: Array<{
    label: string;
    value: string | number;
    subValue?: string;
  }>;
  chartData?: any[];
}

export class PrintService {
  private formatCurrency(amount: number): string {
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private createPrintStyles(): string {
    return `
      <style>
        @page {
          size: A4;
          margin: 1.5cm 1cm 1cm 1cm;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 2px solid #030213;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .company-logo {
            font-size: 24px;
            font-weight: bold;
            color: #030213;
            margin-bottom: 5px;
          }
          
          .company-tagline {
            font-size: 10px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: bold;
            color: #030213;
            margin-bottom: 5px;
          }
          
          .report-subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
          }
          
          .report-meta {
            font-size: 10px;
            color: #666;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          
          .kpi-section {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .kpi-card {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 4px;
            background: #f9f9f9;
          }
          
          .kpi-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
          }
          
          .kpi-value {
            font-size: 14px;
            font-weight: bold;
            color: #030213;
          }
          
          .kpi-subvalue {
            font-size: 9px;
            color: #888;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #030213;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            page-break-inside: auto;
          }
          
          .print-table th {
            background: #030213;
            color: white;
            padding: 8px 6px;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            border: 1px solid #030213;
          }
          
          .print-table td {
            padding: 6px;
            font-size: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          
          .print-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          .currency {
            text-align: right;
            font-family: monospace;
          }
          
          .number {
            text-align: right;
            font-family: monospace;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
            margin: 15px 0;
          }
          
          .summary-item {
            border: 1px solid #eee;
            padding: 8px;
            border-radius: 3px;
            background: #fafafa;
          }
          
          .summary-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
          }
          
          .summary-value {
            font-size: 11px;
            font-weight: bold;
            color: #030213;
          }
          
          .summary-subvalue {
            font-size: 8px;
            color: #888;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
          
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
            background: white;
          }
          
          .confidential-notice {
            margin-top: 20px;
            padding: 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 9px;
            color: #666;
            text-align: center;
          }
          
          /* Hide buttons and interactive elements */
          button, .no-print {
            display: none !important;
          }
        }
      </style>
    `;
  }

  private createHeaderHTML(reportData: PrintReportData): string {
    return `
      <div class="print-header">
        <div class="company-logo">KTC ENERGY</div>
        <div class="company-tagline">Fuel Station Management System</div>
        <div class="report-title">${reportData.title}</div>
        <div class="report-subtitle">${reportData.subtitle}</div>
        <div class="report-meta">
          <span>Station: ${reportData.station}</span>
          <span>Period: ${reportData.period}</span>
          <span>Generated: ${reportData.generatedDate}</span>
        </div>
      </div>
    `;
  }

  private createKPIHTML(kpiData: PrintReportData['kpiData']): string {
    if (!kpiData) return '';

    return `
      <div class="kpi-section no-break">
        <div class="section-title">Key Performance Indicators</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Sales</div>
            <div class="kpi-value">${this.formatCurrency(kpiData.totalSales)}</div>
            <div class="kpi-subvalue">+${this.formatPercentage(kpiData.growthRate)} growth</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Net Profit</div>
            <div class="kpi-value">${this.formatCurrency(kpiData.totalProfit)}</div>
            <div class="kpi-subvalue">${this.formatPercentage(kpiData.profitMargin)} profit margin</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Vehicles</div>
            <div class="kpi-value">${kpiData.totalVehicles.toLocaleString()}</div>
            <div class="kpi-subvalue">Avg: ${this.formatCurrency(kpiData.avgTransactionValue)} per transaction</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Expenses</div>
            <div class="kpi-value">${this.formatCurrency(kpiData.totalExpenses)}</div>
            <div class="kpi-subvalue">Operating costs</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Operational Efficiency</div>
            <div class="kpi-value">${this.formatPercentage(kpiData.operationalEfficiency)}</div>
            <div class="kpi-subvalue">Performance score</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Growth Rate</div>
            <div class="kpi-value">${this.formatPercentage(kpiData.growthRate)}</div>
            <div class="kpi-subvalue">Period over period</div>
          </div>
        </div>
      </div>
    `;
  }

  private createTableHTML(tableData: PrintReportData['tableData']): string {
    if (!tableData || tableData.length === 0) return '';

    return tableData.map(table => {
      const title = table.title ? `<div class="section-title">${table.title}</div>` : '';
      
      const headers = table.headers.map(header => `<th>${header}</th>`).join('');
      
      const rows = table.rows.map(row => {
        const cells = row.map((cell, index) => {
          const cellValue = typeof cell === 'number' && cell > 1000 && !cell.toString().includes('₵') 
            ? this.formatCurrency(cell) 
            : cell;
          
          // Add appropriate CSS classes for currency and numbers
          let cellClass = '';
          if (typeof cellValue === 'string' && cellValue.includes('₵')) {
            cellClass = 'currency';
          } else if (typeof cell === 'number') {
            cellClass = 'number';
          }
          
          return `<td class="${cellClass}">${cellValue}</td>`;
        }).join('');
        
        return `<tr>${cells}</tr>`;
      }).join('');

      return `
        <div class="no-break">
          ${title}
          <table class="print-table">
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }).join('');
  }

  private createSummaryHTML(summaryData: PrintReportData['summaryData']): string {
    if (!summaryData || summaryData.length === 0) return '';

    const summaryItems = summaryData.map(item => {
      const value = typeof item.value === 'number' ? this.formatCurrency(item.value) : item.value;
      const subValue = item.subValue ? `<div class="summary-subvalue">${item.subValue}</div>` : '';
      
      return `
        <div class="summary-item">
          <div class="summary-label">${item.label}</div>
          <div class="summary-value">${value}</div>
          ${subValue}
        </div>
      `;
    }).join('');

    return `
      <div class="no-break">
        <div class="section-title">Summary</div>
        <div class="summary-grid">
          ${summaryItems}
        </div>
      </div>
    `;
  }

  private createFooterHTML(): string {
    return `
      <div class="print-footer">
        KTC Energy - Confidential Business Information - ${new Date().toLocaleDateString('en-GB')}
      </div>
      <div class="confidential-notice no-break">
        This report contains confidential business information of KTC Energy. 
        Distribution is restricted to authorized personnel only.
      </div>
    `;
  }

  public generatePrintHTML(reportData: PrintReportData): string {
    const styles = this.createPrintStyles();
    const header = this.createHeaderHTML(reportData);
    const kpis = this.createKPIHTML(reportData.kpiData);
    const tables = this.createTableHTML(reportData.tableData);
    const summary = this.createSummaryHTML(reportData.summaryData);
    const footer = this.createFooterHTML();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title} - ${reportData.station}</title>
        ${styles}
      </head>
      <body>
        <div class="print-container">
          ${header}
          ${kpis}
          ${tables}
          ${summary}
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  public printReport(reportData: PrintReportData): void {
    try {
      // First, try the popup window approach
      const printWindow = window.open('', '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
      
      if (printWindow && printWindow !== null && !printWindow.closed) {
        // Popup window opened successfully
        const printHTML = this.generatePrintHTML(reportData);
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            
            // Close window after printing
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }, 250);
        };

        console.log('Print dialog opened successfully');
        return;
      }
      
      // Fallback: Use inline printing approach if popup is blocked
      console.warn('Popup blocked, using inline print approach');
      this.printInlineReport(reportData);
      
    } catch (error) {
      console.error('Error with popup print, trying inline approach:', error);
      // Fallback to inline printing
      this.printInlineReport(reportData);
    }
  }

  private printInlineReport(reportData: PrintReportData): void {
    try {
      // Create a temporary container in the current document
      const printContainer = document.createElement('div');
      printContainer.id = 'ktc-print-container';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '-9999px';
      printContainer.style.left = '-9999px';
      printContainer.style.width = '210mm'; // A4 width
      printContainer.style.zIndex = '-1';
      
      // Generate print content
      const printHTML = this.generatePrintHTML(reportData);
      
      // Extract body content from the generated HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = printHTML;
      const bodyContent = tempDiv.querySelector('body')?.innerHTML || printHTML;
      
      printContainer.innerHTML = bodyContent;
      
      // Add the container to the document
      document.body.appendChild(printContainer);
      
      // Create and add print styles
      const printStyles = document.createElement('style');
      printStyles.id = 'ktc-print-styles';
      printStyles.innerHTML = this.createInlinePrintStyles();
      document.head.appendChild(printStyles);
      
      // Add print class to body for styling
      document.body.classList.add('ktc-printing');
      
      // Trigger print
      setTimeout(() => {
        window.print();
        
        // Cleanup after print
        setTimeout(() => {
          // Remove the temporary elements
          const container = document.getElementById('ktc-print-container');
          const styles = document.getElementById('ktc-print-styles');
          
          if (container) document.body.removeChild(container);
          if (styles) document.head.removeChild(styles);
          document.body.classList.remove('ktc-printing');
        }, 1000);
        
      }, 500);
      
      console.log('Inline print dialog opened successfully');
      
    } catch (error) {
      console.error('Error with inline printing:', error);
      // Final fallback - just print the current page
      alert('Print preview unavailable. The current page will be printed instead.');
      window.print();
    }
  }

  private createInlinePrintStyles(): string {
    return `
      @media print {
        body.ktc-printing * {
          visibility: hidden;
        }
        
        body.ktc-printing #ktc-print-container,
        body.ktc-printing #ktc-print-container * {
          visibility: visible;
        }
        
        body.ktc-printing #ktc-print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          z-index: 9999 !important;
          background: white !important;
        }
        
        /* Print-specific styles for inline printing */
        #ktc-print-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          color: #000 !important;
          background: white !important;
          margin: 0 !important;
          padding: 20px !important;
        }
        
        #ktc-print-container .print-header {
          text-align: center !important;
          border-bottom: 2px solid #030213 !important;
          padding-bottom: 15px !important;
          margin-bottom: 20px !important;
        }
        
        #ktc-print-container .company-logo {
          font-size: 24px !important;
          font-weight: bold !important;
          color: #030213 !important;
          margin-bottom: 5px !important;
        }
        
        #ktc-print-container .report-title {
          font-size: 18px !important;
          font-weight: bold !important;
          color: #030213 !important;
          margin-bottom: 5px !important;
        }
        
        #ktc-print-container .kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 15px !important;
          margin-bottom: 20px !important;
        }
        
        #ktc-print-container .kpi-card {
          border: 1px solid #ddd !important;
          padding: 10px !important;
          background: #f9f9f9 !important;
        }
        
        #ktc-print-container .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 20px !important;
        }
        
        #ktc-print-container .print-table th {
          background: #030213 !important;
          color: white !important;
          padding: 8px 6px !important;
          font-size: 10px !important;
          border: 1px solid #030213 !important;
        }
        
        #ktc-print-container .print-table td {
          padding: 6px !important;
          font-size: 10px !important;
          border: 1px solid #ddd !important;
        }
        
        #ktc-print-container .currency {
          text-align: right !important;
          font-family: monospace !important;
        }
        
        #ktc-print-container .section-title {
          font-size: 14px !important;
          font-weight: bold !important;
          color: #030213 !important;
          margin: 20px 0 10px 0 !important;
          border-bottom: 1px solid #ccc !important;
          padding-bottom: 5px !important;
        }
      }
    `;
  }

  public printCurrentPage(): void {
    try {
      // For printing the current page with basic styling
      const originalTitle = document.title;
      document.title = `KTC Energy Report - ${new Date().toLocaleDateString('en-GB')}`;
      
      // Add print-specific styling temporarily
      const printStyle = document.createElement('style');
      printStyle.id = 'ktc-current-page-print-styles';
      printStyle.innerHTML = `
        @media print {
          .no-print, 
          button:not(.print-include), 
          .sidebar, 
          .header-actions,
          nav,
          .mobile-overlay,
          .toast,
          [data-sonner-toaster],
          .notification-center {
            display: none !important;
          }
          
          body {
            font-size: 12px !important;
            background: white !important;
            color: black !important;
          }
          
          .container, .p-6 {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          h1, h2, h3 {
            color: #030213 !important;
            page-break-after: avoid !important;
          }
          
          .card {
            border: 1px solid #ddd !important;
            margin-bottom: 10px !important;
            break-inside: avoid !important;
            background: white !important;
          }
          
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid #ddd !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
          
          th {
            background: #f0f0f0 !important;
            font-weight: bold !important;
          }
          
          .grid {
            display: block !important;
          }
          
          .grid > * {
            margin-bottom: 10px !important;
          }
          
          /* Force visibility of main content */
          main, .main-content, [role="main"] {
            display: block !important;
            visibility: visible !important;
          }
        }
      `;
      
      document.head.appendChild(printStyle);
      
      // Trigger print with a slight delay to ensure styles are applied
      setTimeout(() => {
        window.print();
        
        // Clean up after print dialog closes
        setTimeout(() => {
          document.title = originalTitle;
          const styleElement = document.getElementById('ktc-current-page-print-styles');
          if (styleElement) {
            document.head.removeChild(styleElement);
          }
        }, 1000);
      }, 100);
      
    } catch (error) {
      console.error('Error printing current page:', error);
      // Fallback - just try to print without custom styles
      window.print();
    }
  }

  // Simple print function that just triggers browser print
  public quickPrint(): void {
    try {
      window.print();
    } catch (error) {
      console.error('Error with quick print:', error);
      alert('Print function is not available in this browser.');
    }
  }
}

// Helper function to create print data from report components (reuse from existing export data)
export const createPrintData = (
  reportType: string,
  activeTab: string,
  selectedPeriod: string,
  kpiData?: any,
  additionalData?: any
): PrintReportData => {
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
    summaryData: additionalData?.summaryData,
    chartData: additionalData?.chartData
  };
};

// Quick print function for simple content
export const quickPrint = (title: string, content: string): void => {
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          h1 { color: #030213; border-bottom: 2px solid #030213; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  } catch (error) {
    console.error('Error in quick print:', error);
    throw new Error('Failed to print content');
  }
};