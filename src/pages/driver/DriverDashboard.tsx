import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { TrendingUp, Clock, ShieldCheck, User, Menu, Navigation } from 'lucide-react';

export default function DriverDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mzansi-black pb-24">
      {/* Header */}
      <div className="bg-mzansi-green text-white p-6 rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">Lethabo</h2>
            </div>
          </div>
          <button className="p-2 bg-white/10 rounded-full">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-mzansi-yellow" />
              <span className="text-sm text-white/80">Driving Score</span>
            </div>
            <p className="text-2xl font-bold">92%</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-mzansi-yellow" />
              <span className="text-sm text-white/80">Weekly Earnings</span>
            </div>
            <p className="text-2xl font-bold">R 4,250</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4 relative z-10">
        {/* Main Action */}
        <Card className="p-6 shadow-lg border-0 bg-gray-900">
          <h3 className="text-lg font-bold text-white mb-4">Ready to drive?</h3>
          <Button 
            fullWidth 
            size="lg" 
            className="text-lg h-16 shadow-md shadow-mzansi-green/20"
            onClick={() => navigate('/driver/active-trip')}
          >
            <Navigation className="w-6 h-6 mr-2" />
            Start New Trip
          </Button>
        </Card>

        {/* AI Insights */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white px-1">AI Insights</h3>
          <Card className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400 mt-1">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Peak Hours Approaching</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Demand is expected to rise in Bellville in 30 mins. Head there for higher fares.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scheduled Trips */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-white">Scheduled Trips</h3>
            <button className="text-sm text-mzansi-green font-medium">View All</button>
          </div>
          <Card className="p-4 bg-gray-900 border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Cape Town CBD</p>
                  <p className="text-sm text-gray-400">Tomorrow, 06:30 AM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-mzansi-green">12/15</p>
                <p className="text-xs text-gray-400">Seats booked</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
