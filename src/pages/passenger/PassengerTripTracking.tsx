import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, Navigation, Phone, Star, Check, Loader2, X, MessageCircle, Volume2 } from 'lucide-react';
import { useJsApiLoader, GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

const libraries: ("places")[] = ['places'];

export default function PassengerTripTracking() {
  const navigate = useNavigate();
  const { passengerTripId } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  useEffect(() => {
    fetchTripData();
    const interval = setInterval(fetchTripData, 5000); // Poll every 5 seconds for location updates
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (err) => console.error(err)
      );
    }
    
    return () => clearInterval(interval);
  }, [passengerTripId]);

  const fetchTripData = async () => {
    try {
      const res = await fetch(`/api/passenger/trip/${passengerTripId}`);
      const data = await res.json();
      if (data.success) {
        setTrip(data.trip);
        if (data.trip.status === 'dropped_off') {
          setShowReview(true);
        }
      } else {
        setError(data.error || 'Failed to fetch trip data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const res = await fetch(`/api/passenger/trip/${passengerTripId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchTripData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async () => {
    try {
      const res = await fetch(`/api/passenger/trip/${passengerTripId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review_text: reviewText })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('active_passenger_trip_id');
        navigate('/passenger/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-mzansi-red animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Connecting to your trip...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Error</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => navigate('/passenger/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const driverLocation = trip.current_lat && trip.current_lng ? { lat: trip.current_lat, lng: trip.current_lng } : null;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden relative">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={driverLocation || currentLocation || { lat: -33.9249, lng: 18.4241 }}
          zoom={14}
          options={{ disableDefaultUI: true, zoomControl: false }}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {driverLocation && currentLocation && (
            <DirectionsService
              options={{
                origin: driverLocation,
                destination: currentLocation,
                travelMode: google.maps.TravelMode.DRIVING,
              }}
              callback={(response, status) => {
                if (status === 'OK' && response) setDirectionsResponse(response);
              }}
            />
          )}
          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
                polylineOptions: { strokeColor: '#E03C31', strokeWeight: 6 },
                suppressMarkers: true
              }}
            />
          )}
          {driverLocation && (
            <Marker
              position={driverLocation}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                fillColor: '#E03C31',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 6,
                rotation: 0,
              }}
            />
          )}
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#FBBF24',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 6,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Top Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate('/passenger/dashboard')} 
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 pointer-events-auto hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Tracking</span>
        </div>
      </div>

      {/* Bottom Info Card */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-mzansi-red/10 rounded-full flex items-center justify-center text-mzansi-red font-bold text-xl">
              {trip.driver_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{trip.driver_name}</h3>
              <div className="flex items-center gap-1 text-mzansi-yellow">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold text-gray-600">{trip.driver_rating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${trip.driver_phone}`} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
              <Phone className="w-5 h-5" />
            </a>
            <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-mzansi-yellow/10 rounded-full flex items-center justify-center text-mzansi-yellow shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Destination</p>
              <p className="text-sm font-medium text-gray-900">{trip.destination}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Trip Status</p>
              <p className="text-sm font-bold text-mzansi-red capitalize">{trip.status}</p>
            </div>
            {directionsResponse && (
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase font-bold">Arrival</p>
                <p className="text-sm font-bold text-gray-900">
                  {directionsResponse.routes[0].legs[0].duration?.text}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold">Fare</p>
              <p className="text-sm font-bold text-gray-900">R {trip.fare || 'Calculating...'}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {trip.status === 'pinged' && (
            <Button fullWidth onClick={() => handleStatusUpdate('boarded')}>
              <Check className="w-5 h-5 mr-2" /> I've been picked up
            </Button>
          )}
          {trip.status === 'boarded' && (
            <Button fullWidth onClick={() => handleStatusUpdate('dropped_off')}>
              <Check className="w-5 h-5 mr-2" /> I've been dropped off
            </Button>
          )}
        </div>
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-mzansi-green/10 text-mzansi-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Completed!</h2>
              <p className="text-gray-500 mb-8">How was your ride with {trip.driver_name}?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className={`p-2 transition-transform active:scale-90 ${rating >= s ? 'text-mzansi-yellow' : 'text-gray-200'}`}
                  >
                    <Star className={`w-10 h-10 ${rating >= s ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write a review (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mzansi-red mb-6 resize-none h-24"
              />

              <Button fullWidth size="lg" onClick={submitReview}>
                Submit Review
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
