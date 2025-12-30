import { MarketComparison } from "@/types/PriceEntry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  X,
  MapPin,
  Phone,
  Store,
  IndianRupee,
  ExternalLink,
  Trash2,
  Scale,
} from "lucide-react";

interface FavoritesPanelProps {
  favorites: MarketComparison[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

const FavoritesPanel = ({ favorites, onRemove, onClear }: FavoritesPanelProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (favorites.length === 0) {
    return null;
  }

  // Calculate comparison stats
  const allMinPrices = favorites.map((f) => f.priceRange.min);
  const allMaxPrices = favorites.map((f) => f.priceRange.max);
  const lowestPrice = Math.min(...allMinPrices);
  const highestPrice = Math.max(...allMaxPrices);
  const avgPrice = favorites.reduce((sum, f) => sum + (f.priceRange.min + f.priceRange.max) / 2, 0) / favorites.length;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Favorites ({favorites.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Compare your saved vendors
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>

        {/* Comparison Summary */}
        <div className="mt-4 p-3 sm:p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground">Price Comparison</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lowest</p>
              <p className="text-sm sm:text-lg font-bold text-success flex items-center gap-0.5">
                <IndianRupee className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatPrice(lowestPrice)}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Average</p>
              <p className="text-sm sm:text-lg font-bold text-foreground flex items-center gap-0.5">
                <IndianRupee className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatPrice(avgPrice)}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Highest</p>
              <p className="text-sm sm:text-lg font-bold text-destructive flex items-center gap-0.5">
                <IndianRupee className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatPrice(highestPrice)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="space-y-4">
          {favorites.map((item, index) => {
            const avgItemPrice = (item.priceRange.min + item.priceRange.max) / 2;
            const isLowest = item.priceRange.min === lowestPrice;
            
            return (
              <div
                key={index}
                className={`p-3 sm:p-4 border rounded-xl transition-all animate-fade-in ${
                  isLowest 
                    ? "bg-success/10 border-success" 
                    : "bg-card border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {isLowest && (
                        <Badge variant="default" className="bg-success text-success-foreground text-xs">
                          BEST PRICE
                        </Badge>
                      )}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide truncate">
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-semibold text-foreground mb-1">
                      {item.productName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                      {item.vendorName && (
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-medium truncate">{item.vendorName}</span>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.phone}</span>
                        </div>
                      )}
                      {item.website && (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Visit</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-0.5">
                        <IndianRupee className="w-4 sm:w-5 h-4 sm:h-5" />
                        {formatPrice(item.priceRange.min)}
                        {item.priceRange.min !== item.priceRange.max && (
                          <span className="text-sm sm:text-base font-normal text-muted-foreground">
                            {" - "}₹{formatPrice(item.priceRange.max)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPanel;
