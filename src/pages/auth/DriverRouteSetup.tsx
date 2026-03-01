import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { LocationInput } from '@/src/components/ui/LocationInput';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function DriverRouteSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    fare_empty: '',
    fare_half: '',
    fare_full: ''
  });
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [departurePlace, setDeparturePlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (departurePlace?.geometry?.location && destinationPlace?.geometry?.location) {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [departurePlace.geometry.location],
        destinations: [destinationPlace.geometry.location],
        travelMode: google.maps.TravelMode.DRIVING,
      }, (response, status) => {
        if (status === 'OK' && response) {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            setDistanceKm(element.distance.value / 1000); // Convert meters to km
          }
        }
      });
    }
  }, [departurePlace, destinationPlace]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePricePerKm = (fare: string) => {
    if (!distanceKm || !fare || Number(fare) === 0) return '0';
    return (Number(fare) / distanceKm).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const driver_id = localStorage.getItem('driver_id');
    if (!driver_id) {
      setError('Driver ID not found. Please register again.');
      return;
    }

    if (!distanceKm) {
      setError('Please select valid departure and destination locations to calculate distance.');
      return;
    }

    try {
      const res = await fetch('/api/driver/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          driver_id, 
          departure: formData.departure,
          destination: formData.destination,
          price_per_km_empty: calculatePricePerKm(formData.fare_empty),
          price_per_km_half: calculatePricePerKm(formData.fare_half),
          price_per_km_full: calculatePricePerKm(formData.fare_full),
          distance_km: distanceKm 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save route');
      
      navigate('/driver/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <button 
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 mb-6 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route & Fares</h1>
          <p className="text-gray-500">
            Set up your primary route and total fares for the trip.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-mzansi-green" /> Route Details
            </h2>
            <LocationInput 
              label="Departure Location" 
              name="departure" 
              value={formData.departure} 
              onChange={handleChange} 
              onPlaceSelected={(place) => {
                setDeparturePlace(place);
                setFormData(prev => ({ ...prev, departure: place.formatted_address || place.name || '' }));
              }}
              placeholder="e.g. Cape Town CBD" 
              required 
            />
            <LocationInput 
              label="Destination Location" 
              name="destination" 
              value={formData.destination} 
              onChange={handleChange} 
              onPlaceSelected={(place) => {
                setDestinationPlace(place);
                setFormData(prev => ({ ...prev, destination: place.formatted_address || place.name || '' }));
              }}
              placeholder="e.g. Bellville" 
              required 
            />
            {distanceKm && (
              <p className="text-sm text-mzansi-blue font-medium mt-2">
                Calculated Distance: {distanceKm.toFixed(1)} km
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trip Pricing (Total R)</h2>
            <p className="text-sm text-gray-500 mb-4">Enter the total amount you want to earn for this trip based on occupancy.</p>
            
            <div className="space-y-6">
              <div>
                <Input label="1 Person (Empty Taxi) Total Fare" name="fare_empty" value={formData.fare_empty} onChange={handleChange} type="number" placeholder="e.g. 150" required />
                {distanceKm && <p className="text-xs text-mzansi-blue font-medium mt-1 italic">Estimated: R {calculatePricePerKm(formData.fare_empty)} per km</p>}
              </div>
              <div>
                <Input label="Half Full Taxi Total Fare" name="fare_half" value={formData.fare_half} onChange={handleChange} type="number" placeholder="e.g. 300" required />
                {distanceKm && <p className="text-xs text-mzansi-blue font-medium mt-1 italic">Estimated: R {calculatePricePerKm(formData.fare_half)} per km</p>}
              </div>
              <div>
                <Input label="Full Taxi Total Fare" name="fare_full" value={formData.fare_full} onChange={handleChange} type="number" placeholder="e.g. 500" required />
                {distanceKm && <p className="text-xs text-mzansi-blue font-medium mt-1 italic">Estimated: R {calculatePricePerKm(formData.fare_full)} per km</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 pb-8">
            <Button fullWidth size="lg" type="submit">
              Complete Registration
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
