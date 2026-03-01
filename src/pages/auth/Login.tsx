import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (role === 'driver') {
      navigate('/driver/dashboard');
    } else {
      navigate('/passenger/dashboard');
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 capitalize">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isRegistering 
              ? `Register as a ${role} to get started.` 
              : `Sign in to your ${role} account.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          {isRegistering && (
            <>
              <Input label="Full Name" placeholder="John Doe" required />
              <Input label="Username" placeholder="johndoe123" required />
            </>
          )}
          
          <Input label="Phone Number" type="tel" placeholder="082 123 4567" required />
          <Input label="Password" type="password" placeholder="••••••••" required />

          {isRegistering && role === 'driver' && (
            <>
              <Input label="SANCO ID / Association ID" placeholder="SNC-12345" required />
              <Input label="Seat Capacity" type="number" placeholder="15" required />
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-300 mb-2">Set your fares (R)</p>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Empty" type="number" required />
                  <Input placeholder="Half" type="number" required />
                  <Input placeholder="Full" type="number" required />
                </div>
              </div>
            </>
          )}

          <div className="pt-6">
            <Button fullWidth size="lg" type="submit">
              {isRegistering ? 'Register' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-mzansi-green font-medium hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
