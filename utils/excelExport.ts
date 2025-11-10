import * as XLSX from 'xlsx';

interface ExcelExportData {
  title: string;
  subtitle: string;
  period: string;
  station: string;
  generatedDate: string;
  kpiData?: {
    totalSales?: number;
    totalProfit?: number;
    totalExpenses?: number;
    totalVehicles?: number;
    avgTransactionValue?: number;
    profitMargin?: number;
    growthRate?: number;
    operationalEfficiency?: number;
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

export class ExcelExportService {
  private formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₵0.00';
    }
    return `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  }

  private createHeaderSheet(exportData: ExcelExportData): any[][] {
    return [
      ['KTC ENERGY'],
      ['Fuel Station Management System'],
      [''],
      [exportData.title],
      [exportData.subtitle],
      [`Period: ${exportData.period}`],
      [`Station: ${exportData.station}`],
      [`Generated: ${exportData.generatedDate}`],
      [''],
      ['This report contains confidential business information'],
      ['']
    ];
  }

  private createKPISheet(kpiData: ExcelExportData['kpiData']): any[][] {
    if (!kpiData) return [];

    return [
      ['Key Performance Indicators'],
      [''],
      ['Metric', 'Value', 'Additional Info'],
      ['Total Sales', this.formatCurrency(kpiData.totalSales), `+${this.formatPercentage(kpiData.growthRate)} growth`],
      ['Net Profit', this.formatCurrency(kpiData.totalProfit), `${this.formatPercentage(kpiData.profitMargin)} profit margin`],
      ['Total Vehicles', (kpiData.totalVehicles || 0).toLocaleString(), `Avg: ${this.formatCurrency(kpiData.avgTransactionValue)} per transaction`],
      ['Total Expenses', this.formatCurrency(kpiData.totalExpenses), ''],
      ['Operational Efficiency', this.formatPercentage(kpiData.operationalEfficiency), 'Performance score'],
      [''],
      ['Growth Rate', this.formatPercentage(kpiData.growthRate), 'Period over period'],
      ['Profit Margin', this.formatPercentage(kpiData.profitMargin), 'Percentage of total sales']
    ];
  }

  private createDataSheet(tableData: ExcelExportData['tableData'][0]): any[][] {
    if (!tableData) return [];

    const sheet = [];
    
    if (tableData.title) {
      sheet.push([tableData.title]);
      sheet.push(['']);
    }

    // Add headers
    sheet.push(tableData.headers);

    // Add data rows
    tableData.rows.forEach(row => {
      const formattedRow = row.map(cell => {
        if (typeof cell === 'number' && cell > 1000 && !cell.toString().includes('₵')) {
          // Check if it looks like currency
          if (cell.toString().includes('.')) {
            return this.formatCurrency(cell);
          }
        }
        return cell;
      });
      sheet.push(formattedRow);
    });

    return sheet;
  }

  private createSummarySheet(summaryData: ExcelExportData['summaryData']): any[][] {
    if (!summaryData) return [];

    const sheet = [
      ['Summary Report'],
      [''],
      ['Description', 'Value', 'Notes']
    ];

    summaryData.forEach(item => {
      sheet.push([
        item.label,
        typeof item.value === 'number' ? this.formatCurrency(item.value) : item.value,
        item.subValue || ''
      ]);
    });

    return sheet;
  }

  private applyWorksheetStyling(worksheet: XLSX.WorkSheet, data: any[][]): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Auto-width columns
    const colWidths: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, Math.min(cellLength + 2, 50));
        }
      }
      colWidths.push({ width: maxWidth });
    }
    worksheet['!cols'] = colWidths;

    // Set row heights for better readability
    const rowHeights: any[] = [];
    for (let R = range.s.r; R <= range.e.r; ++R) {
      rowHeights.push({ hpt: 20 }); // 20 points height
    }
    worksheet['!rows'] = rowHeights;
  }

  private createStyledWorkbook(exportData: ExcelExportData): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Create Header/Info sheet
    const headerData = this.createHeaderSheet(exportData);
    const headerWS = XLSX.utils.aoa_to_sheet(headerData);
    this.applyWorksheetStyling(headerWS, headerData);
    XLSX.utils.book_append_sheet(workbook, headerWS, 'Report Info');

    // Create KPI sheet if available
    if (exportData.kpiData) {
      const kpiData = this.createKPISheet(exportData.kpiData);
      const kpiWS = XLSX.utils.aoa_to_sheet(kpiData);
      this.applyWorksheetStyling(kpiWS, kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiWS, 'Key Metrics');
    }

    // Create data sheets
    if (exportData.tableData) {
      exportData.tableData.forEach((table, index) => {
        const sheetData = this.createDataSheet(table);
        if (sheetData.length > 0) {
          const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
          this.applyWorksheetStyling(worksheet, sheetData);
          
          const sheetName = table.title 
            ? table.title.replace(/[^\w\s]/gi, '').substring(0, 31) // Excel sheet name limit
            : `Data ${index + 1}`;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      });
    }

    // Create summary sheet if available
    if (exportData.summaryData) {
      const summaryData = this.createSummarySheet(exportData.summaryData);
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      this.applyWorksheetStyling(summaryWS, summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');
    }

    return workbook;
  }

  public generateExcel(exportData: ExcelExportData): void {
    try {
      // Create workbook with multiple sheets
      const workbook = this.createStyledWorkbook(exportData);

      // Generate filename
      const filename = `${exportData.title.replace(/\s+/g, '_')}_${exportData.period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename, {
        bookType: 'xlsx',
        type: 'binary'
      });

      console.log(`Excel file generated successfully: ${filename}`);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  public generateExcelWithCharts(exportData: ExcelExportData): void {
    try {
      const workbook = this.createStyledWorkbook(exportData);

      // Add chart data sheet if available
      if (exportData.chartData && exportData.chartData.length > 0) {
        const chartHeaders = Object.keys(exportData.chartData[0]);
        const chartRows = exportData.chartData.map(item => 
          chartHeaders.map(header => item[header])
        );
        
        const chartSheetData = [
          ['Chart Data'],
          [''],
          chartHeaders,
          ...chartRows
        ];

        const chartWS = XLSX.utils.aoa_to_sheet(chartSheetData);
        this.applyWorksheetStyling(chartWS, chartSheetData);
        XLSX.utils.book_append_sheet(workbook, chartWS, 'Chart Data');
      }

      // Generate filename
      const filename = `${exportData.title.replace(/\s+/g, '_')}_${exportData.period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename, {
        bookType: 'xlsx',
        type: 'binary'
      });

      console.log(`Excel file with charts generated successfully: ${filename}`);
    } catch (error) {
      console.error('Error generating Excel file with charts:', error);
      throw new Error('Failed to generate Excel file with charts');
    }
  }
}

// Helper function to create export data (reuse from PDF export)
export const createExcelExportData = (
  reportType: string,
  activeTab: string,
  selectedPeriod: string,
  kpiData?: any,
  additionalData?: any
): ExcelExportData => {
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

// Quick Excel export function for simple data
export const quickExcelExport = (
  title: string,
  headers: string[],
  data: (string | number)[][],
  filename?: string
): void => {
  try {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [title],
      [''],
      headers,
      ...data
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const exportFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, exportFilename);
    console.log(`Quick Excel export completed: ${exportFilename}`);
  } catch (error) {
    console.error('Error in quick Excel export:', error);
    throw new Error('Failed to export Excel file');
  }
};