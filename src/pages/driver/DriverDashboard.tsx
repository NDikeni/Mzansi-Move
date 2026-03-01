import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { TrendingUp, Clock, ShieldCheck, User, Menu, Navigation } from 'lucide-react';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const driverName = localStorage.getItem('user_name') || 'Driver';
  const driverId = localStorage.getItem('driver_id');
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>(null);

  useEffect(() => {
    if (driverId) {
      fetch(`/api/driver/trip/current/${driverId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.trip && data.passengers && data.passengers.length > 0) {
            setHasActiveTrip(true);
          }
        })
        .catch(console.error);

      fetch(`/api/driver/${driverId}/profile`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDriverProfile(data.driver);
          }
        })
        .catch(console.error);
    }
  }, [driverId]);

  const handleStartNewTrip = async () => {
    if (driverId) {
      await fetch(`/api/driver/trip/new/${driverId}`, { method: 'POST' });
    }
    navigate('/driver/trip-setup');
  };

  const handleResumeTrip = () => {
    navigate('/driver/trip-setup');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-mzansi-green text-white p-6 rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">{driverName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              <p className="text-[10px] uppercase font-bold text-white/70">Driving Score</p>
              <p className="text-sm font-bold">{driverProfile?.driving_score?.toFixed(1) || '100.0'}%</p>
            </div>
            <button className="p-2 bg-white/10 rounded-full">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4 relative z-10">
        {/* Main Action */}
        <Card className="p-6 shadow-lg border-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ready to drive?</h3>
          <div className="space-y-3">
            {hasActiveTrip && (
              <Button 
                fullWidth 
                size="lg" 
                variant="outline"
                className="text-lg h-16 border-mzansi-blue text-mzansi-blue"
                onClick={handleResumeTrip}
              >
                <Navigation className="w-6 h-6 mr-2" />
                Resume Current Trip
              </Button>
            )}
            <Button 
              fullWidth 
              size="lg" 
              className="text-lg h-16 shadow-md shadow-mzansi-green/20"
              onClick={handleStartNewTrip}
            >
              <Navigation className="w-6 h-6 mr-2" />
              Start New Trip
            </Button>
            <Button 
              fullWidth 
              variant="outline"
              className="mt-2"
              onClick={() => navigate('/driver/past-trips')}
            >
              <Clock className="w-5 h-5 mr-2" />
              View Past Trips
            </Button>
          </div>
        </Card>

        {/* AI Insights */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 px-1">AI Insights</h3>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Peak Hours Approaching</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Demand is expected to rise in Bellville in 30 mins. Head there for higher fares.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
