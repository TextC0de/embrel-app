import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Passengers table - stores individual passenger boarding pass data
export const passengers = sqliteTable('passengers', {
  id: text('id').primaryKey(),
  passenger: text('passenger').notNull(),
  pnr: text('pnr').notNull(),
  route: text('route').notNull(),
  flight: text('flight').notNull(),
  seat: text('seat').notNull(),
  seq: text('seq').notNull(),
  timestamp: integer('timestamp').notNull(),
  rawData: text('raw_data').notNull(),
  sessionId: text('session_id').notNull(), // Links to sessions table
});

// Sessions table - stores boarding sessions (one per flight)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  flightNumber: text('flight_number').notNull(),
  flightRoute: text('flight_route').notNull(),
  flightDate: text('flight_date').notNull(),
  flightTime: text('flight_time').notNull(),
  status: text('status').notNull(), // 'ready' | 'active' | 'completed' | 'archived'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  totalPassengers: integer('total_passengers').default(0),
});

// User flights table - stores custom flights created by users
export const userFlights = sqliteTable('user_flights', {
  id: text('id').primaryKey(),
  flightNumber: text('flight_number').notNull(),
  route: text('route').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Settings table - stores app configuration
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().default('main'),
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).default(true),
  vibrationEnabled: integer('vibration_enabled', { mode: 'boolean' }).default(true),
  autoScanEnabled: integer('auto_scan_enabled', { mode: 'boolean' }).default(false),
  theme: text('theme').default('light'),
  lastBackupDate: integer('last_backup_date'),
  keepScreenOn: integer('keep_screen_on', { mode: 'boolean' }).default(true),
  autoBackup: integer('auto_backup', { mode: 'boolean' }).default(false),
  debugMode: integer('debug_mode', { mode: 'boolean' }).default(false),
  desktopModeEnabled: integer('desktop_mode_enabled', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at').notNull(),
}); 