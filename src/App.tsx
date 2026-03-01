import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import DriverRouteSetup from './pages/auth/DriverRouteSetup';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverTripSetup from './pages/driver/DriverTripSetup';
import DriverActiveTrip from './pages/driver/DriverActiveTrip';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import PassengerSearch from './pages/passenger/PassengerSearch';
import PassengerTripTracking from './pages/passenger/PassengerTripTracking';
import PassengerPastTrips from './pages/passenger/PassengerPastTrips';
import DebugDatabase from './pages/DebugDatabase';

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden text-gray-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/:role" element={<Login />} />
          <Route path="/auth/driver/setup" element={<DriverRouteSetup />} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/trip-setup" element={<DriverTripSetup />} />
          <Route path="/driver/active-trip" element={<DriverActiveTrip />} />
          
          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
          <Route path="/passenger/past-trips" element={<PassengerPastTrips />} />
          <Route path="/passenger/search" element={<PassengerSearch />} />
          <Route path="/passenger/trip/:passengerTripId" element={<PassengerTripTracking />} />
          
          {/* Debug Route */}
          <Route path="/debug" element={<DebugDatabase />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
