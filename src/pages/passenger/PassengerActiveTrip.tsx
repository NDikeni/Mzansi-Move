import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { MapPin, ShieldCheck, Phone, User } from 'lucide-react';

export default function PassengerActiveTrip() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'waiting' | 'picked_up'>('waiting');

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden relative">
      {/* Mock Map Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/passenger-map/800/1200?blur=1" 
          alt="Map" 
          className="w-full h-full object-cover opacity-70"
          referrerPolicy="no-referrer"
        />
        {/* Route overlay mock */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-mzansi-blue/20 rounded-full animate-ping absolute"></div>
          <div className="w-4 h-4 bg-mzansi-blue rounded-full border-2 border-white relative z-10 shadow-lg"></div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mzansi-blue/10 rounded-full flex items-center justify-center text-mzansi-blue">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Driver: Lethabo</h2>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ShieldCheck className="w-3 h-3" /> 92% Safety Score
            </div>
          </div>
        </div>
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* Queue Position (if waiting) */}
      {status === 'waiting' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-4 mt-4"
        >
          <Card className="p-4 bg-mzansi-yellow/10 border-mzansi-yellow text-center">
            <p className="text-sm font-medium text-gray-700">Your Queue Position</p>
            <p className="text-3xl font-black text-gray-900 my-1">#2</p>
            <p className="text-xs text-gray-500">Driver is dropping off #1 nearby</p>
          </Card>
        </motion.div>
      )}

      {/* Bottom Controls */}
      <div className="mt-auto relative z-10 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 pb-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {status === 'waiting' ? 'Lethabo is on his way' : 'Heading to destination'}
          </h3>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" /> 
            {status === 'waiting' ? 'ETA: 5 mins' : 'ETA: 45 mins to CBD'}
          </p>
        </div>

        <div className="space-y-3">
          {status === 'waiting' ? (
            <Button 
              fullWidth 
              size="lg" 
              className="h-14 bg-mzansi-blue hover:bg-mzansi-blue/90"
              onClick={() => setStatus('picked_up')}
            >
              I've been picked up
            </Button>
          ) : (
            <Button 
              fullWidth 
              size="lg" 
              className="h-14 bg-mzansi-green hover:bg-mzansi-green/90"
              onClick={() => navigate('/passenger/rating')}
            >
              I've been dropped off
            </Button>
          )}
          
          <Button variant="ghost" fullWidth className="text-mzansi-red hover:text-mzansi-red hover:bg-red-50">
            Cancel Request
          </Button>
        </div>
      </div>
    </div>
  );
}
