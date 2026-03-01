import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mic, MicOff, Plus, Users, Navigation } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { LocationInput } from '@/src/components/ui/LocationInput';

export default function DriverTripSetup() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [capacity, setCapacity] = useState(15);
  const [isListening, setIsListening] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDestination, setManualDestination] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingVoice, setProcessingVoice] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchTripData();
    const interval = setInterval(fetchTripData, 3000); // Poll every 3 seconds
    
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-ZA';

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        await processVoiceInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError('Could not hear you clearly. Please try again.');
      };

      recognitionRef.current = recognition;
    }

    return () => clearInterval(interval);
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
        setPassengers(data.passengers);
        setCapacity(data.capacity);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processVoiceInput = async (text: string) => {
    setProcessingVoice(true);
    setError('');
    try {
      const res = await fetch('/api/ai/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      
      if (data.success && data.data.name && data.data.destination) {
        await addPassenger(data.data.name, data.data.destination);
      } else {
        setError("Couldn't understand the name or destination. Please try again or enter manually.");
      }
    } catch (err: any) {
      setError("Failed to process voice input.");
    } finally {
      setProcessingVoice(false);
    }
  };

  const addPassenger = async (name: string, destination: string) => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trip/${trip.id}/passenger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passenger_name: name, destination })
      });
      const data = await res.json();
      if (data.success) {
        setManualName('');
        setManualDestination('');
        fetchTripData(); // Refresh list
      }
    } catch (err: any) {
      setError("Failed to add passenger.");
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualName && manualDestination) {
      addPassenger(manualName, manualDestination);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleCalculateFares = async () => {
    if (!trip) return;
    try {
      await fetch(`/api/trip/${trip.id}/calculate-fares`, { method: 'POST' });
      fetchTripData(); // Refresh list to show fares
    } catch (err: any) {
      setError("Failed to calculate fares.");
    }
  };

  const handleStartTrip = async () => {
    if (!trip) return;
    try {
      await fetch(`/api/trip/${trip.id}/start`, { method: 'POST' });
      navigate('/driver/active-trip');
    } catch (err: any) {
      setError("Failed to start trip.");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Gathering Passengers</h1>
        <div className="flex items-center gap-2 bg-mzansi-green/10 px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-mzansi-green" />
          <span className="font-bold text-mzansi-green">{passengers.length}/{capacity}</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-32">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

        {/* Voice Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Voice Add</h2>
          <p className="text-sm text-gray-500 mb-6">Tap the mic and say: "Add [Name] going to [Destination]"</p>
          
          <button 
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
              isListening 
                ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' 
                : 'bg-mzansi-green text-white shadow-lg hover:bg-mzansi-green/90'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </button>
          
          {processingVoice && <p className="text-sm text-mzansi-blue mt-4 animate-pulse">Processing voice...</p>}
          {isListening && <p className="text-sm text-red-500 mt-4">Listening...</p>}
        </div>

        {/* Manual Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Manual Add</h2>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <Input 
              label="Passenger Name" 
              value={manualName} 
              onChange={(e) => setManualName(e.target.value)} 
              placeholder="e.g. Sipho" 
            />
            <LocationInput 
              label="Destination" 
              value={manualDestination} 
              onChange={(e) => setManualDestination(e.target.value)} 
              onPlaceSelected={(place) => setManualDestination(place.formatted_address || place.name || '')}
              placeholder="e.g. Cape Town CBD" 
            />
            <Button type="submit" fullWidth variant="outline" className="border-mzansi-green text-mzansi-green hover:bg-mzansi-green/5">
              <Plus className="w-5 h-5 mr-2" /> Add Passenger
            </Button>
          </form>
        </div>

        {/* Passenger List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Current Passengers ({passengers.length})</h2>
          {passengers.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">No passengers added yet.</p>
          ) : (
            <div className="space-y-3">
              {passengers.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-900">{p.passenger_name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">{p.destination}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.fare && <span className="font-bold text-gray-900">R {p.fare}</span>}
                    <span className="text-xs font-medium px-2 py-1 bg-mzansi-yellow/20 text-yellow-800 rounded-md capitalize">
                      {p.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20">
        <Button 
          fullWidth 
          variant="outline" 
          className="mb-3 border-mzansi-yellow text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
          onClick={handleCalculateFares}
          disabled={passengers.length === 0}
        >
          Calculate Fares
        </Button>
        <Button 
          fullWidth 
          size="lg" 
          className="h-14 text-lg shadow-lg shadow-mzansi-blue/20 bg-mzansi-blue hover:bg-mzansi-blue/90"
          onClick={handleStartTrip}
          disabled={passengers.length === 0}
        >
          <Navigation className="w-5 h-5 mr-2" />
          Start Trip
        </Button>
      </div>
    </div>
  );
}
