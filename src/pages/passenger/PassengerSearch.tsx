import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Users, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

export default function PassengerSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pickup = searchParams.get('pickup') || '';
  const destination = searchParams.get('destination') || '';
  
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/passenger/search-trips?origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips);
      } else {
        setError(data.error || 'Failed to find trips');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async (tripId: number) => {
    const passengerId = localStorage.getItem('passenger_id');
    const passengerName = localStorage.getItem('user_name') || 'Passenger';
    
    if (!passengerId) {
      navigate('/auth/passenger');
      return;
    }

    try {
      const res = await fetch('/api/passenger/trip/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_id: passengerId,
          trip_id: tripId,
          passenger_name: passengerName,
          pickup_location: pickup,
          destination: destination
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('active_passenger_trip_id', data.passenger_trip_id);
        navigate(`/passenger/trip/${data.passenger_trip_id}`);
      } else {
        setError(data.error || 'Failed to join trip');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Available Drivers</h1>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{destination}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-mzansi-red animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding nearby drivers...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
            {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No drivers found</h3>
            <p className="text-gray-500 text-sm px-10">We couldn't find any drivers heading your way right now. Try again in a few minutes.</p>
            <Button variant="outline" className="mt-6" onClick={fetchTrips}>Retry Search</Button>
          </div>
        ) : (
          trips.map((trip) => (
            <motion.div
              key={trip.trip_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-mzansi-red/10 rounded-full flex items-center justify-center text-mzansi-red font-bold text-lg">
                      {trip.driver_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{trip.driver_name}</h3>
                      <div className="flex items-center gap-1 text-mzansi-yellow">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold text-gray-600">{trip.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Est. Fare</p>
                    <p className="text-lg font-black text-mzansi-red">
                      R {(() => {
                        try {
                          const fares = JSON.parse(trip.fares_json);
                          const nextCount = trip.passenger_count + 1;
                          const counts = Object.keys(fares).map(Number).sort((a, b) => a - b);
                          const bestCount = counts.find(c => c >= nextCount) || counts[counts.length - 1];
                          return fares[bestCount] || '15.00';
                        } catch (e) {
                          return '15.00';
                        }
                      })()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-mzansi-red" />
                    <span className="truncate">Route: {trip.departure} → {trip.route_destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-mzansi-red" />
                    <span>Seats: {trip.passenger_count} / {trip.capacity} filled</span>
                  </div>
                </div>

                <Button fullWidth onClick={() => handleJoinTrip(trip.trip_id)}>
                  Join Trip
                </Button>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
