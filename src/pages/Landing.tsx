import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';
import { Car, User } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-mzansi-green relative">
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-mzansi-red"></div>
              <div className="flex-1 bg-mzansi-blue"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[120%] h-4 bg-mzansi-white transform -rotate-45"></div>
                <div className="w-[120%] h-4 bg-mzansi-green transform rotate-45"></div>
                <div className="w-8 h-8 bg-mzansi-yellow rounded-full z-10 border-2 border-mzansi-black"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Mzansi Move</h1>
          <p className="text-gray-500 text-lg">Safe, predictable, and efficient minibus-taxi coordination.</p>
        </div>

        <div className="space-y-4 pt-8">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => navigate('/auth/passenger')}
            className="flex items-center gap-3 text-lg"
          >
            <User className="w-6 h-6" />
            I am a Passenger
          </Button>
          <Button 
            fullWidth 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth/driver')}
            className="flex items-center gap-3 text-lg bg-white"
          >
            <Car className="w-6 h-6" />
            I am a Driver
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
