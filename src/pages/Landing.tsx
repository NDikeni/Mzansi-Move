import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';
import { Binoculars, Truck } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mzansi-black p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div className="space-y-4">
          <div className="mx-auto w-32 h-32 bg-gray-900 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-mzansi-green relative">
            <img src="src/pages/assets/App_icon_no_bg.png" alt="Mzansi Move Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Mzansi Move</h1>
          <p className="text-gray-400 text-lg">Getting Mzansi home</p>
        </div>

        <div className="space-y-4 pt-8">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => navigate('/auth/passenger')}
            className="flex items-center gap-3 text-lg bg-mzansi-green text-white hover:bg-mzansi-green/90"
          >
            <Binoculars className="w-6 h-6" />
            I am a Passenger
          </Button>
          <Button 
            fullWidth 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth/driver')}
            className="flex items-center gap-3 text-lg border-mzansi-yellow text-mzansi-yellow hover:bg-mzansi-yellow/10"
          >
            <Truck className="w-6 h-6" />
            I am a Driver
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
