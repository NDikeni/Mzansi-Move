import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function DriverRouteSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    fare_empty: '',
    fare_half: '',
    fare_full: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const driver_id = localStorage.getItem('driver_id');
    if (!driver_id) {
      setError('Driver ID not found. Please register again.');
      return;
    }

    try {
      const res = await fetch('/api/driver/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, driver_id })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save route');
      
      navigate('/driver/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-mzansi-black p-6 flex flex-col">
      <button 
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-gray-400 mb-6 hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Route & Fares</h1>
          <p className="text-gray-400">
            Set up your primary route and pricing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-mzansi-green" /> Route Details
            </h2>
            <Input label="Departure Location" name="departure" value={formData.departure} onChange={handleChange} placeholder="e.g. Cape Town CBD" required />
            <Input label="Destination Location" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g. Bellville" required />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-800">
            <h2 className="text-lg font-semibold text-white">Fare Pricing (R)</h2>
            <p className="text-sm text-gray-400 mb-4">How much do you charge for this route based on capacity?</p>
            
            <Input label="1 Person (Empty Taxi)" name="fare_empty" value={formData.fare_empty} onChange={handleChange} type="number" placeholder="e.g. 150" required />
            <Input label="Half Full Taxi" name="fare_half" value={formData.fare_half} onChange={handleChange} type="number" placeholder="e.g. 50" required />
            <Input label="Full Taxi" name="fare_full" value={formData.fare_full} onChange={handleChange} type="number" placeholder="e.g. 25" required />
          </div>

          <div className="pt-6 pb-8">
            <Button fullWidth size="lg" type="submit">
              Complete Registration
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
