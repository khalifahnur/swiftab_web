import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface StepFourProps {
  formData: { location: string; latitude: string; longitude: string; };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { location?: string; latitude?: string; longitude?: string; };
  touched: { location?: boolean; latitude?: boolean; longitude?: boolean; };
}

interface GoogleGeoFeature {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
}

export function StepFour({ formData, handleInputChange, errors, touched }: StepFourProps) {
  const [suggestions, setSuggestions] = useState<GoogleGeoFeature[]>([]);

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange(e);

    if (value.length > 3) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.warn("Google Maps API key is missing. Autocomplete disabled.");
          return;
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(value)}&key=${apiKey}`
        );

        if (!response.ok) throw new Error("Failed to fetch suggestions");

        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };
  
  const selectSuggestion = (feature: GoogleGeoFeature) => {
    const latitude = feature.geometry.location.lat;
    const longitude = feature.geometry.location.lng;
    
    setSuggestions([]);
    
    handleInputChange({ target: { name: "stepFour.location", value: feature.formatted_address } } as React.ChangeEvent<HTMLInputElement>);
    handleInputChange({ target: { name: "stepFour.latitude", value: latitude.toString() } } as React.ChangeEvent<HTMLInputElement>);
    handleInputChange({ target: { name: "stepFour.longitude", value: longitude.toString() } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Location Details</h3>
        <p className="text-sm text-gray-500 mb-6">Help customers find your restaurant accurately on Google Maps.</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Label htmlFor="location" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Physical Address</Label>
          <div className="relative mt-2">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="stepFour.location"
              value={formData.location}
              onChange={handleLocationChange}
              placeholder="Start typing your address..."
              className="h-12 pl-10 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] text-base"
              autoComplete="off"
            />
          </div>
          {touched.location && errors.location && (
            <p className="text-red-500 text-xs font-bold mt-1">{errors.location}</p>
          )}

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border border-gray-100 shadow-xl rounded-xl mt-2 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((feature, index) => (
                <li
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => selectSuggestion(feature)}
                >
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{feature.formatted_address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Latitude</Label>
            <Input
              name="stepFour.latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="-1.286389"
              className="h-12 bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
            />
            {touched.latitude && errors.latitude && (
              <p className="text-red-500 text-xs font-bold mt-1">{errors.latitude}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Longitude</Label>
            <Input
              name="stepFour.longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="36.817223"
              className="h-12 bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
            />
            {touched.longitude && errors.longitude && (
              <p className="text-red-500 text-xs font-bold mt-1">{errors.longitude}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}