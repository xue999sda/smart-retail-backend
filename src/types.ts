export type Language = 'zh' | 'en';

export interface CategoryData {
  id: string;
  nameKey: string; // Key for translations
  percentage: number;
  value: number;
  qty: number;
  color: string;
}

export interface MonthlyPerformance {
  monthKey: string;
  data: {
    mobile: number;
    accessories: number;
    largeAppliances: number;
    smallAppliances: number;
  };
}

export interface StoreRank {
  rank: number;
  storeKey: string;
  sales: number;
  dateKey: string;
  percentage: number; // For progress bar width
}

export interface HistoricalTrend {
  ymKey: string;
  mobile: number;
  accessories: number;
  largeAppliances: number;
  smallAppliances: number;
}

// Data models for the sales forms
export interface SalesItem {
  id: string;
  nameZh: string;
  nameEn: string;
  quantity: number;
  unitPrice: number; // Used for calculation of amount
  isInternal?: boolean;
}

export interface SalesCategory {
  id: string; // 'mobile' | 'accessories' | 'large' | 'small'
  nameKey: string;
  items: SalesItem[];
}

export type TransactionStatus = 'idle' | 'pending' | 'success';

export interface TransactionNotification {
  id: string;
  status: 'pending' | 'success';
  hash?: string;
  confirmations?: number;
}
