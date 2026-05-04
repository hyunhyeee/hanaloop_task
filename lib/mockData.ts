import { ProductPCF, PCFDashboardSummary } from '../types/pcf';

export const mockDashboardSummary: PCFDashboardSummary = {
  totalAveragePcf: 45.2,
  topEmissionProducts: [
    { name: 'Eco-Smart Phone A', value: 85.4 },
    { name: 'Power Battery Pack X', value: 120.2 },
    { name: 'Wireless Earbuds V2', value: 12.5 },
  ],
  monthlyTrend: [
    { month: '2025-11', emissions: 4500 },
    { month: '2025-12', emissions: 4200 },
    { month: '2026-01', emissions: 3900 },
    { month: '2026-02', emissions: 3800 },
    { month: '2026-03', emissions: 3500 },
    { month: '2026-04', emissions: 3450 },
  ],
  reductionTarget: 15,
  currentReduction: 8.4,
};

export const mockProducts: ProductPCF[] = [
  {
    id: 'prod-1',
    productName: 'Eco-Smart Phone A',
    sku: 'ESP-001',
    category: 'Electronics',
    unit: '1 unit',
    totalCo2e: 85.4,
    lastUpdated: '2026-04-28',
    breakdown: {
      RAW_MATERIAL: 45.2,
      PRODUCTION: 25.4,
      TRANSPORTATION: 10.8,
      USE: 2.5,
      DISPOSAL: 1.5,
    },
    sources: [
      { id: 's1', stage: 'RAW_MATERIAL', name: 'Aluminum Housing', value: 0.5, unit: 'kg', emissionFactor: 12.5, totalCo2e: 6.25 },
      { id: 's2', stage: 'PRODUCTION', name: 'Assembly Line Energy', value: 15, unit: 'kWh', emissionFactor: 0.45, totalCo2e: 6.75 },
    ]
  },
  {
    id: 'prod-2',
    productName: 'Power Battery Pack X',
    sku: 'PBP-X2',
    category: 'Energy',
    unit: '1 unit',
    totalCo2e: 120.2,
    lastUpdated: '2026-05-01',
    breakdown: {
      RAW_MATERIAL: 85.0,
      PRODUCTION: 20.2,
      TRANSPORTATION: 12.0,
      USE: 1.5,
      DISPOSAL: 1.5,
    },
    sources: []
  }
];
