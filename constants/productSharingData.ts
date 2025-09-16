export const inventoryMetrics = {
  totalCapacity: 160000, // 160K L
  currentStock: 76600,   // 76.6K L
  averageFill: 48,       // 48%
  criticalTanks: 2       // 2 tanks
};

export const availableStations = [
  'Accra Central Station',
  'Kumasi North Station',
  'Cape Coast Station',
  'Tamale Station',
  'Takoradi Station',
  'Ho Station'
];

export const availableProducts = [
  { id: 'super', name: 'Super Petrol', unit: 'L' },
  { id: 'regular', name: 'Regular Petrol', unit: 'L' },
  { id: 'diesel', name: 'Diesel', unit: 'L' },
  { id: 'gas', name: 'Gas (LPG)', unit: 'kg' }
];

export const initialTankData = [
  {
    id: 1,
    name: 'Tank A',
    station: 'Accra Central Station',
    fuelType: 'Super',
    capacity: 20000,
    currentStock: 15600,
    fillPercentage: 78,
    pricePerLiter: 8.50,
    lastRefill: '2024-12-10',
    status: 'Good'
  },
  {
    id: 2,
    name: 'Tank B',
    station: 'Accra Central Station',
    fuelType: 'Diesel',
    capacity: 20000,
    currentStock: 3000,
    fillPercentage: 15,
    pricePerLiter: 7.80,
    lastRefill: '2024-12-05',
    status: 'Critical'
  },
  {
    id: 3,
    name: 'Tank A',
    station: 'Kumasi North Station',
    fuelType: 'Super',
    capacity: 20000,
    currentStock: 13000,
    fillPercentage: 65,
    pricePerLiter: 8.65,
    lastRefill: '2024-12-11',
    status: 'Good'
  },
  {
    id: 4,
    name: 'Tank B',
    station: 'Kumasi North Station',
    fuelType: 'Diesel',
    capacity: 20000,
    currentStock: 5600,
    fillPercentage: 28,
    pricePerLiter: 7.95,
    lastRefill: '2024-12-07',
    status: 'Low'
  },
  {
    id: 5,
    name: 'Tank A',
    station: 'Cape Coast Station',
    fuelType: 'Super',
    capacity: 20000,
    currentStock: 16400,
    fillPercentage: 82,
    pricePerLiter: 8.75,
    lastRefill: '2024-12-12',
    status: 'Good'
  },
  {
    id: 6,
    name: 'Tank B',
    station: 'Cape Coast Station',
    fuelType: 'Diesel',
    capacity: 20000,
    currentStock: 2400,
    fillPercentage: 12,
    pricePerLiter: 8.10,
    lastRefill: '2024-12-01',
    status: 'Critical'
  },
  {
    id: 7,
    name: 'Tank A',
    station: 'Tamale Station',
    fuelType: 'Super',
    capacity: 18000,
    currentStock: 12000,
    fillPercentage: 67,
    pricePerLiter: 8.90,
    lastRefill: '2024-12-08',
    status: 'Good'
  },
  {
    id: 8,
    name: 'Tank B',
    station: 'Tamale Station',
    fuelType: 'Diesel',
    capacity: 18000,
    currentStock: 4500,
    fillPercentage: 25,
    pricePerLiter: 8.00,
    lastRefill: '2024-12-06',
    status: 'Low'
  }
];

export const mockSharedProductsData = [
  {
    id: 1,
    date: '2024-12-15',
    stationQuantities: [
      { station: 'Accra Central Station', qty: 3000 },
      { station: 'Kumasi North Station', qty: 2000 }
    ],
    product: 'Super',
    totalQty: 5000,
    rate: 7.20,
    amountCost: 36000.00,
    salesRate: 8.50,
    amountSales: 42500.00,
    expectedProfit: 6500.00,
    status: 'PENDING' as const,
    createdBy: 'John Mensah',
    createdAt: '2024-12-15 09:30:00'
  },
  {
    id: 2,
    date: '2024-12-14',
    stationQuantities: [
      { station: 'Kumasi North Station', qty: 3500 }
    ],
    product: 'Diesel',
    totalQty: 3500,
    rate: 6.80,
    amountCost: 23800.00,
    salesRate: 7.95,
    amountSales: 27825.00,
    expectedProfit: 4025.00,
    status: 'APPROVED' as const,
    createdBy: 'Sarah Asante',
    createdAt: '2024-12-14 14:15:00'
  },
  {
    id: 3,
    date: '2024-12-14',
    stationQuantities: [
      { station: 'Cape Coast Station', qty: 2000 }
    ],
    product: 'Super',
    totalQty: 2000,
    rate: 7.30,
    amountCost: 14600.00,
    salesRate: 8.75,
    amountSales: 17500.00,
    expectedProfit: 2900.00,
    status: 'REJECTED' as const,
    createdBy: 'Kwame Osei',
    createdAt: '2024-12-14 11:45:00'
  },
  {
    id: 4,
    date: '2024-12-13',
    stationQuantities: [
      { station: 'Accra Central Station', qty: 2500 },
      { station: 'Tamale Station', qty: 1500 }
    ],
    product: 'Diesel',
    totalQty: 4000,
    rate: 6.75,
    amountCost: 27000.00,
    salesRate: 7.80,
    amountSales: 31200.00,
    expectedProfit: 4200.00,
    status: 'APPROVED' as const,
    createdBy: 'Akua Boateng',
    createdAt: '2024-12-13 16:20:00'
  },
  {
    id: 5,
    date: '2024-12-13',
    stationQuantities: [
      { station: 'Tamale Station', qty: 1500 }
    ],
    product: 'Gas',
    totalQty: 1500,
    rate: 5.50,
    amountCost: 8250.00,
    salesRate: 6.20,
    amountSales: 9300.00,
    expectedProfit: 1050.00,
    status: 'PENDING' as const,
    createdBy: 'Ibrahim Yakubu',
    createdAt: '2024-12-13 10:30:00'
  },
  {
    id: 6,
    date: '2024-12-12',
    stationQuantities: [
      { station: 'Cape Coast Station', qty: 1800 },
      { station: 'Ho Station', qty: 1000 }
    ],
    product: 'Diesel',
    totalQty: 2800,
    rate: 6.85,
    amountCost: 19180.00,
    salesRate: 8.10,
    amountSales: 22680.00,
    expectedProfit: 3500.00,
    status: 'APPROVED' as const,
    createdBy: 'Francis Adu',
    createdAt: '2024-12-12 13:45:00'
  }
];

