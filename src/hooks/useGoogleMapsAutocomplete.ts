import { useEffect, useRef, useState, useCallback } from 'react';

interface GoogleMapsWindow {
  google?: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options?: object
        ) => GoogleAutocomplete;
      };
      event: {
        clearInstanceListeners: (instance: object) => void;
      };
    };
  };
  initGoogleMaps?: () => void;
}

interface GoogleAutocomplete {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => PlaceResult | undefined;
}

interface PlaceResult {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

const getGoogleWindow = (): GoogleMapsWindow => window as unknown as GoogleMapsWindow;

export const useGoogleMapsAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>,
  onPlaceSelect: (place: PlaceResult) => void
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null);

  const initAutocomplete = useCallback(() => {
    const gWindow = getGoogleWindow();
    if (!inputRef.current || !gWindow.google?.maps?.places) return;

    try {
      autocompleteRef.current = new gWindow.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(regions)'],
          componentRestrictions: { country: 'in' },
          fields: ['formatted_address', 'name', 'geometry'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          onPlaceSelect(place as PlaceResult);
        }
      });

      setIsLoaded(true);
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
      setError('Failed to initialize location search');
    }
  }, [inputRef, onPlaceSelect]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    const gWindow = getGoogleWindow();

    // Check if already loaded
    if (gWindow.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Load the script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', initAutocomplete);
      return;
    }

    gWindow.initGoogleMaps = initAutocomplete;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      if (autocompleteRef.current && gWindow.google?.maps?.event) {
        gWindow.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initAutocomplete]);

  return { isLoaded, error };
};
