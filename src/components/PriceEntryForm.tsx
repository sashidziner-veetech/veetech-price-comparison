import { useState } from "react";
import { PriceEntry } from "@/types/PriceEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Plus, IndianRupee, FileUp, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LocationAutocomplete from "./LocationAutocomplete";
import FileUpload from "./FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { QuotationAnalysis } from "@/types/PriceEntry";

interface PriceEntryFormProps {
  onAddEntry: (entry: Omit<PriceEntry, "id" | "createdAt">) => void;
  onAnalysisComplete: (analysis: QuotationAnalysis, location: string) => void;
}

const PriceEntryForm = ({ onAddEntry, onAnalysisComplete }: PriceEntryFormProps) => {
  const [location, setLocation] = useState("");
  const [productName, setProductName] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [price, setPrice] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedContent, setUploadedContent] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
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
      isQuoted: true,
    });

    setProductName("");
    setSpecifications("");
    setPrice("");

    toast({
      title: "Entry Added",
      description: "Your price entry has been added successfully.",
    });
  };

  const handleFileContent = (content: string, fileName: string) => {
    setUploadedContent(content);
    setUploadedFileName(fileName);
  };

  const handleAnalyzeQuotation = async () => {
    if (!uploadedContent) {
      toast({
        title: "No File",
        description: "Please upload a quotation file first.",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a target location for price comparison.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-quotation", {
        body: {
          quotationText: uploadedContent,
          location: location.trim(),
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.data) {
        onAnalysisComplete(data.data as QuotationAnalysis, location.trim());
        toast({
          title: "Analysis Complete",
          description: "Price comparison results are ready.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Failed to analyze quotation",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Research</h2>
          <p className="text-sm text-muted-foreground">Add or upload pricing data</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload" className="gap-2">
            <FileUp className="w-4 h-4" />
            Upload Quotation
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Plus className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-5">
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

          <FileUpload 
            onFileContent={handleFileContent} 
            isProcessing={isAnalyzing} 
          />

          {uploadedFileName && (
            <p className="text-sm text-muted-foreground">
              Ready to analyze: <span className="font-medium text-foreground">{uploadedFileName}</span>
            </p>
          )}

          <Button
            onClick={handleAnalyzeQuotation}
            disabled={!uploadedContent || !location.trim() || isAnalyzing}
            className="w-full h-12 text-base font-medium gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Prices...
              </>
            ) : (
              <>
                <ClipboardCheck className="w-5 h-5" />
                Compare Prices
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="manual">
          <form onSubmit={handleManualSubmit} className="space-y-5">
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
              <Label className="text-sm font-medium text-foreground">
                Target Location
              </Label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Search city, area, or pincode..."
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
              Add Entry
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceEntryForm;
