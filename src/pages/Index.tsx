import { useState } from "react";
import { PriceEntry, QuotationAnalysis } from "@/types/PriceEntry";
import Header from "@/components/Header";
import PriceEntryForm from "@/components/PriceEntryForm";
import AnalysisResultsPanel from "@/components/AnalysisResultsPanel";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [analysis, setAnalysis] = useState<QuotationAnalysis | null>(null);
  const [analysisLocation, setAnalysisLocation] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Page Title */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Local Price Comparison Tool
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your quotation and compare prices across local vendors. Get AI-powered market research instantly.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <PriceEntryForm
                onAddEntry={handleAddEntry}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <AnalysisResultsPanel
              analysis={analysis}
              location={analysisLocation}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>PriceScoutAI — AI-powered local price research</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
