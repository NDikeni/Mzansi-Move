import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { MapPin, Search, Clock, Star, User } from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination) {
      navigate('/passenger/search');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-mzansi-blue text-white p-6 rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Hello,</p>
              <h2 className="text-xl font-bold">Thando</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative mt-2">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mzansi-yellow shadow-lg"
          />
        </form>
      </div>

      <div className="p-6 space-y-6 mt-2">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setDestination('Cape Town CBD')}>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-mzansi-blue">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">CBD</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setDestination('Bellville')}>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-mzansi-green">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Bellville</span>
          </Card>
        </div>

        {/* Past Trips */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 px-1">Recent Trips</h3>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/passenger/rating')}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Rondebosch</p>
                  <p className="text-sm text-gray-500">Yesterday, 17:30</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-mzansi-yellow">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-gray-700">4.8</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dunoon</p>
                  <p className="text-sm text-gray-500">Mon, 08:15</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-mzansi-yellow">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-gray-700">4.5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
