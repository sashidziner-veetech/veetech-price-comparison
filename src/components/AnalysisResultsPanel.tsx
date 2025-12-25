import { QuotationAnalysis, QuotedItem, MarketComparison } from "@/types/PriceEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Package,
  MapPin,
  Phone,
  Store,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ExternalLink,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AnalysisResultsPanelProps {
  analysis: QuotationAnalysis | null;
  location: string;
  favorites: MarketComparison[];
  onAddToFavorites: (item: MarketComparison) => void;
}

const AnalysisResultsPanel = ({ analysis, location, favorites, onAddToFavorites }: AnalysisResultsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const isFavorite = (item: MarketComparison) => {
    return favorites.some(
      (f) => f.vendorName === item.vendorName && f.productName === item.productName && f.location === item.location
    );
  };

  const handleAddToFavorites = (item: MarketComparison) => {
    if (isFavorite(item)) {
      toast({
        title: "Already in Favorites",
        description: "This vendor is already saved to your favorites.",
      });
      return;
    }
    onAddToFavorites(item);
    toast({
      title: "Added to Favorites",
      description: `${item.vendorName} has been saved for comparison.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const exportToCSV = () => {
    if (!analysis) return;

    const headers = [
      "Type",
      "Product Name",
      "Vendor",
      "Location",
      "Price/Price Range",
      "Specifications",
      "Contact",
    ];

    const quotedRows = analysis.quotedItems.map((item) => [
      "Your Quotation",
      item.name,
      "-",
      location,
      `₹${item.quotedPrice}`,
      item.specifications,
      "-",
    ]);

    const marketRows = analysis.marketComparisons.map((item) => [
      "Market Price",
      item.productName,
      item.vendorName,
      item.location,
      `₹${item.priceRange.min} - ₹${item.priceRange.max}`,
      item.notes || "-",
      item.phone || "-",
    ]);

    const csvContent = [headers, ...quotedRows, ...marketRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `price-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredComparisons = analysis?.marketComparisons.filter((item) => {
    const minPriceNum = parseFloat(minPrice) || 0;
    const maxPriceNum = parseFloat(maxPrice) || Infinity;
    const matchesPrice =
      item.priceRange.min >= minPriceNum && item.priceRange.max <= maxPriceNum;
    const matchesSearch =
      !searchQuery ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPrice && matchesSearch;
  });

  const getPriceComparison = (quotedPrice: number, marketMin: number, marketMax: number) => {
    const marketAvg = (marketMin + marketMax) / 2;
    const diff = ((quotedPrice - marketAvg) / marketAvg) * 100;

    if (diff < -5) {
      return { icon: TrendingDown, color: "text-success", label: "Below Market" };
    } else if (diff > 5) {
      return { icon: TrendingUp, color: "text-destructive", label: "Above Market" };
    }
    return { icon: Minus, color: "text-muted-foreground", label: "Market Rate" };
  };

  if (!analysis) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Results</h2>
          <p className="text-sm text-muted-foreground">
            Upload a quotation to see price comparisons
          </p>
        </div>
        <div className="p-4 md:p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No analysis yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Upload a product quotation file and select a target location to compare prices across local vendors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analysis.parseError) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Analysis Result</h2>
        </div>
        <div className="prose prose-sm max-w-none">
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {analysis.rawContent}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Results ({analysis.marketComparisons.length} vendors)
            </h2>
            <p className="text-sm text-muted-foreground">
              {analysis.quotedItems.length} items compared in {location}
            </p>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={exportToCSV}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Card */}
        {analysis.summary && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Quote</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {formatPrice(analysis.summary.totalQuotedAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Range</p>
                <p className="text-xl font-bold text-foreground flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {formatPrice(analysis.summary.estimatedMarketRange.min)} - {formatPrice(analysis.summary.estimatedMarketRange.max)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Verdict</p>
                <p className="text-sm font-medium text-foreground">
                  {analysis.summary.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 h-9"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 h-9"
            />
          </div>
        </div>
      </div>

      {/* Quoted Items */}
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Your Quoted Items
        </h3>
        <div className="space-y-3">
          {analysis.quotedItems.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-accent/10 border-2 border-accent rounded-lg animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-accent text-accent-foreground">
                    YOUR QUOTATION
                  </Badge>
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  {item.specifications && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.specifications}
                      {item.hsnSac && ` • HSN/SAC: ${item.hsnSac}`}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-foreground flex items-center gap-0.5">
                    <IndianRupee className="w-5 h-5" />
                    {formatPrice(item.quotedPrice)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Comparisons */}
      <div className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Market Prices ({filteredComparisons?.length || 0})
        </h3>
        <div className="space-y-4">
          {filteredComparisons?.map((item, index) => (
            <div
              key={index}
              className="p-5 bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide truncate">
                      {item.location}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-foreground mb-1">
                    {item.productName}
                  </h4>

                  {item.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {item.vendorName && (
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{item.vendorName}</span>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{item.phone}</span>
                      </div>
                    )}
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit Store</span>
                      </a>
                    )}
                  </div>

                  {item.address && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      {item.address}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground flex items-center gap-0.5">
                      <IndianRupee className="w-5 h-5" />
                      {formatPrice(item.priceRange.min)}
                      {item.priceRange.min !== item.priceRange.max && (
                        <span className="text-base font-normal text-muted-foreground">
                          {" - "}₹{formatPrice(item.priceRange.max)}
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">VENDOR PRICE</span>
                  </div>
                  <Button
                    variant={isFavorite(item) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleAddToFavorites(item)}
                    className="gap-1.5"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(item) ? "fill-primary text-primary" : ""}`} />
                    {isFavorite(item) ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredComparisons?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No vendors match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPanel;
