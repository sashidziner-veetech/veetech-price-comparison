import { useState } from "react";
import { PriceEntry } from "@/types/PriceEntry";
import Header from "@/components/Header";
import PriceEntryForm from "@/components/PriceEntryForm";
import ResultsPanel from "@/components/ResultsPanel";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [entries, setEntries] = useState<PriceEntry[]>([]);

  const handleAddEntry = (newEntry: Omit<PriceEntry, "id" | "createdAt">) => {
    const entry: PriceEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setEntries((prev) => [entry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    toast({
      title: "Entry Removed",
      description: "The price entry has been deleted.",
    });
  };

  const handleClearAll = () => {
    if (entries.length === 0) return;
    setEntries([]);
    toast({
      title: "All Cleared",
      description: "All price entries have been removed.",
    });
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
            Research and compare product prices across different locations. Add entries to build your price comparison database.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <PriceEntryForm onAddEntry={handleAddEntry} />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <ResultsPanel
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>PriceScoutAI — Local price research made simple</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
