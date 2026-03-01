import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { MapPin, Users, Settings2, X, Check, Navigation, AlertTriangle } from 'lucide-react';

export default function DriverActiveTrip() {
  const navigate = useNavigate();
  const [pickupMode, setPickupMode] = useState<'automatic' | 'manual'>('automatic');
  const [passengers, setPassengers] = useState(4);
  const capacity = 15;
  const [incomingRequest, setIncomingRequest] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-mzansi-black overflow-hidden relative">
      {/* Mock Map Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/map/800/1200?blur=2" 
          alt="Map" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        {/* Route overlay mock */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-mzansi-blue border-dashed rounded-full opacity-50 animate-spin-slow"></div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 bg-gray-900/90 backdrop-blur-md p-4 shadow-sm flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mzansi-green/20 rounded-full flex items-center justify-center text-mzansi-green">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">Cape Town CBD</h2>
            <p className="text-xs text-gray-400">ETA: 45 mins • 12km</p>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => navigate('/driver/dashboard')}>
          End Trip
        </Button>
      </div>

      {/* Incoming Request Overlay */}
      <AnimatePresence>
        {incomingRequest && pickupMode === 'manual' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 mx-4 mt-4"
          >
            <Card className="p-4 border-l-4 border-l-mzansi-yellow shadow-lg bg-gray-900 border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white">New Passenger Request</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> +2 mins off route
                  </p>
                </div>
                <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md font-medium">
                  Queue #5
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-mzansi-red text-mzansi-red hover:bg-mzansi-red/10"
                  onClick={() => setIncomingRequest(false)}
                >
                  <X className="w-4 h-4 mr-1" /> Decline
                </Button>
                <Button 
                  className="flex-1 bg-mzansi-green"
                  onClick={() => {
                    setPassengers(p => p + 1);
                    setIncomingRequest(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="mt-auto relative z-10 bg-gray-900 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.5)] p-6 pb-8 border-t border-gray-800">
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Trip Status</h3>
            <p className="text-gray-400 text-sm">On route to destination</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-white">{passengers}</span>
            <span className="text-gray-500">/ {capacity}</span>
          </div>
        </div>

        {/* Capacity Warning */}
        {passengers >= capacity - 2 && (
          <div className="mb-4 bg-orange-900/30 border border-orange-800/50 text-orange-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <p>Nearing capacity. Only {capacity - passengers} seats left.</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-gray-300">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white">Pickup Mode</p>
                <p className="text-xs text-gray-400">
                  {pickupMode === 'automatic' ? 'Auto-accepting nearby (<30m delay)' : 'Manual approval required'}
                </p>
              </div>
            </div>
            
            {/* Custom Toggle */}
            <button 
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${pickupMode === 'automatic' ? 'bg-mzansi-green' : 'bg-gray-600'}`}
              onClick={() => {
                setPickupMode(m => m === 'automatic' ? 'manual' : 'automatic');
                if (pickupMode === 'automatic') setIncomingRequest(true); // show mock request when switching to manual
              }}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${pickupMode === 'automatic' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14">
              View Queue
            </Button>
            <Button variant="secondary" className="h-14">
              Add Stop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
