import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Users, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

export default function DriverPastTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const driverId = localStorage.getItem('driver_id');

  useEffect(() => {
    if (!driverId) {
      navigate('/auth/driver');
      return;
    }

    fetch(`/api/driver/${driverId}/past-trips`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrips(data.trips);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [driverId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Past Trips</h1>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-mzansi-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No past trips</h3>
            <p className="text-gray-500 text-sm px-10">Your completed trips will appear here.</p>
          </div>
        ) : (
          trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(trip.created_at).toLocaleDateString('en-ZA', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Earnings</p>
                    <p className="text-lg font-black text-mzansi-green">R {trip.total_earnings?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-mzansi-blue" />
                    <span>{trip.passenger_count} Passengers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-mzansi-green" />
                    <span>Score: {trip.driving_score || 'N/A'}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
