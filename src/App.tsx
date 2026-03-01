import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverActiveTrip from './pages/driver/DriverActiveTrip';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import PassengerSearch from './pages/passenger/PassengerSearch';
import PassengerActiveTrip from './pages/passenger/PassengerActiveTrip';
import PassengerRating from './pages/passenger/PassengerRating';

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/:role" element={<Login />} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/active-trip" element={<DriverActiveTrip />} />
          
          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
          <Route path="/passenger/search" element={<PassengerSearch />} />
          <Route path="/passenger/active-trip" element={<PassengerActiveTrip />} />
          <Route path="/passenger/rating" element={<PassengerRating />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
