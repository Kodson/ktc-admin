// Simple print utility that works without popups
export class SimplePrintService {
  
  // Add print-friendly CSS to the current page
  private addPrintStyles(): HTMLStyleElement {
    const existingStyle = document.getElementById('simple-print-styles');
    if (existingStyle) {
      return existingStyle as HTMLStyleElement;
    }

    const style = document.createElement('style');
    style.id = 'simple-print-styles';
    style.innerHTML = `
      @media print {
        /* Hide non-essential elements */
        .no-print,
        button:not(.print-include),
        .sidebar,
        .header-actions,
        nav,
        .mobile-overlay,
        .toast,
        [data-sonner-toaster],
        .notification-center,
        .system-alerts {
          display: none !important;
        }
        
        /* Ensure main content is visible */
        body {
          font-size: 12px !important;
          background: white !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .main-content,
        main,
        [role="main"] {
          display: block !important;
          visibility: visible !important;
          padding: 20px !important;
          margin: 0 !important;
        }
        
        /* Typography for print */
        h1 {
          font-size: 18px !important;
          color: #030213 !important;
          margin-bottom: 10px !important;
          page-break-after: avoid !important;
        }
        
        h2 {
          font-size: 16px !important;
          color: #030213 !important;
          margin: 15px 0 8px 0 !important;
          page-break-after: avoid !important;
        }
        
        h3 {
          font-size: 14px !important;
          color: #030213 !important;
          margin: 12px 0 6px 0 !important;
          page-break-after: avoid !important;
        }
        
        p {
          font-size: 11px !important;
          line-height: 1.4 !important;
          margin-bottom: 6px !important;
        }
        
        /* Cards and containers */
        .card {
          border: 1px solid #ddd !important;
          margin-bottom: 10px !important;
          padding: 8px !important;
          break-inside: avoid !important;
          background: white !important;
          box-shadow: none !important;
        }
        
        /* Tables */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin-bottom: 15px !important;
          font-size: 10px !important;
        }
        
        th {
          background: #f0f0f0 !important;
          border: 1px solid #ddd !important;
          padding: 4px 6px !important;
          font-weight: bold !important;
          font-size: 9px !important;
        }
        
        td {
          border: 1px solid #ddd !important;
          padding: 4px 6px !important;
          font-size: 9px !important;
        }
        
        /* Grid layouts become stacked for print */
        .grid {
          display: block !important;
        }
        
        .grid > * {
          margin-bottom: 8px !important;
        }
        
        /* Badge styling for print */
        .badge {
          border: 1px solid #666 !important;
          padding: 2px 4px !important;
          font-size: 8px !important;
          background: transparent !important;
          color: black !important;
        }
        
        /* Charts and graphs - show placeholder text */
        .recharts-wrapper {
          display: none !important;
        }
        
        .recharts-wrapper::after {
          content: "[Chart not available in print]" !important;
          display: block !important;
          font-style: italic !important;
          color: #666 !important;
          font-size: 10px !important;
          text-align: center !important;
          padding: 20px !important;
          border: 1px dashed #ccc !important;
        }
        
        /* Utility classes */
        .break-before {
          page-break-before: always !important;
        }
        
        .break-after {
          page-break-after: always !important;
        }
        
        .no-break {
          page-break-inside: avoid !important;
        }
        
        /* Currency formatting */
        .currency {
          font-family: monospace !important;
        }
        
        /* KTC Energy branding header for print */
        .print-header {
          text-align: center !important;
          border-bottom: 2px solid #030213 !important;
          padding-bottom: 10px !important;
          margin-bottom: 20px !important;
        }
        
        .print-header h1 {
          color: #030213 !important;
          font-size: 20px !important;
          margin-bottom: 5px !important;
        }
        
        .print-header p {
          color: #666 !important;
          font-size: 10px !important;
          margin: 0 !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    return style;
  }

  // Remove print styles
  private removePrintStyles(): void {
    const style = document.getElementById('simple-print-styles');
    if (style) {
      document.head.removeChild(style);
    }
  }

  // Add a print header to the page
  private addPrintHeader(): HTMLElement | null {
    const existingHeader = document.getElementById('ktc-print-header');
    if (existingHeader) {
      return existingHeader;
    }

    const mainContent = document.querySelector('.main-content, main, [role="main"]');
    if (!mainContent) {
      return null;
    }

    const header = document.createElement('div');
    header.id = 'ktc-print-header';
    header.className = 'print-header';
    header.style.display = 'none'; // Only show in print
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    header.innerHTML = `
      <h1>KTC ENERGY</h1>
      <p>Fuel Station Management System</p>
      <p>Report Generated: ${formattedDate}</p>
      <p>Accra Central Station</p>
    `;

    mainContent.insertBefore(header, mainContent.firstChild);
    return header;
  }

  // Remove print header
  private removePrintHeader(): void {
    const header = document.getElementById('ktc-print-header');
    if (header) {
      header.remove();
    }
  }

  // Main print function
  public printCurrentReport(): void {
    try {
      // Store original title
      const originalTitle = document.title;
      
      // Update page title for print
      document.title = `KTC Energy Report - ${new Date().toLocaleDateString('en-GB')}`;
      
      // Add print styles and header
      const styleElement = this.addPrintStyles();
      const headerElement = this.addPrintHeader();
      
      // Trigger print
      window.print();
      
      // Cleanup function
      const cleanup = () => {
        document.title = originalTitle;
        this.removePrintStyles();
        this.removePrintHeader();
      };
      
      // Clean up after a delay (print dialog handling)
      setTimeout(cleanup, 1000);
      
      console.log('Simple print initiated successfully');
      
    } catch (error) {
      console.error('Error with simple print:', error);
      // Fallback - just print without modifications
      window.print();
    }
  }

  // Quick print without modifications
  public quickPrint(): void {
    try {
      window.print();
    } catch (error) {
      console.error('Quick print failed:', error);
      alert('Print function is not available in this browser.');
    }
  }
}

// Export a singleton instance
export const simplePrintService = new SimplePrintService();

// Export convenience function
export const printCurrentReport = () => {
  simplePrintService.printCurrentReport();
};

export const quickPrint = () => {
  simplePrintService.quickPrint();
};