import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Star, ShieldCheck } from 'lucide-react';

export default function PassengerRating() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const tags = ['Safe Driving', 'On Time', 'Clean', 'Overloaded', 'Reckless'];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-mzansi-green mb-4">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Completed</h1>
          <p className="text-gray-500">How was your ride with Lethabo?</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating) 
                    ? 'fill-mzansi-yellow text-mzansi-yellow' 
                    : 'text-gray-300'
                } transition-colors`} 
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-4"
          >
            <p className="text-sm font-medium text-gray-700 text-left">What went well or wrong?</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-mzansi-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="pt-8">
          <Button 
            fullWidth 
            size="lg" 
            disabled={rating === 0}
            onClick={() => navigate('/passenger/dashboard')}
          >
            Submit Rating
          </Button>
          <Button 
            variant="ghost" 
            fullWidth 
            className="mt-2"
            onClick={() => navigate('/passenger/dashboard')}
          >
            Skip
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
