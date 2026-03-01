import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { ArrowLeft, Users, Clock, ShieldCheck } from 'lucide-react';

export default function PassengerSearch() {
  const navigate = useNavigate();

  const taxis = [
    {
      id: 1,
      driver: 'Lethabo',
      score: 92,
      eta: '5 mins',
      fare: 'R 25',
      occupancy: '12/15',
      status: 'On Route',
      color: 'border-mzansi-green'
    },
    {
      id: 2,
      driver: 'Matthew',
      score: 85,
      eta: '12 mins',
      fare: 'R 20',
      occupancy: '4/15',
      status: 'Empty Pricing',
      color: 'border-mzansi-yellow'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Choose a Taxi</h1>
          <p className="text-sm text-gray-500">Heading to Cape Town CBD</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {taxis.map((taxi, index) => (
          <motion.div
            key={taxi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-5 border-l-4 ${taxi.color} hover:shadow-md transition-shadow cursor-pointer`} onClick={() => navigate('/passenger/active-trip')}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{taxi.driver}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      {taxi.score}% Safety
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {taxi.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-gray-900">{taxi.fare}</p>
                  <p className="text-xs text-gray-500">Cash only</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-mzansi-blue" />
                  <span className="font-medium">{taxi.eta} away</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-mzansi-blue" />
                  <span className="font-medium">{taxi.occupancy} seats</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
