import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    sanco_id TEXT,
    capacity INTEGER DEFAULT 15,
    rating REAL DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    driving_score REAL DEFAULT 100.0
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    departure TEXT NOT NULL,
    destination TEXT NOT NULL,
    waypoints TEXT,
    distance_km REAL,
    fares_json TEXT,
    fare_empty REAL,
    fare_half REAL,
    fare_full REAL,
    price_per_km_empty REAL,
    price_per_km_half REAL,
    price_per_km_full REAL,
    FOREIGN KEY(driver_id) REFERENCES drivers(id)
  );

  CREATE TABLE IF NOT EXISTS driver_trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    status TEXT DEFAULT 'gathering', -- gathering, active, completed, cancelled
    driving_score INTEGER,
    current_lat REAL,
    current_lng REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(driver_id) REFERENCES drivers(id)
  );

  CREATE TABLE IF NOT EXISTS passenger_trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_trip_id INTEGER NOT NULL,
    passenger_id INTEGER,
    passenger_name TEXT NOT NULL,
    pickup_location TEXT,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'boarded', -- pinged, boarded, dropped_off
    delay_count INTEGER DEFAULT 0,
    fare REAL,
    queue_number INTEGER,
    passenger_rating INTEGER,
    FOREIGN KEY(driver_trip_id) REFERENCES driver_trips(id),
    FOREIGN KEY(passenger_id) REFERENCES passengers(id)
  );
`);

// Ensure columns exist (for existing databases)
try {
  db.exec("ALTER TABLE drivers ADD COLUMN rating REAL DEFAULT 5.0");
} catch (e) {}
try {
  db.exec("ALTER TABLE drivers ADD COLUMN total_reviews INTEGER DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE drivers ADD COLUMN driving_score REAL DEFAULT 100.0");
} catch (e) {}
try {
  db.exec("ALTER TABLE routes ADD COLUMN price_per_km_empty REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE routes ADD COLUMN price_per_km_half REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE routes ADD COLUMN price_per_km_full REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE driver_trips ADD COLUMN current_lat REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE driver_trips ADD COLUMN current_lng REAL");
} catch (e) {}
try {
  db.exec("ALTER TABLE passenger_trips ADD COLUMN passenger_id INTEGER REFERENCES passengers(id)");
} catch (e) {}
try {
  db.exec("ALTER TABLE passenger_trips ADD COLUMN pickup_location TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE passenger_trips ADD COLUMN passenger_rating INTEGER");
} catch (e) {}

// Seed dummy data for passenger trips
try {
  const dummyPassenger = db.prepare("SELECT * FROM passengers WHERE username = 'thabo'").get() as any;
  if (!dummyPassenger) {
    const insertPassenger = db.prepare("INSERT INTO passengers (name, username, phone, password) VALUES (?, ?, ?, ?)");
    const info = insertPassenger.run('Thabo Ndlovu', 'thabo', '0821234567', 'password');
    const passengerId = info.lastInsertRowid;

    const insertDriver = db.prepare("INSERT INTO drivers (name, username, phone, password, sanco_id, capacity) VALUES (?, ?, ?, ?, ?, ?)");
    const driverInfo = insertDriver.run('Sipho Driver', 'sipho', '0831234567', 'password', 'SANCO123', 15);
    const driverId = driverInfo.lastInsertRowid;

    // Create past trips
    const insertTrip = db.prepare("INSERT INTO driver_trips (driver_id, status, driving_score, created_at) VALUES (?, 'completed', 95, datetime('now', '-2 days'))");
    const trip1 = insertTrip.run(driverId).lastInsertRowid;
    const trip2 = insertTrip.run(driverId).lastInsertRowid;

    const insertPass = db.prepare("INSERT INTO passenger_trips (driver_trip_id, passenger_id, passenger_name, pickup_location, destination, status, fare, passenger_rating) VALUES (?, ?, ?, ?, ?, 'dropped_off', ?, ?)");
    insertPass.run(trip1, passengerId, 'Thabo Ndlovu', 'Cape Town CBD', 'Camps Bay', 25.50, 5);
    insertPass.run(trip2, passengerId, 'Thabo Ndlovu', 'Bellville', 'Cape Town CBD', 30.00, 4);
    insertPass.run(trip2, passengerId, 'Thabo Ndlovu', 'Cape Town CBD', 'Stellenbosch', 45.00, 5);
  }
} catch (e) {
  console.error("Error seeding dummy data:", e);
}

export { db };
