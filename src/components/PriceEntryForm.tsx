import { useState } from "react";
import { PriceEntry } from "@/types/PriceEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Plus, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PriceEntryFormProps {
  onAddEntry: (entry: Omit<PriceEntry, "id" | "createdAt">) => void;
}

const PriceEntryForm = ({ onAddEntry }: PriceEntryFormProps) => {
  const [location, setLocation] = useState("");
  const [productName, setProductName] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !productName.trim() || !price.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in location, product name, and price.",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    onAddEntry({
      location: location.trim(),
      productName: productName.trim(),
      specifications: specifications.trim(),
      price: priceValue,
    });

    // Reset form
    setLocation("");
    setProductName("");
    setSpecifications("");
    setPrice("");

    toast({
      title: "Entry Added",
      description: "Your price entry has been added successfully.",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Research</h2>
          <p className="text-sm text-muted-foreground">Add product pricing data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium text-foreground">
            Product Name
          </Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Samsung Galaxy S24, Pressure Cooker 5L"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-foreground">
            Target Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Area, or Pincode"
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-foreground">
              Quoted Price
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications" className="text-sm font-medium text-foreground">
              Condition/Specs
            </Label>
            <Input
              id="specifications"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="HSN/SAC, Model, Size..."
              className="h-11"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium gap-2">
          <Plus className="w-5 h-5" />
          Compare Prices
        </Button>
      </form>
    </div>
  );
};

export default PriceEntryForm;
