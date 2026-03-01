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
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    password: '',
    sanco_id: '',
    capacity: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        
        // Store user ID for driver setup
        if (role === 'driver') {
          localStorage.setItem('driver_id', data.userId);
          localStorage.setItem('user_name', formData.name);
          navigate('/auth/driver/setup');
        } else {
          localStorage.setItem('passenger_id', data.userId);
          localStorage.setItem('user_name', formData.name);
          navigate('/passenger/dashboard');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, password: formData.password, role })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        localStorage.setItem('user_name', data.user.name);
        if (role === 'driver') {
          localStorage.setItem('driver_id', data.user.id);
          navigate('/driver/dashboard');
        } else {
          localStorage.setItem('passenger_id', data.user.id);
          navigate('/passenger/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <button 
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 mb-6 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500">
            {isRegistering 
              ? `Register as a ${role} to get started.` 
              : `Sign in to your ${role} account.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}
          
          {isRegistering && (
            <>
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
              <Input label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe123" required />
            </>
          )}
          
          <Input 
            label={isRegistering ? "Phone Number" : "Username"} 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            type={isRegistering ? "tel" : "text"} 
            placeholder={isRegistering ? "082 123 4567" : "e.g. johndoe123"} 
            required 
          />
          <Input label="Password" name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" required />

          {isRegistering && role === 'driver' && (
            <>
              <Input label="SANCO ID / Association ID" name="sanco_id" value={formData.sanco_id} onChange={handleChange} placeholder="SNC-12345" required />
              <Input label="Seat Capacity" name="capacity" value={formData.capacity} onChange={handleChange} type="number" placeholder="15" required />
            </>
          )}

          <div className="pt-6">
            <Button fullWidth size="lg" type="submit">
              {isRegistering ? (role === 'driver' ? 'Next' : 'Register') : 'Sign In'}
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
