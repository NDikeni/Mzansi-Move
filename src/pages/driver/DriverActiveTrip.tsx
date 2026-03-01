/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { MapPin, Users, Settings2, X, Check, Navigation, AlertTriangle, Loader2, ArrowLeft, UserPlus, Compass, Volume2 } from 'lucide-react';
import { useJsApiLoader, GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const libraries: ("places")[] = ['places'];

export default function DriverActiveTrip() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [capacity, setCapacity] = useState(15);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocationStr, setCurrentLocationStr] = useState<string>('');
  const [optimizedDestinations, setOptimizedDestinations] = useState<string[]>([]);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  const [heading, setHeading] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentStep, setCurrentStep] = useState<google.maps.DirectionsStep | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  useEffect(() => {
    fetchTripData();
    
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          
          // Send location to server
          const driver_id = localStorage.getItem('driver_id');
          if (driver_id) {
            fetch('/api/driver/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ driver_id, lat, lng })
            }).catch(err => console.error("Location update failed", err));
          }
          
          if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
            setHeading(position.coords.heading);
          }
          
          if (isNavigatingRef.current && mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
              mapRef.current.setHeading(position.coords.heading);
            }
          }
          
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                setCurrentLocationStr(results[0].formatted_address);
              } else {
                setCurrentLocationStr(`${lat}, ${lng}`);
              }
            });
          }
        },
        (err) => {
          console.error(err);
          if (!currentLocation) {
            setCurrentLocation({ lat: -33.9249, lng: 18.4241 });
            setCurrentLocationStr("Cape Town CBD, South Africa");
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    
    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchTripData = async () => {
    try {
      const driver_id = localStorage.getItem('driver_id');
      if (!driver_id) {
        navigate('/auth/driver');
        return;
      }
      const res = await fetch(`/api/driver/trip/current/${driver_id}`);
      const data = await res.json();
      if (data.success) {
        setTrip(data.trip);
        // Sort by queue_number from DB
        const sortedPassengers = (data.passengers || []).sort((a: any, b: any) => (a.queue_number || 99) - (b.queue_number || 99));
        setPassengers(sortedPassengers);
        setCapacity(data.capacity);
        
        // Derive optimized destinations from DB queue_number
        const uniqueDests = Array.from(new Set(sortedPassengers.map((p: any) => p.destination)));
        setOptimizedDestinations(uniqueDests);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear directions when destinations change to force recalculation
    setDirectionsResponse(null);
  }, [optimizedDestinations]);

  const directionsCallback = useCallback((response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (response !== null && status === 'OK') {
      setDirectionsResponse(response);
      const firstStep = response.routes[0]?.legs[0]?.steps[0];
      if (firstStep) {
        setCurrentStep(firstStep);
        setCurrentInstruction(firstStep.instructions.replace(/<[^>]*>?/gm, ''));
      }
    } else {
      console.error('Directions request failed', status);
    }
  }, []);

  const speakInstruction = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    isNavigatingRef.current = true;
    setIsExpanded(false);
    if (mapRef.current && currentLocation) {
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(19);
      mapRef.current.setTilt(60);
    }
    if (currentInstruction) {
      speakInstruction(`Starting route. ${currentInstruction}`);
    } else {
      speakInstruction("Starting route.");
    }
  };

  const handleEndTrip = async () => {
    if (!trip) return;
    try {
      // Generate a random driving score between 80 and 100 for demo purposes
      const score = Math.floor(Math.random() * 21) + 80;
      await fetch(`/api/trip/${trip.id}/complete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driving_score: score })
      });
      navigate('/driver/dashboard');
    } catch (err) {
      console.error("Failed to end trip", err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-mzansi-green animate-spin mb-4" />
        <p className="text-gray-600 font-medium">
          {optimizing ? "AI is optimizing your route..." : "Loading trip data..."}
        </p>
      </div>
    );
  }

  const endDestination = optimizedDestinations.length > 0 ? optimizedDestinations[optimizedDestinations.length - 1] : '';
  const waypoints = optimizedDestinations.slice(0, -1).map(dest => ({
    location: dest,
    stopover: true
  }));

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden relative">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        {currentLocation && endDestination && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={currentLocation}
            zoom={isNavigating ? 19 : 13}
            tilt={isNavigating ? 60 : 0}
            heading={isNavigating ? heading : 0}
            options={{ 
              disableDefaultUI: true, 
              zoomControl: false,
              gestureHandling: 'greedy' 
            }}
            onLoad={(map) => { mapRef.current = map; }}
            onDragStart={() => {
              setIsNavigating(false);
              isNavigatingRef.current = false;
            }}
          >
            {/* Directions Service to calculate route */}
            {!directionsResponse && (
              <DirectionsService
                options={{
                  origin: currentLocation,
                  destination: endDestination,
                  waypoints: waypoints,
                  travelMode: google.maps.TravelMode.DRIVING,
                  optimizeWaypoints: false // We already optimized with AI!
                }}
                callback={directionsCallback}
              />
            )}

            {/* Render the route */}
            {directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                  polylineOptions: { 
                    strokeColor: '#10B981', // Mzansi Green
                    strokeWeight: 8,
                    strokeOpacity: 0.8,
                    zIndex: 10
                  },
                  suppressMarkers: false
                }}
              />
            )}

            {/* Car Marker */}
            {currentLocation && isNavigating && window.google && (
              <Marker
                position={currentLocation}
                icon={{
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                  scale: 6,
                  rotation: heading || 0,
                }}
                zIndex={999}
              />
            )}
          </GoogleMap>
        )}
      </div>

      {/* Top Navigation Banner */}
      <AnimatePresence>
        {isNavigating && currentStep && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            className="absolute top-0 left-0 right-0 z-40 bg-mzansi-green text-white p-6 pt-12 shadow-2xl rounded-b-3xl flex items-start gap-4"
          >
            <div className="mt-1 bg-white/20 p-2 rounded-full">
              <Navigation className="w-8 h-8 text-white" style={{ transform: `rotate(${heading}deg)` }} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: currentStep.instructions }} />
              <p className="text-white/90 text-lg mt-1 font-medium">
                {currentStep.distance?.text}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => speakInstruction(currentInstruction)}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 pointer-events-auto"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  setIsNavigating(false);
                  isNavigatingRef.current = false;
                }}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 pointer-events-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Top Controls */}
      <AnimatePresence>
        {!isNavigating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none"
          >
            <button onClick={() => navigate('/driver/trip-setup')} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 pointer-events-auto hover:bg-gray-50">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col gap-3 pointer-events-auto">
              <button onClick={() => navigate('/driver/trip-setup')} className="w-12 h-12 bg-mzansi-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-mzansi-blue/90">
                <UserPlus className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigation Button (Start / Recenter) */}
      <motion.div 
        className="absolute right-4 z-20 pointer-events-auto flex flex-col items-end gap-3" 
        animate={{ top: isExpanded ? 'calc(15vh - 80px)' : 'calc(80vh - 80px)' }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      >
        {isNavigating ? (
          <button 
            onClick={() => {
              setIsNavigating(true);
              isNavigatingRef.current = true;
              if (mapRef.current && currentLocation) {
                mapRef.current.panTo(currentLocation);
                mapRef.current.setZoom(19);
                mapRef.current.setTilt(60);
                if (heading) mapRef.current.setHeading(heading);
              }
            }}
            className="w-14 h-14 bg-white text-mzansi-green rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <Compass className="w-7 h-7" />
          </button>
        ) : (
          <Button 
            onClick={handleStartNavigation}
            className="bg-mzansi-green text-white rounded-full px-6 py-4 shadow-xl flex items-center gap-2 text-lg font-bold"
          >
            <Navigation className="w-6 h-6" /> Start
          </Button>
        )}
      </motion.div>

      {/* Draggable Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 50 || info.velocity.y > 20) {
            setIsExpanded(false);
          } else if (info.offset.y < -50 || info.velocity.y < -20) {
            setIsExpanded(true);
          }
        }}
        animate={{ y: isExpanded ? '15vh' : '80vh' }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col"
        style={{ height: '85vh' }}
      >
        {/* Drag Handle */}
        <div className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Trip Status</h3>
              <p className="text-gray-500 text-sm">
                {isNavigating ? 'Navigating to drop-offs' : 'On route to drop-offs'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-900">{passengers.length}</span>
              <span className="text-gray-400">/ {capacity}</span>
            </div>
          </div>

          {/* Capacity Warning */}
          {passengers.length >= capacity - 2 && (
            <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <p>Nearing capacity. Only {capacity - passengers.length} seats left.</p>
            </div>
          )}

          {/* Destination Info */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-mzansi-green/10 rounded-full flex items-center justify-center text-mzansi-green shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-gray-900 truncate">
                {endDestination || 'Calculating Route...'}
              </h2>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              {directionsResponse?.routes[0]?.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) 
                ? `${Math.round(directionsResponse.routes[0].legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) / 60)} mins to final stop` 
                : 'AI Optimized Route'}
            </p>
          </div>

          {/* Stops */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-900 text-sm">Optimized Stops ({optimizedDestinations.length})</h4>
            {optimizedDestinations.map((dest, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-mzansi-blue/10 text-mzansi-blue flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{dest}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dropping off: {passengers.filter(p => p.destination === dest).map(p => p.passenger_name).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="danger" fullWidth size="lg" onClick={handleEndTrip} className="mt-auto mb-4">
            End Trip
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
