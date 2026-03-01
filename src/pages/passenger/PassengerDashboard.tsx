import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { LocationInput } from '@/src/components/ui/LocationInput';
import { MapPin, Search, Clock, Star, User, History } from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [frequentDestinations, setFrequentDestinations] = useState<any[]>([]);
  const passengerName = localStorage.getItem('user_name') || 'Passenger';
  const passengerId = localStorage.getItem('passenger_id');

  useEffect(() => {
    // Check if user is already in a trip
    const activePassengerTripId = localStorage.getItem('active_passenger_trip_id');
    if (activePassengerTripId) {
      navigate(`/passenger/trip/${activePassengerTripId}`);
    }
  }, []);

  useEffect(() => {
    if (!passengerId) {
      navigate('/auth/passenger');
      return;
    }

    const fetchFrequentDestinations = async () => {
      try {
        const res = await fetch(`/api/passenger/${passengerId}/frequent-destinations`);
        const data = await res.json();
        if (data.success && data.destinations.length > 0) {
          setFrequentDestinations(data.destinations);
        } else {
          // Fallbacks if no history
          setFrequentDestinations([
            { destination: 'Cape Town CBD' },
            { destination: 'Bellville' }
          ]);
        }
      } catch (err) {
        console.error(err);
        setFrequentDestinations([
          { destination: 'Cape Town CBD' },
          { destination: 'Bellville' }
        ]);
      }
    };

    fetchFrequentDestinations();
  }, [passengerId]);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickup && destination) {
      navigate(`/passenger/search?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-mzansi-red text-white p-6 rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Hello,</p>
              <h2 className="text-xl font-bold">{passengerName}</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mt-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <div className="w-2 h-2 rounded-full bg-white border-2 border-mzansi-yellow" />
            </div>
            <LocationInput
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              onPlaceSelected={(place) => setPickup(place.formatted_address || place.name || '')}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-mzansi-yellow backdrop-blur-md border border-white/20"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <MapPin className="w-5 h-5 text-mzansi-yellow" />
            </div>
            <LocationInput
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onPlaceSelected={(place) => setDestination(place.formatted_address || place.name || '')}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mzansi-yellow shadow-lg"
            />
          </div>
          <Button 
            fullWidth 
            size="lg" 
            type="submit"
            className="bg-mzansi-yellow text-mzansi-red font-bold h-14 rounded-2xl shadow-lg hover:bg-mzansi-yellow/90"
            disabled={!pickup || !destination}
          >
            Find Drivers
          </Button>
        </form>
      </div>

      <div className="p-6 space-y-6 mt-2">
        {/* Past Trips Link */}
        <Card 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-sm"
          onClick={() => navigate('/passenger/past-trips')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mzansi-red/10 rounded-full flex items-center justify-center text-mzansi-red">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Past Trips</h3>
              <p className="text-sm text-gray-500">View your ride history & receipts</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Frequent Destinations</h3>
          <div className="grid grid-cols-2 gap-4">
            {frequentDestinations.map((dest, index) => (
              <Card 
                key={index} 
                className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-sm" 
                onClick={() => {
                  setDestination(dest.destination);
                  // If pickup is empty, maybe set it to current location or a default
                  if (!pickup) setPickup("Current Location");
                }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-red-50 text-mzansi-red' : 'bg-green-50 text-mzansi-green'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center line-clamp-2 px-2">{dest.destination}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
