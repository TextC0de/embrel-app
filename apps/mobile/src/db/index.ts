import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from './schema';

// Open the database with change listeners enabled for Live Queries
const expo = openDatabaseSync("embrel-v1.db", { enableChangeListener: false });

// Create Drizzle database instance
export const db = drizzle(expo, { schema });

// Export schema for use in components
export { schema };

// Export types
export type Database = typeof db; 