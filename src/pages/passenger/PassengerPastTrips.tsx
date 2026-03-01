import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Calendar, Loader2 } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';

export default function PassengerPastTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastTrips = async () => {
      try {
        const passengerId = localStorage.getItem('passenger_id'); 
        if (!passengerId) {
          navigate('/auth/passenger');
          return;
        }
        const res = await fetch(`/api/passenger/${passengerId}/past-trips`);
        const data = await res.json();
        if (data.success) {
          setTrips(data.trips);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPastTrips();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Past Trips</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-mzansi-blue animate-spin mb-4" />
            <p className="text-gray-500">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No past trips yet</h3>
            <p className="text-gray-500 mt-2">When you take a ride, it will appear here.</p>
          </div>
        ) : (
          trips.map((trip, index) => (
            <Card key={index} className="p-4 bg-white shadow-sm border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.created_at).toLocaleDateString('en-ZA', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="font-bold text-lg text-gray-900">
                  R {trip.fare?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="relative pl-6 space-y-4 mb-4">
                <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-gray-200"></div>
                
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 bg-mzansi-blue rounded-full border-2 border-white shadow-sm"></div>
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="font-semibold text-gray-900">{trip.pickup_location || 'Unknown Location'}</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 bg-mzansi-green rounded-full border-2 border-white shadow-sm"></div>
                  <p className="text-sm text-gray-500">Drop-off</p>
                  <p className="font-semibold text-gray-900">{trip.destination}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Driver: <span className="font-semibold text-gray-900">{trip.driver_name}</span>
                </p>
                {trip.passenger_rating && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                    <Star className="w-4 h-4 text-mzansi-yellow fill-mzansi-yellow" />
                    <span className="text-sm font-bold text-yellow-800">{trip.passenger_rating}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
