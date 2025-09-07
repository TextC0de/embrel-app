// Database Service - EMBREL App
// Handles all database operations using Drizzle ORM
// Following best practices for data layer separation

import { count, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { passengers, sessions, settings, userFlights } from '../db/schema';
import { AppSettings, DataSession, Flight, PassengerData } from '../types/index';

/**
 * Database service providing high-level operations for the EMBREL app
 * Uses Drizzle ORM for type-safe database queries
 */
export class DatabaseService {
  // ==========================================
  // SESSION OPERATIONS
  // ==========================================

  /**
   * Create a new flight session
   */
  static async createSession(flight: Flight): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newSession: typeof sessions.$inferInsert = {
        id: sessionId,
        flightNumber: flight.flightNumber,
        flightRoute: flight.route,
        flightDate: flight.date,
        flightTime: flight.time,
        status: 'ready',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalPassengers: 0,
      };

      await db.insert(sessions).values(newSession);
      console.log('✅ [DB] Session created:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('❌ [DB] Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get all sessions ordered by creation date
   */
  static async getAllSessions(): Promise<DataSession[]> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .orderBy(desc(sessions.createdAt));

      return result.map(session => ({
        ...session,
        status: session.status as 'ready' | 'active' | 'completed' | 'archived',
        totalPassengers: session.totalPassengers || 0,
        flight: {
          id: session.id,
          flightNumber: session.flightNumber,
          route: session.flightRoute,
          date: session.flightDate,
          time: session.flightTime,
        },
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
    } catch (error) {
      console.error('❌ [DB] Error getting all sessions:', error);
      throw error;
    }
  }

  /**
   * Get a specific session by ID
   */
  static async getSession(sessionId: string): Promise<DataSession | null> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (result.length === 0) return null;

      const session = result[0];
      if (!session) return null;
      
      return {
        id: session.id,
        status: session.status as 'ready' | 'active' | 'completed' | 'archived',
        totalPassengers: session.totalPassengers || 0,
        flight: {
          id: session.id,
          flightNumber: session.flightNumber,
          route: session.flightRoute,
          date: session.flightDate,
          time: session.flightTime,
        },
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error('❌ [DB] Error getting session:', error);
      throw error;
    }
  }

  /**
   * Get the currently active session
   */
  static async getActiveSession(): Promise<DataSession | null> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.status, 'active'))
        .orderBy(desc(sessions.updatedAt))
        .limit(1);

      if (result.length === 0) return null;

      const session = result[0];
      if (!session) return null;
      
      return {
        id: session.id,
        status: session.status as 'ready' | 'active' | 'completed' | 'archived',
        totalPassengers: session.totalPassengers || 0,
        flight: {
          id: session.id,
          flightNumber: session.flightNumber,
          route: session.flightRoute,
          date: session.flightDate,
          time: session.flightTime,
        },
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error('❌ [DB] Error getting active session:', error);
      throw error;
    }
  }

  /**
   * Update session status
   */
  static async updateSessionStatus(
    sessionId: string, 
    status: 'ready' | 'active' | 'completed' | 'archived'
  ): Promise<void> {
    try {
      await db
        .update(sessions)
        .set({ 
          status, 
          updatedAt: Date.now() 
        })
        .where(eq(sessions.id, sessionId));

      console.log(`✅ [DB] Session ${sessionId} status updated to: ${status}`);
    } catch (error) {
      console.error('❌ [DB] Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Delete a session and all its passengers
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      // Delete passengers first (foreign key constraint)
      await db.delete(passengers).where(eq(passengers.sessionId, sessionId));
      
      // Delete the session
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      
      console.log('✅ [DB] Session deleted:', sessionId);
    } catch (error) {
      console.error('❌ [DB] Error deleting session:', error);
      throw error;
    }
  }

  // ==========================================
  // PASSENGER OPERATIONS
  // ==========================================

  /**
   * Add a passenger to a session
   */
  static async addPassenger(passengerData: PassengerData, sessionId: string): Promise<void> {
    try {
      const passengerId = `passenger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPassenger: typeof passengers.$inferInsert = {
        id: passengerId,
        passenger: passengerData.passenger,
        pnr: passengerData.pnr,
        route: passengerData.route,
        flight: passengerData.flight,
        seat: passengerData.seat,
        seq: passengerData.seq,
        timestamp: Date.now(),
        rawData: JSON.stringify(passengerData),
        sessionId,
      };

      await db.insert(passengers).values(newPassenger);

      // Update passenger count in session
      await this.updatePassengerCount(sessionId);

      console.log('✅ [DB] Passenger added:', passengerData.passenger);
    } catch (error) {
      console.error('❌ [DB] Error adding passenger:', error);
      throw error;
    }
  }

  /**
   * Get all passengers for a session
   */
  static async getPassengersForSession(sessionId: string): Promise<PassengerData[]> {
    try {
      const result = await db
        .select()
        .from(passengers)
        .where(eq(passengers.sessionId, sessionId))
        .orderBy(desc(passengers.timestamp));

      return result.map(p => ({
        id: p.id,
        passenger: p.passenger,
        pnr: p.pnr,
        route: p.route,
        flight: p.flight,
        seat: p.seat,
        seq: p.seq,
        timestamp: p.timestamp,
      }));
    } catch (error) {
      console.error('❌ [DB] Error getting passengers for session:', error);
      throw error;
    }
  }

  /**
   * Get all passengers across all sessions
   */
  static async getAllPassengers(): Promise<PassengerData[]> {
    try {
      const result = await db
        .select()
        .from(passengers)
        .orderBy(desc(passengers.timestamp));

      return result.map(p => ({
        id: p.id,
        passenger: p.passenger,
        pnr: p.pnr,
        route: p.route,
        flight: p.flight,
        seat: p.seat,
        seq: p.seq,
        timestamp: p.timestamp,
      }));
    } catch (error) {
      console.error('❌ [DB] Error getting all passengers:', error);
      throw error;
    }
  }

  /**
   * Remove a passenger
   */
  static async removePassenger(passengerId: string): Promise<void> {
    try {
      // Get the session ID before deleting
      const result = await db
        .select({ sessionId: passengers.sessionId })
        .from(passengers)
        .where(eq(passengers.id, passengerId))
        .limit(1);

      if (result.length > 0) {
        await db.delete(passengers).where(eq(passengers.id, passengerId));
        
        // Update passenger count
        const passengerRecord = result[0];
        if (passengerRecord?.sessionId) {
          await this.updatePassengerCount(passengerRecord.sessionId);
        }
        
        console.log('✅ [DB] Passenger removed:', passengerId);
      }
    } catch (error) {
      console.error('❌ [DB] Error removing passenger:', error);
      throw error;
    }
  }

  /**
   * Update passenger count for a session
   */
  private static async updatePassengerCount(sessionId: string): Promise<void> {
    try {
      const result = await db
        .select({ count: count() })
        .from(passengers)
        .where(eq(passengers.sessionId, sessionId));

      const passengerCount = result[0]?.count || 0;

      await db
        .update(sessions)
        .set({ 
          totalPassengers: passengerCount,
          updatedAt: Date.now()
        })
        .where(eq(sessions.id, sessionId));

    } catch (error) {
      console.error('❌ [DB] Error updating passenger count:', error);
      throw error;
    }
  }

  // ==========================================
  // SETTINGS OPERATIONS
  // ==========================================

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.id, 'main'))
        .limit(1);

      if (result.length === 0) {
        // Create default settings
        const defaultSettings: AppSettings = {
          soundEnabled: true,
          vibrationEnabled: true,
          keepScreenOn: true,
          autoBackup: false,
          debugMode: false,
          desktopModeEnabled: false,
        };
        
        await this.updateSettings(defaultSettings);
        return defaultSettings;
      }

      const settingsRecord = result[0];
      if (!settingsRecord) {
        const defaultSettings: AppSettings = {
          soundEnabled: true,
          vibrationEnabled: true,
          keepScreenOn: true,
          autoBackup: false,
          debugMode: false,
          desktopModeEnabled: false,
        };
        await this.updateSettings(defaultSettings);
        return defaultSettings;
      }
      
      return {
        soundEnabled: Boolean(settingsRecord.soundEnabled),
        vibrationEnabled: Boolean(settingsRecord.vibrationEnabled),
        keepScreenOn: Boolean(settingsRecord.keepScreenOn),
        autoBackup: Boolean(settingsRecord.autoBackup),
        debugMode: Boolean(settingsRecord.debugMode),
        desktopModeEnabled: Boolean(settingsRecord.desktopModeEnabled),
      };
    } catch (error) {
      console.error('❌ [DB] Error getting settings:', error);
      throw error;
    }
  }

  /**
   * Update app settings
   */
  static async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    try {
      await db
        .insert(settings)
        .values({
          id: 'main',
          ...newSettings,
          updatedAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: settings.id,
          set: {
            ...newSettings,
            updatedAt: Date.now(),
          },
        });

      console.log('✅ [DB] Settings updated');
    } catch (error) {
      console.error('❌ [DB] Error updating settings:', error);
      throw error;
    }
  }

  // ==========================================
  // USER FLIGHTS OPERATIONS
  // ==========================================

  /**
   * Get user-created flights
   */
  static async getUserFlights(): Promise<Flight[]> {
    try {
      const result = await db
        .select()
        .from(userFlights)
        .orderBy(desc(userFlights.createdAt));

      return result.map(f => ({
        id: f.id,
        flightNumber: f.flightNumber,
        route: f.route,
        date: f.date,
        time: f.time,
        ...(f.description ? { description: f.description } : {}),
      }));
    } catch (error) {
      console.error('❌ [DB] Error getting user flights:', error);
      throw error;
    }
  }

  /**
   * Add a user flight
   */
  static async addUserFlight(flight: Omit<Flight, 'id'>): Promise<string> {
    try {
      const flightId = `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newFlight: typeof userFlights.$inferInsert = {
        id: flightId,
        flightNumber: flight.flightNumber,
        route: flight.route,
        date: flight.date,
        time: flight.time,
        description: flight.description || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.insert(userFlights).values(newFlight);
      console.log('✅ [DB] User flight added:', flight.flightNumber);
      return flightId;
    } catch (error) {
      console.error('❌ [DB] Error adding user flight:', error);
      throw error;
    }
  }

  /**
   * Update a user flight
   */
  static async updateUserFlight(
    flightId: string, 
    flight: Partial<Omit<Flight, 'id'>>
  ): Promise<void> {
    try {
      await db
        .update(userFlights)
        .set({ 
          ...flight,
          updatedAt: Date.now() 
        })
        .where(eq(userFlights.id, flightId));

      console.log('✅ [DB] User flight updated:', flightId);
    } catch (error) {
      console.error('❌ [DB] Error updating user flight:', error);
      throw error;
    }
  }

  /**
   * Delete a user flight
   */
  static async deleteUserFlight(flightId: string): Promise<void> {
    try {
      await db.delete(userFlights).where(eq(userFlights.id, flightId));
      console.log('✅ [DB] User flight deleted:', flightId);
    } catch (error) {
      console.error('❌ [DB] Error deleting user flight:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY OPERATIONS
  // ==========================================

  /**
   * Clear all data (for testing/reset purposes)
   */
  static async clearAllData(): Promise<void> {
    try {
      await db.delete(passengers);
      await db.delete(sessions);
      await db.delete(userFlights);
      await db.delete(settings);
      console.log('✅ [DB] All data cleared');
    } catch (error) {
      console.error('❌ [DB] Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    totalSessions: number;
    totalPassengers: number;
    totalUserFlights: number;
  }> {
    try {
      const [sessionCount, passengerCount, flightCount] = await Promise.all([
        db.select({ count: count() }).from(sessions),
        db.select({ count: count() }).from(passengers),
        db.select({ count: count() }).from(userFlights),
      ]);

      return {
        totalSessions: sessionCount[0]?.count || 0,
        totalPassengers: passengerCount[0]?.count || 0,
        totalUserFlights: flightCount[0]?.count || 0,
      };
    } catch (error) {
      console.error('❌ [DB] Error getting stats:', error);
      throw error;
    }
  }
} 