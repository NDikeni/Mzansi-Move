import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db.js';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, username, phone, password, role, sanco_id, capacity } = req.body;
    
    try {
      const table = role === 'driver' ? 'drivers' : 'passengers';
      let userId;

      if (role === 'driver') {
        const insertDriver = db.prepare('INSERT INTO drivers (name, username, phone, password, sanco_id, capacity) VALUES (?, ?, ?, ?, ?, ?)');
        const info = insertDriver.run(name, username, phone, password, sanco_id, capacity);
        userId = info.lastInsertRowid;
      } else {
        const insertPassenger = db.prepare('INSERT INTO passengers (name, username, phone, password) VALUES (?, ?, ?, ?)');
        const info = insertPassenger.run(name, username, phone, password);
        userId = info.lastInsertRowid;
      }

      res.json({ success: true, userId });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { phone, password, role } = req.body;
    
    try {
      const table = role === 'driver' ? 'drivers' : 'passengers';
      // Fallback to username if phone isn't used (for dummy data)
      const user = db.prepare(`SELECT * FROM ${table} WHERE (phone = ? OR username = ?) AND password = ?`).get(phone, phone, password);
      
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/driver/route', (req, res) => {
    const { driver_id, departure, destination, price_per_km_empty, price_per_km_half, price_per_km_full, distance_km } = req.body;
    
    try {
      // Get driver capacity
      const driver = db.prepare('SELECT capacity FROM drivers WHERE id = ?').get(driver_id) as { capacity: number } | undefined;
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      const capacity = driver.capacity;
      const fares: Record<number, number> = {};
      
      // Calculate flat fares based on price per KM
      const fare_empty = Math.round(Number(price_per_km_empty) * Number(distance_km));
      const fare_half = Math.round(Number(price_per_km_half) * Number(distance_km));
      const fare_full = Math.round(Number(price_per_km_full) * Number(distance_km));

      // Calculate fare for each occupancy level
      const halfCapacity = Math.ceil(capacity / 2);
      
      for (let i = 1; i <= capacity; i++) {
        if (i === 1) {
          fares[i] = fare_empty;
        } else if (i === halfCapacity) {
          fares[i] = fare_half;
        } else if (i === capacity) {
          fares[i] = fare_full;
        } else if (i < halfCapacity) {
          // Interpolate between empty and half
          const ratio = (i - 1) / (halfCapacity - 1);
          fares[i] = Math.round(fare_empty - (fare_empty - fare_half) * ratio);
        } else {
          // Interpolate between half and full
          const ratio = (i - halfCapacity) / (capacity - halfCapacity);
          fares[i] = Math.round(fare_half - (fare_half - fare_full) * ratio);
        }
      }
      
      const fares_json = JSON.stringify(fares);

      const insertRoute = db.prepare('INSERT INTO routes (driver_id, departure, destination, fare_empty, fare_half, fare_full, price_per_km_empty, price_per_km_half, price_per_km_full, distance_km, fares_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insertRoute.run(driver_id, departure, destination, fare_empty, fare_half, fare_full, price_per_km_empty, price_per_km_half, price_per_km_full, distance_km, fares_json);
      res.json({ success: true, fares });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trip Management
  app.post('/api/driver/trip/new/:driver_id', (req, res) => {
    const { driver_id } = req.params;
    try {
      // Cancel any existing gathering or active trips so we start fresh
      db.prepare("UPDATE driver_trips SET status = 'cancelled' WHERE driver_id = ? AND status IN ('gathering', 'active')").run(driver_id);
      
      const insert = db.prepare("INSERT INTO driver_trips (driver_id, status) VALUES (?, 'gathering')");
      const info = insert.run(driver_id);
      
      res.json({ success: true, trip_id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/driver/trip/current/:driver_id', (req, res) => {
    const { driver_id } = req.params;
    try {
      let trip = db.prepare("SELECT * FROM driver_trips WHERE driver_id = ? AND status IN ('gathering', 'active') ORDER BY id DESC LIMIT 1").get(driver_id) as any;
      
      if (!trip) {
        const insert = db.prepare("INSERT INTO driver_trips (driver_id, status) VALUES (?, 'gathering')");
        const info = insert.run(driver_id);
        trip = { id: info.lastInsertRowid, driver_id, status: 'gathering' };
      }
      
      const passengers = db.prepare("SELECT * FROM passenger_trips WHERE driver_trip_id = ?").all(trip.id);
      const driver = db.prepare("SELECT capacity FROM drivers WHERE id = ?").get(driver_id) as any;
      
      res.json({ success: true, trip, passengers, capacity: driver?.capacity || 15 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to optimize passenger queue using AI
  async function optimizePassengerQueue(tripId: number) {
    try {
      const trip = db.prepare("SELECT * FROM driver_trips WHERE id = ?").get(tripId) as any;
      if (!trip) return;

      const passengers = db.prepare(`
        SELECT id, passenger_name, destination, delay_count, queue_number 
        FROM passenger_trips 
        WHERE driver_trip_id = ? AND status != 'dropped_off'
        ORDER BY queue_number ASC
      `).all(tripId) as any[];

      if (passengers.length <= 1) {
        if (passengers.length === 1) {
          db.prepare("UPDATE passenger_trips SET queue_number = 1 WHERE id = ?").run(passengers[0].id);
        }
        return;
      }

      // Get driver's start location or current route departure
      const route = db.prepare("SELECT departure FROM routes WHERE driver_id = ? ORDER BY id DESC LIMIT 1").get(trip.driver_id) as any;
      const startLocation = route?.departure || "Current Location";

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an AI dispatcher for a Mzansi taxi. 
        Current Taxi Location: "${startLocation}"
        Passengers: ${JSON.stringify(passengers.map(p => ({ id: p.id, name: p.passenger_name, destination: p.destination, delay_count: p.delay_count, current_position: p.queue_number })))}

        TASK: Re-order the passenger queue for drop-offs.
        
        RULES:
        1. DESCENDING ORDER: The person with the furthest destination from the start location must be at the bottom of the list.
        2. PROXIMITY MATCHING: If a new passenger's destination is very close to an existing passenger's destination, place them together in the sequence.
        3. DELAY PROTECTION: If an existing passenger has a delay_count >= 2, they CANNOT be pushed further down the list (their queue_number cannot increase). You must place new passengers AFTER them unless the new passenger is even closer to the start.
        4. EFFICIENCY: Minimize the total travel distance while respecting the delay protection.

        Return ONLY a JSON array of passenger IDs in the new drop-off order.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Ordered list of passenger IDs"
          }
        }
      });

      const newOrder = JSON.parse(response.text || '[]');
      if (Array.isArray(newOrder) && newOrder.length > 0) {
        const updateQueue = db.prepare("UPDATE passenger_trips SET queue_number = ?, delay_count = delay_count + ? WHERE id = ?");
        
        newOrder.forEach((id, index) => {
          const newPos = index + 1;
          const oldPass = passengers.find(p => p.id === id);
          
          // If the new position is higher (further down) than the old position, it's a delay
          // Note: if oldPass.queue_number is null (new passenger), we don't count it as a delay for them
          const isDelayed = oldPass && oldPass.queue_number !== null && newPos > oldPass.queue_number ? 1 : 0;
          
          updateQueue.run(newPos, isDelayed, id);
        });
      }
    } catch (error) {
      console.error("Failed to optimize queue:", error);
    }
  }

  app.post('/api/trip/:trip_id/passenger', async (req, res) => {
    const { trip_id } = req.params;
    const { passenger_name, destination, status = 'boarded' } = req.body;
    try {
      const insert = db.prepare("INSERT INTO passenger_trips (driver_trip_id, passenger_name, destination, status, delay_count) VALUES (?, ?, ?, ?, 0)");
      const info = insert.run(trip_id, passenger_name, destination, status);
      
      // Trigger AI optimization
      await optimizePassengerQueue(Number(trip_id));
      
      res.json({ success: true, passenger_id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trip/:trip_id/calculate-fares', (req, res) => {
    const { trip_id } = req.params;
    try {
      const trip = db.prepare("SELECT * FROM driver_trips WHERE id = ?").get(trip_id) as any;
      const passengers = db.prepare("SELECT * FROM passenger_trips WHERE driver_trip_id = ?").all(trip_id) as any[];
      const route = db.prepare("SELECT * FROM routes WHERE driver_id = ? ORDER BY id DESC LIMIT 1").get(trip.driver_id) as any;

      let currentFare = 15.00; // Fallback fare
      if (route && route.fares_json && passengers.length > 0) {
        const fares = JSON.parse(route.fares_json);
        const capacity = Object.keys(fares).length;
        const count = Math.min(passengers.length, capacity);
        currentFare = fares[count] || 15.00;
      }
      db.prepare("UPDATE passenger_trips SET fare = ? WHERE driver_trip_id = ?").run(currentFare, trip_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trip/:trip_id/start', (req, res) => {
    const { trip_id } = req.params;
    try {
      db.prepare("UPDATE driver_trips SET status = 'active' WHERE id = ?").run(trip_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trip/:trip_id/complete', (req, res) => {
    const { trip_id } = req.params;
    const { driving_score } = req.body;
    try {
      db.prepare("UPDATE driver_trips SET status = 'completed', driving_score = ? WHERE id = ?").run(driving_score || null, trip_id);
      db.prepare("UPDATE passenger_trips SET status = 'dropped_off' WHERE driver_trip_id = ?").run(trip_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Passenger Endpoints
  app.get('/api/passenger/search-trips', (req, res) => {
    const { origin, destination } = req.query;
    try {
      // Find drivers with active or gathering trips
      // For now, let's just return all active/gathering trips and their driver info
      const trips = db.prepare(`
        SELECT dt.id as trip_id, dt.status, d.name as driver_name, d.id as driver_id, d.rating, d.capacity,
               r.departure, r.destination as route_destination, r.fares_json,
               (SELECT COUNT(*) FROM passenger_trips WHERE driver_trip_id = dt.id) as passenger_count
        FROM driver_trips dt
        JOIN drivers d ON dt.driver_id = d.id
        JOIN routes r ON d.id = r.driver_id
        WHERE dt.status IN ('gathering', 'active')
        ORDER BY dt.created_at DESC
      `).all() as any[];

      // Filter by capacity and maybe some basic route matching
      const availableTrips = trips.filter(t => t.passenger_count < t.capacity);
      
      res.json({ success: true, trips: availableTrips });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/passenger/trip/join', async (req, res) => {
    const { passenger_id, trip_id, passenger_name, pickup_location, destination } = req.body;
    try {
      const insert = db.prepare(`
        INSERT INTO passenger_trips (driver_trip_id, passenger_id, passenger_name, pickup_location, destination, status)
        VALUES (?, ?, ?, ?, ?, 'pinged')
      `);
      const info = insert.run(trip_id, passenger_id, passenger_name, pickup_location, destination);
      
      // Trigger AI optimization
      await optimizePassengerQueue(Number(trip_id));

      // Auto-calculate fares for everyone in the trip now that someone joined
      const trip = db.prepare("SELECT * FROM driver_trips WHERE id = ?").get(trip_id) as any;
      const passengers = db.prepare("SELECT * FROM passenger_trips WHERE driver_trip_id = ?").all(trip_id) as any[];
      const route = db.prepare("SELECT * FROM routes WHERE driver_id = ? ORDER BY id DESC LIMIT 1").get(trip.driver_id) as any;

      if (route && route.fares_json && passengers.length > 0) {
        const fares = JSON.parse(route.fares_json);
        const capacity = Object.keys(fares).length;
        const count = Math.min(passengers.length, capacity);
        const currentFare = fares[count] || 15.00;
        db.prepare("UPDATE passenger_trips SET fare = ? WHERE driver_trip_id = ?").run(currentFare, trip_id);
      }

      res.json({ success: true, passenger_trip_id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/passenger/trip/:passenger_trip_id', (req, res) => {
    const { passenger_trip_id } = req.params;
    try {
      const trip = db.prepare(`
        SELECT tp.*, dt.status as trip_status, dt.current_lat, dt.current_lng, d.name as driver_name, d.phone as driver_phone, d.rating as driver_rating
        FROM passenger_trips tp
        JOIN driver_trips dt ON tp.driver_trip_id = dt.id
        JOIN drivers d ON dt.driver_id = d.id
        WHERE tp.id = ?
      `).get(passenger_trip_id);
      res.json({ success: true, trip });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/passenger/trip/:passenger_trip_id/status', (req, res) => {
    const { passenger_trip_id } = req.params;
    const { status } = req.body;
    try {
      db.prepare("UPDATE passenger_trips SET status = ? WHERE id = ?").run(status, passenger_trip_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/passenger/trip/:passenger_trip_id/review', (req, res) => {
    const { passenger_trip_id } = req.params;
    const { rating, review_text } = req.body;
    try {
      const passengerTrip = db.prepare("SELECT * FROM passenger_trips WHERE id = ?").get(passenger_trip_id) as any;
      if (!passengerTrip) return res.status(404).json({ error: 'Trip not found' });

      const driverTrip = db.prepare("SELECT driver_id FROM driver_trips WHERE id = ?").get(passengerTrip.driver_trip_id) as any;
      if (!driverTrip) return res.status(404).json({ error: 'Driver trip not found' });

      // Update passenger trip rating
      db.prepare("UPDATE passenger_trips SET passenger_rating = ? WHERE id = ?").run(rating, passenger_trip_id);

      // Update driver overall rating and driving_score
      const driver = db.prepare("SELECT rating, total_reviews, driving_score FROM drivers WHERE id = ?").get(driverTrip.driver_id) as any;
      const newTotalReviews = (driver.total_reviews || 0) + 1;
      const newRating = ((driver.rating * driver.total_reviews) + rating) / newTotalReviews;
      
      // Driving score calculation (simple: weighted average towards 100)
      // If rating is 5, score goes up. If rating is low, score drops more significantly.
      const ratingImpact = (rating - 3) * 2; // 5 -> +4, 4 -> +2, 3 -> 0, 2 -> -2, 1 -> -4
      const currentScore = driver.driving_score || 100.0;
      const newDrivingScore = Math.min(100, Math.max(0, currentScore + ratingImpact));

      db.prepare("UPDATE drivers SET rating = ?, total_reviews = ?, driving_score = ? WHERE id = ?").run(newRating, newTotalReviews, newDrivingScore, driverTrip.driver_id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/driver/location', (req, res) => {
    const { driver_id, lat, lng } = req.body;
    try {
      db.prepare("UPDATE driver_trips SET current_lat = ?, current_lng = ? WHERE driver_id = ? AND status IN ('gathering', 'active')").run(lat, lng, driver_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/passenger/:passenger_id/past-trips', (req, res) => {
    const { passenger_id } = req.params;
    try {
      const trips = db.prepare(`
        SELECT tp.*, t.created_at, d.name as driver_name
        FROM passenger_trips tp
        JOIN driver_trips t ON tp.driver_trip_id = t.id
        JOIN drivers d ON t.driver_id = d.id
        WHERE tp.passenger_id = ? AND tp.status = 'dropped_off'
        ORDER BY t.created_at DESC
      `).all(passenger_id);
      res.json({ success: true, trips });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/passenger/:passenger_id/frequent-destinations', (req, res) => {
    const { passenger_id } = req.params;
    try {
      const destinations = db.prepare(`
        SELECT destination, COUNT(*) as count
        FROM passenger_trips
        WHERE passenger_id = ?
        GROUP BY destination
        ORDER BY count DESC
        LIMIT 4
      `).all(passenger_id);
      res.json({ success: true, destinations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/driver/:driver_id/past-trips', (req, res) => {
    const { driver_id } = req.params;
    try {
      const trips = db.prepare(`
        SELECT dt.*, 
               (SELECT COUNT(*) FROM passenger_trips WHERE driver_trip_id = dt.id) as passenger_count,
               (SELECT SUM(fare) FROM passenger_trips WHERE driver_trip_id = dt.id) as total_earnings
        FROM driver_trips dt
        WHERE dt.driver_id = ? AND dt.status = 'completed'
        ORDER BY dt.created_at DESC
      `).all(driver_id);
      res.json({ success: true, trips });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/driver/:driver_id/profile', (req, res) => {
    const { driver_id } = req.params;
    try {
      const driver = db.prepare("SELECT * FROM drivers WHERE id = ?").get(driver_id);
      res.json({ success: true, driver });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Endpoints
  app.post('/api/ai/parse-voice', async (req, res) => {
    const { text } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract the passenger name and their destination from this text: "${text}". If you can't find one, leave it blank.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The passenger's name" },
              destination: { type: Type.STRING, description: "The destination they are going to" }
            },
            required: ["name", "destination"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/optimize-route', async (req, res) => {
    const { current_location, passengers } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the starting location "${current_location}" and the following list of passengers with their destinations and delay counts: ${JSON.stringify(passengers)}.
        Determine the most efficient order to drop them off.
        RULES:
        1. Minimize total travel time (Traveling Salesperson Problem).
        2. CRITICAL: If a passenger has a delay_count >= 2, they MUST be prioritized and dropped off earlier in the route to avoid further delays.
        Return ONLY the ordered list of destination addresses.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The ordered list of destination addresses from first stop to last stop."
          }
        }
      });
      
      const orderedDestinations = JSON.parse(response.text || '[]');
      res.json({ success: true, orderedDestinations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/debug/db', (req, res) => {
    try {
      const passengers = db.prepare('SELECT * FROM passengers').all();
      const drivers = db.prepare('SELECT * FROM drivers').all();
      const driver_trips = db.prepare('SELECT * FROM driver_trips').all();
      const passenger_trips = db.prepare('SELECT * FROM passenger_trips').all();
      const routes = db.prepare('SELECT * FROM routes').all();
      
      res.json({
        passengers,
        drivers,
        driver_trips,
        passenger_trips,
        routes
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
