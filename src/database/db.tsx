import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('hairsalon.db');

export const initDB = () => {
	// table clients
	db.execSync(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT
    );
  `);

	// table history
	db.execSync(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      description TEXT,
      cost TEXT,
      date TEXT,
      FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);

  // table company
  db.execSync(`
    CREATE TABLE IF NOT EXISTS company (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nameCompany TEXT,
      mainColor TEXT,
      logoUrl TEXT
    );
  `);

};

export default db;
