import { PriceEntry } from "@/types/PriceEntry";
import PriceEntryCard from "./PriceEntryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, Search, Package } from "lucide-react";
import { useState } from "react";

interface ResultsPanelProps {
  entries: PriceEntry[];
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

const ResultsPanel = ({ entries, onDeleteEntry, onClearAll }: ResultsPanelProps) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter((entry) => {
    const minPriceNum = parseFloat(minPrice) || 0;
    const maxPriceNum = parseFloat(maxPrice) || Infinity;
    const matchesPrice = entry.price >= minPriceNum && entry.price <= maxPriceNum;
    const matchesSearch =
      !searchQuery ||
      entry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPrice && matchesSearch;
  });

  const exportToCSV = () => {
    if (entries.length === 0) return;

    const headers = ["Location", "Product Name", "Specifications", "Price (₹)", "Date Added"];
    const rows = entries.map((entry) => [
      entry.location,
      entry.productName,
      entry.specifications,
      entry.price.toString(),
      entry.createdAt.toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `price-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Results ({filteredEntries.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              {entries.length} total entries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={entries.length === 0}
              className="gap-1.5 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportToCSV}
              disabled={entries.length === 0}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or locations..."
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

      {/* Results List */}
      <div className="p-4 md:p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No entries yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {entries.length === 0
                ? "Start adding product prices using the form to compare local rates."
                : "No entries match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <PriceEntryCard
                key={entry.id}
                entry={entry}
                isHighlighted={index === 0}
                onDelete={onDeleteEntry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
