import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useGoogleMapsAutocomplete } from "@/hooks/useGoogleMapsAutocomplete";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "City, Area, or Pincode",
  className,
}: LocationAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, error } = useGoogleMapsAutocomplete(inputRef, (place) => {
    if (place.formatted_address) {
      onChange(place.formatted_address);
    }
  });

  // Sync value to input
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 pl-9 pr-9 ${className}`}
      />
      {!isLoaded && !error && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}
      {error && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive">
          !
        </span>
      )}
    </div>
  );
};

export default LocationAutocomplete;
