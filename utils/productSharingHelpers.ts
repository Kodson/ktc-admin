import type { HistoryEntry } from '../types/productSharing';

// Helper function to ensure data is a valid array
export const ensureArray = <T,>(data: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  console.warn('Expected array but received:', typeof data, data);
  return fallback;
};

export const formatLiters = (liters: number) => {
  return (liters / 1000).toFixed(liters >= 1000 ? 1 : 0) + 'K L';
};

export const formatCurrency = (amount: number) => {
  return '₵' + amount.toLocaleString('en-GH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Good':
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'Critical':
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'Low':
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateTotals = (stationQuantities: Record<string, string>, rate: string, salesRate: string) => {
  const costRate = parseFloat(rate) || 0;
  const saleRate = parseFloat(salesRate) || 0;
  
  let totalQty = 0;
  let amountCost = 0;
  let amountSales = 0;
  
  Object.values(stationQuantities).forEach(qtyStr => {
    const qty = parseFloat(qtyStr) || 0;
    totalQty += qty;
    amountCost += qty * costRate;
    amountSales += qty * saleRate;
  });
  
  const expectedProfit = amountSales - amountCost;
  
  return {
    totalQty: totalQty.toString(),
    amountCost: amountCost.toFixed(2),
    amountSales: amountSales.toFixed(2),
    expectedProfit: expectedProfit.toFixed(2)
  };
};

export const getSortedHistoryData = (historyData: HistoryEntry[], sortOrder: 'newest' | 'oldest'): HistoryEntry[] => {
  return [...historyData].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (sortOrder === 'newest') {
      return dateB - dateA; // Newest first
    } else {
      return dateA - dateB; // Oldest first
    }
  });
};

export const getSelectedStations = (stationQuantities: Record<string, string>) => {
  return Object.entries(stationQuantities)
    .filter(([_, qty]) => parseFloat(qty) > 0)
    .map(([station, _]) => station);
};

export const isConnectionError = (error: any): boolean => {
  return (
    error instanceof TypeError && 
    (error.message.includes('Failed to fetch') || 
     error.message.includes('Network request failed') ||
     error.message.includes('fetch is not defined'))
  ) || 
  (error.name === 'NetworkError') ||
  (error.code === 'NETWORK_ERROR');
};

export const exportBatchTemplate = () => {
  const csvContent = [
    'Product,Station,Quantity,Cost Rate,Sales Rate',
    'Super,Accra Central Station,3000,7.20,8.50',
    'Super,Kumasi North Station,2000,7.20,8.50',
    'Diesel,Accra Central Station,2500,6.80,7.95',
    'Diesel,Tamale Station,1500,6.80,7.95'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'product_sharing_template.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  
  return 'Template downloaded successfully!';
};