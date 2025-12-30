import { useState } from "react";
import { PriceEntry } from "@/types/PriceEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LocationAutocomplete from "./LocationAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { QuotationAnalysis } from "@/types/PriceEntry";

interface PriceEntryFormProps {
  onAddEntry: (entry: Omit<PriceEntry, "id" | "createdAt">) => void;
  onAnalysisComplete: (analysis: QuotationAnalysis, location: string) => void;
  estimatedPrice?: { min: number; max: number } | null;
}

const PriceEntryForm = ({ onAddEntry, onAnalysisComplete, estimatedPrice }: PriceEntryFormProps) => {
  const [location, setLocation] = useState("");
  const [productName, setProductName] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !productName.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in product name and target location.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const parsedQuotedPrice = parseFloat(quotedPrice) || 0;
      
      const { data, error } = await supabase.functions.invoke("analyze-quotation", {
        body: {
          mode: "manual",
          productName: productName.trim(),
          specifications: specifications.trim(),
          location: location.trim(),
          quotedPrice: parsedQuotedPrice,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.data) {
        onAnalysisComplete(data.data as QuotationAnalysis, location.trim());
        toast({
          title: "Search Complete",
          description: "Price comparison results are ready.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast({
        title: "Search Failed",
        description: err instanceof Error ? err.message : "Failed to search prices",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Price Research</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Compare local vendor prices</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium text-foreground">
            Product Name
          </Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Acer laptop, Samsung Galaxy S24"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Target Location
          </Label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Search city, area, or pincode..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specifications" className="text-sm font-medium text-foreground">
            Specific Requirements
          </Label>
          <Input
            id="specifications"
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="e.g., 512GB Hard Disk, 8GB Ram, Model XYZ..."
            className="h-11"
          />
        </div>

        {/* Your Quoted Price - Editable */}
        <div className="space-y-2">
          <Label htmlFor="quotedPrice" className="text-sm font-medium text-foreground">
            Your Quoted Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              id="quotedPrice"
              type="number"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="Enter your quoted price..."
              className="h-11 pl-8"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the price you've been quoted for comparison
          </p>
        </div>

        {/* Estimated Market Price - Read-only from results */}
        <div className="space-y-2">
          <Label htmlFor="estimatedPrice" className="text-sm font-medium text-foreground">
            Estimated Market Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              id="estimatedPrice"
              value={
                estimatedPrice
                  ? estimatedPrice.min === estimatedPrice.max
                    ? formatPrice(estimatedPrice.min)
                    : `${formatPrice(estimatedPrice.min)} - ${formatPrice(estimatedPrice.max)}`
                  : ""
              }
              readOnly
              placeholder="Price will appear after search..."
              className={`h-11 pl-8 ${
                estimatedPrice 
                  ? "bg-success/10 border-success text-foreground font-semibold" 
                  : "bg-muted/50"
              }`}
            />
          </div>
          {estimatedPrice && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Based on {location || "location"} vendor prices
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isSearching || !productName.trim() || !location.trim()}
          className="w-full h-12 text-base font-medium gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching Prices...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Compare Live Prices
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PriceEntryForm;
