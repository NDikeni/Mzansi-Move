import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';
import { Binoculars, Truck } from 'lucide-react';

import miniBusIcon from './assets/Mini-bus.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 relative overflow-hidden">
      {/* Vibrant Abstract SA Flag Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Red Top Blob */}
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-mzansi-red/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-80 transform rotate-12"></div>
        {/* Blue Bottom Blob */}
        <div className="absolute -bottom-32 -right-10 w-[500px] h-[500px] bg-mzansi-blue/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-80"></div>
        {/* Green Center/Diagonal Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-mzansi-green/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-80 transform -rotate-12"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm space-y-8 text-center"
      >
        <div className="space-y-2">
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center mb-4">
            {/* Curved Text SVG */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                <path id="top-arc" d="M 50, 210 A 150, 150 0 0, 1 350, 210" fill="transparent" />
                <path id="bottom-arc" d="M 40, 200 A 160, 160 0 0, 0 360, 200" fill="transparent" />
              </defs>
              <text 
                className="text-[56px] font-bold tracking-[0.1em]" 
                style={{ fontFamily: "'Space Mono', monospace", fill: "#000000", stroke: "none" }}
              >
                <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
                  Mzansi
                </textPath>
              </text>
              <text 
                className="text-[56px] font-bold tracking-[0.1em]" 
                style={{ fontFamily: "'Space Mono', monospace", fill: "#000000", stroke: "none" }}
              >
                <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
                  Move
                </textPath>
              </text>
            </svg>
            
            {/* Center Image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src={miniBusIcon} 
                alt="Mzansi Mini Bus" 
                className="w-44 h-44 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Getting Mzansi home &#x1f1ff;&#x1f1e6;</p>
        </div>

        <div className="space-y-4 pt-8">
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => navigate('/auth/passenger')}
            className="flex items-center gap-3 text-lg bg-mzansi-yellow border-2 border-mzansi-yellow text-mzansi-yellow hover:bg-mzansi-red/5 bg-white shadow-sm"
          >
            <Binoculars className="w-6 h-6" />
            Passenger
          </Button>
          <Button 
            fullWidth 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth/driver')}
            className="flex items-center gap-3 text-lg border-2 border-mzansi-red text-mzansi-red hover:bg-mzansi-red/5 bg-white shadow-sm"
          >
            <Truck className="w-6 h-6" />
            Driver
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
