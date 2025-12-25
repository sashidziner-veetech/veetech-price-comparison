import { PriceEntry } from "@/types/PriceEntry";
import { MapPin, Package, Trash2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceEntryCardProps {
  entry: PriceEntry;
  isHighlighted?: boolean;
  onDelete: (id: string) => void;
}

const PriceEntryCard = ({ entry, isHighlighted = false, onDelete }: PriceEntryCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div
      className={`group relative bg-card rounded-xl border transition-all duration-200 animate-slide-up ${
        isHighlighted
          ? "border-accent shadow-elevated ring-2 ring-accent/20"
          : "border-border shadow-card hover:shadow-card-hover"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3 left-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
            YOUR QUOTED PRICE
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide truncate">
                {entry.location}
              </span>
            </div>

            <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
              {entry.productName}
            </h3>

            {entry.specifications && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {entry.specifications}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-0.5 text-xl font-bold text-foreground">
              <IndianRupee className="w-5 h-5" />
              {formatPrice(entry.price)}
            </div>
            <span className="text-xs text-muted-foreground">QUOTED</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="w-3.5 h-3.5" />
            <span>
              Added {entry.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PriceEntryCard;
