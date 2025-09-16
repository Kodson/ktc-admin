import { apiClient } from '../utils/apiClient';
import { SALES_ENTRIES_API } from '../constants/salesEntriesConstants';

// Types matching your Spring Boot backend
export interface DailySales {
  id: string;
  date: string;
  product: string;
  openSL: number;
  supply: number;
  overageShortageL: number;
  availableL: number;
  closingSL: number;
  differenceL: number;
  checkL: number;
  openSR: number;
  closingSR: number;
  returnTT: number;
  salesL: number;
  rate: number;
  value: number;
  cashSales: number;
  creditSales: number;
  advances: number;
  shortageMomo: number;
  cashAvailable: number;
  repaymentShortageMomo: number;
  repaymentAdvances: number;
  receivedFromDebtors: number;
  cashToBank: number;
  bankLodgement: number;
  stationId: string;
  stationName: string;
  enteredBy: string;
  enteredAt: string;
  submittedAt?: string;
  validatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  notes?: string;
  validatedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  editRequested?: boolean;
  editRequestedBy?: string;
  editRequestedAt?: string;
  editRequestReason?: string;
}

// Spring Boot Page response interface
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// API request parameters
export interface DailySalesParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  stationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  product?: string;
}

export class DailySalesService {
  /**
   * Get all daily sales with pagination
   * Matches your Spring Boot endpoint: @GetMapping with @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
   */
  static async getAllDailySales(params: DailySalesParams = {}): Promise<PageResponse<DailySales>> {
    const {
      page = 0,
      size = 10,
      sort,
      direction = 'desc',
      stationId,
      status,
      startDate,
      endDate,
      product
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add optional parameters
    if (sort) {
      queryParams.append('sort', `${sort},${direction}`);
    }
    if (stationId) {
      queryParams.append('stationId', stationId);
    }
    if (status) {
      queryParams.append('status', status);
    }
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    if (product) {
      queryParams.append('product', product);
    }

    try {
      const response = await apiClient.get<PageResponse<DailySales>>(
        `${SALES_ENTRIES_API.ENDPOINTS.ENTRIES}?${queryParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
      throw error;
    }
  }

  /**
   * Get daily sales by ID
   */
  static async getDailySalesById(id: string): Promise<DailySales> {
    try {
      const response = await apiClient.get<DailySales>(
        SALES_ENTRIES_API.ENDPOINTS.ENTRY_BY_ID.replace(':id', id)
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch daily sales with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new daily sales entry
   */
  static async createDailySales(data: Partial<DailySales>): Promise<DailySales> {
    try {
      const response = await apiClient.post<DailySales>(
        SALES_ENTRIES_API.ENDPOINTS.ENTRIES,
        data
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create daily sales:', error);
      throw error;
    }
  }

  /**
   * Update daily sales entry
   */
  static async updateDailySales(id: string, data: Partial<DailySales>): Promise<DailySales> {
    try {
      const response = await apiClient.put<DailySales>(
        SALES_ENTRIES_API.ENDPOINTS.ENTRY_BY_ID.replace(':id', id),
        data
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update daily sales with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete daily sales entry
   */
  static async deleteDailySales(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(
        SALES_ENTRIES_API.ENDPOINTS.ENTRY_BY_ID.replace(':id', id)
      );
    } catch (error) {
      console.error(`Failed to delete daily sales with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get daily sales statistics by station
   */
  static async getDailySalesStatistics(stationId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        SALES_ENTRIES_API.ENDPOINTS.STATISTICS.replace(':stationId', stationId)
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch statistics for station ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Request edit for daily sales entry
   */
  static async requestEdit(id: string, reason: string): Promise<DailySales> {
    try {
      const response = await apiClient.post<DailySales>(
        SALES_ENTRIES_API.ENDPOINTS.REQUEST_EDIT.replace(':id', id),
        { reason }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to request edit for daily sales with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve edit for daily sales entry
   */
  static async approveEdit(id: string): Promise<DailySales> {
    try {
      const response = await apiClient.post<DailySales>(
        SALES_ENTRIES_API.ENDPOINTS.APPROVE_EDIT.replace(':id', id),
        {}
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to approve edit for daily sales with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk approve daily sales entries
   */
  static async bulkApprove(ids: string[]): Promise<DailySales[]> {
    try {
      const response = await apiClient.post<DailySales[]>(
        SALES_ENTRIES_API.ENDPOINTS.BULK_APPROVE,
        { ids }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to bulk approve daily sales:', error);
      throw error;
    }
  }

  /**
   * Bulk reject daily sales entries
   */
  static async bulkReject(ids: string[], reason: string): Promise<DailySales[]> {
    try {
      const response = await apiClient.post<DailySales[]>(
        SALES_ENTRIES_API.ENDPOINTS.BULK_REJECT,
        { ids, reason }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to bulk reject daily sales:', error);
      throw error;
    }
  }

  /**
   * Export daily sales data
   */
  static async exportDailySales(params: DailySalesParams = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      )
    });

    try {
      // Note: This would need to be handled differently for file downloads
      const response = await fetch(
        `${SALES_ENTRIES_API.BASE_URL}${SALES_ENTRIES_API.ENDPOINTS.EXPORT}?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ktc_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export daily sales:', error);
      throw error;
    }
  }
}

export default DailySalesService;
