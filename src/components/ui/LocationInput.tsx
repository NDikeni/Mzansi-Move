/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Input } from './Input';

const libraries: ("places")[] = ['places'];

type LocationInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
};

export function LocationInput({ label, onPlaceSelected, ...props }: LocationInputProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelected(place);
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded || !apiKey) {
    return <Input label={label} {...props} />;
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          {...props}
          className={`w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mzansi-yellow focus:border-transparent transition-all ${props.className || ''}`}
        />
      </Autocomplete>
    </div>
  );
}
