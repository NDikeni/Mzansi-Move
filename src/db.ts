import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'mzansi_move.db');
export const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS driver_profiles (
    user_id INTEGER PRIMARY KEY,
    sanco_id TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    departure TEXT NOT NULL,
    destination TEXT NOT NULL,
    fare_empty INTEGER NOT NULL,
    fare_half INTEGER NOT NULL,
    fare_full INTEGER NOT NULL,
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );
`);
