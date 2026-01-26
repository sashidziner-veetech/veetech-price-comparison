import { useState } from "react";
import { PriceEntry, QuotationAnalysis, MarketComparison } from "@/types/PriceEntry";
import Header from "@/components/Header";
import PriceEntryForm from "@/components/PriceEntryForm";
import AnalysisResultsPanel from "@/components/AnalysisResultsPanel";
import FavoritesPanel from "@/components/FavoritesPanel";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [analysis, setAnalysis] = useState<QuotationAnalysis | null>(null);
  const [analysisLocation, setAnalysisLocation] = useState("");
  const [favorites, setFavorites] = useState<MarketComparison[]>([]);
  const handleAddEntry = (newEntry: Omit<PriceEntry, "id" | "createdAt">) => {
    const entry: PriceEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setEntries((prev) => [entry, ...prev]);
  };

  const handleAnalysisComplete = (result: QuotationAnalysis, location: string) => {
    setAnalysis(result);
    setAnalysisLocation(location);

    // Also add quoted items as entries
    if (result.quotedItems) {
      result.quotedItems.forEach((item) => {
        handleAddEntry({
          location,
          productName: item.name,
          specifications: item.specifications,
          price: item.quotedPrice,
          isQuoted: true,
        });
      });
    }
  };

  const handleAddToFavorites = (item: MarketComparison) => {
    setFavorites((prev) => [...prev, item]);
  };

  const handleRemoveFavorite = (index: number) => {
    setFavorites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearFavorites = () => {
    setFavorites([]);
    toast({
      title: "Favorites Cleared",
      description: "All saved vendors have been removed.",
    });
  };

  // Calculate estimated price from analysis for manual entry
  const estimatedPrice = analysis?.summary?.estimatedMarketRange || null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4 md:top-6">
              <PriceEntryForm
                onAddEntry={handleAddEntry}
                onAnalysisComplete={handleAnalysisComplete}
                estimatedPrice={estimatedPrice}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Favorites Panel */}
            <FavoritesPanel
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onClear={handleClearFavorites}
            />

            <AnalysisResultsPanel
              analysis={analysis}
              location={analysisLocation}
              favorites={favorites}
              onAddToFavorites={handleAddToFavorites}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-10 sm:mt-16 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2026 <span className="text-primary">Price Comparison Tool</span>. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