export const baseHistoryData = [
  {
    id: 7,
    date: '2024-12-01',
    type: 'Emergency Refill' as const,
    amount: 8000,
    supplier: 'Emergency Fuel Services',
    cost: 68000,
    urgency: 'HIGH',
    operator: 'Akua Boateng'
  },
  {
    id: 6,
    date: '2024-12-03',
    type: 'Transfer In' as const,
    amount: 3500,
    source: 'Takoradi Station',
    operator: 'Francis Adu'
  },
  {
    id: 3,
    date: '2024-12-05',
    type: 'Price Update' as const,
    oldPrice: 8.40,
    newPrice: 8.50,
    operator: 'Admin User'
  },
  {
    id: 5,
    date: '2024-12-06',
    type: 'Calibration' as const,
    description: 'Tank gauge recalibration - accuracy verified',
    operator: 'Technical Team'
  },
  {
    id: 4,
    date: '2024-12-08',
    type: 'Maintenance' as const,
    description: 'Routine tank cleaning and inspection',
    operator: 'Kwame Osei'
  },
  {
    id: 2,
    date: '2024-12-10',
    type: 'Transfer Out' as const,
    amount: 2000,
    destination: 'Kumasi North Station',
    operator: 'Sarah Asante'
  },
  {
    id: 1,
    date: '2024-12-12',
    type: 'Refill' as const,
    amount: 15000,
    supplier: 'KTC Supply Co.',
    cost: 127500,
    operator: 'John Mensah'
  },
  {
    id: 8,
    date: '2024-12-13',
    type: 'Quality Check' as const,
    description: 'Fuel quality testing - All parameters within specifications',
    operator: 'Quality Control Team'
  },
  {
    id: 9,
    date: '2024-12-14',
    type: 'Transfer Out' as const,
    amount: 1500,
    destination: 'Tamale Station',
    operator: 'Ibrahim Yakubu'
  },
  {
    id: 10,
    date: '2024-12-15',
    type: 'Price Update' as const,
    oldPrice: 8.50,
    newPrice: 8.75,
    operator: 'Admin User'
  }
];

export const sharingTemplates = [
  {
    id: 'weekly_distribution',
    name: 'Weekly Fuel Distribution',
    description: 'Standard weekly distribution to all stations',
    products: [
      {
        product: 'Super',
        stationQuantities: [
          { station: 'Accra Central Station', qty: 5000 },
          { station: 'Kumasi North Station', qty: 3500 },
          { station: 'Cape Coast Station', qty: 2500 }
        ],
        rate: 7.20,
        salesRate: 8.50
      },
      {
        product: 'Diesel',
        stationQuantities: [
          { station: 'Accra Central Station', qty: 4000 },
          { station: 'Kumasi North Station', qty: 3000 },
          { station: 'Cape Coast Station', qty: 2000 }
        ],
        rate: 6.80,
        salesRate: 7.95
      }
    ]
  },
  {
    id: 'emergency_supply',
    name: 'Emergency Supply',
    description: 'Emergency fuel supply to critical stations',
    products: [
      {
        product: 'Super',
        stationQuantities: [
          { station: 'Accra Central Station', qty: 2000 },
          { station: 'Tamale Station', qty: 1500 }
        ],
        rate: 7.30,
        salesRate: 8.60
      }
    ]
  },
  {
    id: 'northern_supply',
    name: 'Northern Region Supply',
    description: 'Focused supply to northern stations',
    products: [
      {
        product: 'Super',
        stationQuantities: [
          { station: 'Tamale Station', qty: 3000 }
        ],
        rate: 7.40,
        salesRate: 8.90
      },
      {
        product: 'Diesel',
        stationQuantities: [
          { station: 'Tamale Station', qty: 2500 }
        ],
        rate: 6.90,
        salesRate: 8.00
      }
    ]
  }
];