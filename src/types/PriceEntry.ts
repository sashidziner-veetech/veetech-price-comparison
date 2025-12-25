export interface PriceEntry {
  id: string;
  location: string;
  productName: string;
  specifications: string;
  price: number;
  createdAt: Date;
  isQuoted?: boolean;
  vendorName?: string;
  address?: string;
  phone?: string;
}

export interface QuotedItem {
  name: string;
  specifications: string;
  quotedPrice: number;
  hsnSac?: string;
}

export interface MarketComparison {
  productName: string;
  location: string;
  vendorName: string;
  priceRange: {
    min: number;
    max: number;
  };
  address?: string;
  phone?: string;
  notes?: string;
}

export interface AnalysisSummary {
  totalQuotedAmount: number;
  estimatedMarketRange: {
    min: number;
    max: number;
  };
  recommendation: string;
}

export interface QuotationAnalysis {
  quotedItems: QuotedItem[];
  marketComparisons: MarketComparison[];
  summary: AnalysisSummary;
  rawContent?: string;
  parseError?: boolean;
}
