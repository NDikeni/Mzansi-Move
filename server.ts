import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, username, phone, password, role, sanco_id, capacity } = req.body;
    
    try {
      const insertUser = db.prepare('INSERT INTO users (name, username, phone, password, role) VALUES (?, ?, ?, ?, ?)');
      const info = insertUser.run(name, username, phone, password, role);
      const userId = info.lastInsertRowid;

      if (role === 'driver') {
        const insertDriver = db.prepare('INSERT INTO driver_profiles (user_id, sanco_id, capacity) VALUES (?, ?, ?)');
        insertDriver.run(userId, sanco_id, capacity);
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
      const user = db.prepare('SELECT * FROM users WHERE phone = ? AND password = ? AND role = ?').get(phone, password, role);
      
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
    const { driver_id, departure, destination, fare_empty, fare_half, fare_full } = req.body;
    
    try {
      const insertRoute = db.prepare('INSERT INTO routes (driver_id, departure, destination, fare_empty, fare_half, fare_full) VALUES (?, ?, ?, ?, ?, ?)');
      insertRoute.run(driver_id, departure, destination, fare_empty, fare_half, fare_full);
      res.json({ success: true });
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
