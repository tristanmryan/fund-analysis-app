/* eslint-env browser, es2020 */
// src/services/dataStore.ts

import type { Fund } from '@/types/fund'

interface SnapshotInput {
  date?: string
  funds?: Fund[]
  uploadedBy?: string
  fileName?: string
  metadata?: Record<string, unknown>
  classSummaries?: Record<string, unknown>
  reviewCandidates?: unknown[]
}

interface SnapshotRecord {
  id: string
  date: string
  funds: Fund[]
  metadata: Record<string, unknown>
  classSummaries: Record<string, unknown>
  reviewCandidates: unknown[]
}

interface ConfigEntry<T = unknown> {
  key: string
  value: T
  lastModified: string
}

interface PreferenceEntry<T = unknown> {
  key: string
  value: T
  lastModified: string
}

interface AuditLogEntry {
  id?: number
  action: string
  details: Record<string, unknown>
  timestamp: string
  user: string
}

interface SnapshotChange {
  symbol: string
  fundName: string
  assetClass: string
  oldScore?: number
  newScore?: number
  change?: number
  changePercent?: string
  type?: 'new' | 'removed'
}

interface SnapshotComparison {
  snapshot1: { id: string; date: string }
  snapshot2: { id: string; date: string }
  changes: SnapshotChange[]
}

interface DataBackup {
  version: number
  exportDate: string
  snapshots: SnapshotRecord[]
  config: ConfigEntry[]
  preferences: PreferenceEntry[]
  auditLog: AuditLogEntry[]
}

/**
 * IndexedDB Data Store for Lightship Fund Analysis
 * Handles persistent storage of snapshots, configuration, and preferences
 */

const DB_NAME = 'LightshipFundAnalysis';
const DB_VERSION = 1;

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

// Object store names
const STORES = {
  SNAPSHOTS: 'snapshots',
  CONFIG: 'config',
  PREFERENCES: 'preferences',
  AUDIT_LOG: 'auditLog'
};

// Initialize database connection
let db: IDBDatabase | null = null;

/**
 * Open IndexedDB connection and create stores if needed
 * @returns {Promise<IDBDatabase>} Database connection
 */
async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  if (!globalThis.indexedDB) {
    try {
      await import('fake-indexeddb/auto');
    } catch (err) {
      throw new Error('IndexedDB not available');
    }
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      console.error('Failed to open database:', err);
      reject(err);
      return;
    }

    request.onerror = () => {
      console.error('Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create snapshots store
      if (!database.objectStoreNames.contains(STORES.SNAPSHOTS)) {
        const snapshotStore = database.createObjectStore(STORES.SNAPSHOTS, { 
          keyPath: 'id' 
        });
        snapshotStore.createIndex('date', 'date', { unique: false });
        snapshotStore.createIndex('uploadDate', 'metadata.uploadDate', { unique: false });
      }

      // Create config store
      if (!database.objectStoreNames.contains(STORES.CONFIG)) {
        database.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
      }

      // Create preferences store
      if (!database.objectStoreNames.contains(STORES.PREFERENCES)) {
        database.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
      }

      // Create audit log store
      if (!database.objectStoreNames.contains(STORES.AUDIT_LOG)) {
        const auditStore = database.createObjectStore(STORES.AUDIT_LOG, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        auditStore.createIndex('action', 'action', { unique: false });
      }
    };
  });
}

export async function initializeObjectStore(database: IDBDatabase): Promise<IDBDatabase> {
  if (database.objectStoreNames.contains(STORES.SNAPSHOTS)) return database;
  database.close();
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = globalThis.indexedDB.open(DB_NAME, database.version + 1);
    req.onupgradeneeded = e => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(
        STORES.SNAPSHOTS,
        { autoIncrement: true }
      );
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generate snapshot ID from date
 * @param {Date} date - Snapshot date
 * @returns {string} Snapshot ID
 */
function generateSnapshotId(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `snapshot_${year}_${month}`;
}

/**
 * Save a monthly snapshot
 * @param {Object} snapshotData - Snapshot data including funds and metadata
 * @returns {Promise<string>} Snapshot ID
 */
export async function saveSnapshot(snapshotData: SnapshotInput): Promise<string> {
  const database = await openDB();
  
  // Generate ID based on date
  const snapshotDate = snapshotData.date || new Date().toISOString();
  const id = generateSnapshotId(snapshotDate);
  
  const snapshot: SnapshotRecord = {
    id,
    date: snapshotDate,
    funds: snapshotData.funds || [],
    metadata: {
      uploadDate: new Date().toISOString(),
      uploadedBy: snapshotData.uploadedBy || 'user',
      totalFunds: snapshotData.funds?.length || 0,
      recommendedFunds: snapshotData.funds?.filter(f => f.isRecommended).length || 0,
      fileName: snapshotData.fileName,
      ...snapshotData.metadata
    },
    classSummaries: snapshotData.classSummaries || {},
    reviewCandidates: snapshotData.reviewCandidates || []
  };

  if (!database.objectStoreNames.contains(STORES.SNAPSHOTS)) {
    await initializeObjectStore(database);
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SNAPSHOTS], 'readwrite');
    const store = transaction.objectStore(STORES.SNAPSHOTS);
    
    // Use put instead of add to allow updates
    const request = store.put(snapshot);
    
    request.onsuccess = () => {
      console.log('Snapshot saved:', id);
      
      // Log the action
      logAction('snapshot_saved', { snapshotId: id, fundsCount: snapshot.funds.length });
      
      resolve(id);
    };
    
    request.onerror = () => {
      console.error('Failed to save snapshot:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get all snapshots (sorted by date descending)
 * @returns {Promise<Array>} Array of snapshots
 */
export async function getAllSnapshots(): Promise<SnapshotRecord[]> {
  try {

    let database;
    try {
      database = await openDB();
    } catch (err) {
      throw err; // surface DB-init failures
    }

    return await new Promise<SnapshotRecord[]>((resolve, reject) => {
      const tx = database.transaction([STORES.SNAPSHOTS], 'readonly');
      const store = tx.objectStore(STORES.SNAPSHOTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const shots = (request.result || []) as SnapshotRecord[];
        shots.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
        resolve(shots);
      };
      request.onerror = () => {
        console.error('Failed to get snapshots:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to get snapshots:', err);
    throw err;
  }
}


/**
 * Get a specific snapshot by ID
 * @param {string} snapshotId - Snapshot ID
 * @returns {Promise<Object>} Snapshot data
 */
export async function getSnapshot(snapshotId: string): Promise<SnapshotRecord | undefined> {
  try {
    const database = await openDB();

    return await new Promise<SnapshotRecord | undefined>((resolve, reject) => {
      const transaction = database.transaction([STORES.SNAPSHOTS], 'readonly');
      const store = transaction.objectStore(STORES.SNAPSHOTS);
      const request = store.get(snapshotId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to get snapshot:', err);
    throw err;
  }
}

/**
 * Delete a snapshot
 * @param {string} snapshotId - Snapshot ID to delete
 * @returns {Promise<void>}
 */
export async function deleteSnapshot(snapshotId: string): Promise<void> {
  try {
    const database = await openDB();

    if (!database.objectStoreNames.contains(STORES.SNAPSHOTS)) {
      await initializeObjectStore(database);
    }

    return await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORES.SNAPSHOTS], 'readwrite');
      const store = transaction.objectStore(STORES.SNAPSHOTS);
      const request = store.delete(snapshotId);

      request.onsuccess = () => {
        console.log('Snapshot deleted:', snapshotId);
        logAction('snapshot_deleted', { snapshotId });
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to delete snapshot:', err);
    throw err;
  }
}

/**
 * Get snapshots within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Filtered snapshots
 */
export async function getSnapshotsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<SnapshotRecord[]> {
  const allSnapshots = await getAllSnapshots();
  return allSnapshots.filter(snapshot => {
    const snapshotDate = new Date(snapshot.date);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  });
}

/**
 * Save configuration (recommended funds, benchmarks, etc.)
 * @param {string} key - Config key
 * @param {unknown} value - Config value
 * @returns {Promise<void>}
 */
export async function saveConfig<T>(key: string, value: T): Promise<void> {
  const database = await openDB();
  
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFIG], 'readwrite');
    const store = transaction.objectStore(STORES.CONFIG);
    
    const data: ConfigEntry<T> = {
      key,
      value,
      lastModified: new Date().toISOString()
    };
    
    const request = store.put(data);
    
    request.onsuccess = () => {
      console.log('Config saved:', key);
      logAction('config_updated', { key });
      resolve();
    };
    
    request.onerror = () => {
      console.error('Failed to save config:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get configuration value
 * @param {string} key - Config key
 * @returns {Promise<unknown>} Config value
 */
export async function getConfig<T>(key: string): Promise<T | undefined> {
  const database = await openDB();
  
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFIG], 'readonly');
    const store = transaction.objectStore(STORES.CONFIG);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result?.value as T | undefined);
    };
    
    request.onerror = () => {
      console.error('Failed to get config:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Save user preferences
 * @param {string} key - Preference key
 * @param {unknown} value - Preference value
 * @returns {Promise<void>}
 */
export async function savePreference<T>(key: string, value: T): Promise<void> {
  const database = await openDB();
  
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([STORES.PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORES.PREFERENCES);
    
    const data: PreferenceEntry<T> = {
      key,
      value,
      lastModified: new Date().toISOString()
    };
    
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error('Failed to save preference:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get user preference
 * @param {string} key - Preference key
 * @returns {Promise<unknown>} Preference value
 */
export async function getPreference<T>(key: string): Promise<T | undefined> {
  const database = await openDB();
  
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = database.transaction([STORES.PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result?.value as T | undefined);
    };
    
    request.onerror = () => {
      console.error('Failed to get preference:', request.error);
      reject(request.error);
    };
  });
}

// Lightweight helpers around preferences
export async function savePref<T>(key: string, value: T): Promise<void> {
  await savePreference(key, value);
}

export async function getPref<T>(key: string, defaultValue: T): Promise<T> {
  const val = await getPreference<T>(key);
  return val ?? defaultValue;
}

/**
 * Log an action for audit trail
 * @param {string} action - Action type
 * @param {Object} details - Action details
 * @returns {Promise<void>}
 */
async function logAction(action: string, details: Record<string, unknown>): Promise<void> {
  const database = await openDB();

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([STORES.AUDIT_LOG], 'readwrite');
    const store = transaction.objectStore(STORES.AUDIT_LOG);
    
    const entry = {
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'user' // In future, this could be the actual user
    };
    
    const request = store.add(entry);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      // Don't reject main operation if logging fails
      console.warn('Failed to log action:', request.error);
      resolve();
    };
  });
}

/**
 * Get audit log entries
 * @param {number} limit - Maximum number of entries to return
 * @returns {Promise<Array>} Audit log entries
 */
export async function getAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  const database = await openDB();

  return new Promise<AuditLogEntry[]>((resolve, reject) => {
    const transaction = database.transaction([STORES.AUDIT_LOG], 'readonly');
    const store = transaction.objectStore(STORES.AUDIT_LOG);
    const index = store.index('timestamp');
    
    const entries: AuditLogEntry[] = [];
    let count = 0;
    
    // Open cursor in reverse order (newest first)
    const request = index.openCursor(null, 'prev');
    
    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && count < limit) {
        entries.push(cursor.value);
        count++;
        cursor.continue();
      } else {
        resolve(entries);
      }
    };
    
    request.onerror = () => {
      console.error('Failed to get audit log:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Compare two snapshots
 * @param {string} snapshotId1 - First snapshot ID
 * @param {string} snapshotId2 - Second snapshot ID
 * @returns {Promise<Object>} Comparison results
 */
export async function compareSnapshots(
  snapshotId1: string,
  snapshotId2: string
): Promise<SnapshotComparison> {
  const [snapshot1, snapshot2] = await Promise.all([
    getSnapshot(snapshotId1),
    getSnapshot(snapshotId2)
  ]);
  
  if (!snapshot1 || !snapshot2) {
    throw new Error('One or both snapshots not found');
  }
  
  const comparison: SnapshotComparison = {
    snapshot1: { id: snapshotId1, date: snapshot1.date },
    snapshot2: { id: snapshotId2, date: snapshot2.date },
    changes: []
  };
  
  // Create maps for easier lookup
  const funds1Map = new Map(snapshot1.funds.map(f => [f.Symbol, f]));
  const funds2Map = new Map(snapshot2.funds.map(f => [f.Symbol, f]));
  
  // Find changes in scores
  funds2Map.forEach((fund2, symbol) => {
    const fund1 = funds1Map.get(symbol);
    
    if (fund1 && fund1.scores && fund2.scores) {
      const scoreDiff = fund2.scores.final - fund1.scores.final;
      
      if (Math.abs(scoreDiff) > 0) {
        comparison.changes.push({
          symbol,
          fundName: fund2.fundName,
          assetClass: fund2.assetClass,
          oldScore: fund1.scores.final,
          newScore: fund2.scores.final,
          change: scoreDiff,
          changePercent: ((scoreDiff / fund1.scores.final) * 100).toFixed(1)
        });
      }
    } else if (!fund1) {
      // New fund
      comparison.changes.push({
        symbol,
        fundName: fund2.fundName,
        assetClass: fund2.assetClass,
        type: 'new',
        newScore: fund2.scores?.final
      });
    }
  });
  
  // Find removed funds
  funds1Map.forEach((fund1, symbol) => {
    if (!funds2Map.has(symbol)) {
      comparison.changes.push({
        symbol,
        fundName: fund1.fundName,
        assetClass: fund1.assetClass,
        type: 'removed',
        oldScore: fund1.scores?.final
      });
    }
  });
  
  // Sort by absolute change
  comparison.changes.sort((a, b) => {
    const changeA = Math.abs(a.change || 0);
    const changeB = Math.abs(b.change || 0);
    return changeB - changeA;
  });
  
  return comparison;
}

/**
 * Export all data for backup
 * @returns {Promise<Object>} All data
 */
export async function exportAllData(): Promise<DataBackup> {
  const [snapshots, config, preferences, auditLog] = await Promise.all([
    getAllSnapshots(),
    getAllConfig(),
    getAllPreferences(),
    getAuditLog(1000)
  ]);
  
  return {
    version: DB_VERSION,
    exportDate: new Date().toISOString(),
    snapshots,
    config,
    preferences,
    auditLog
  } as DataBackup;
}

/**
 * Import data from backup
 * @param {Object} data - Data to import
 * @returns {Promise<void>}
 */
export async function importData(data: DataBackup): Promise<void> {
  if (data.version !== DB_VERSION) {
    console.warn('Version mismatch, data might need migration');
  }
  
  // Import snapshots
  if (data.snapshots) {
    for (const snapshot of data.snapshots) {
      await saveSnapshot(snapshot);
    }
  }
  
  // Import config
  if (data.config) {
    for (const item of data.config) {
      await saveConfig(item.key, item.value);
    }
  }
  
  // Import preferences
  if (data.preferences) {
    for (const item of data.preferences) {
      await savePreference(item.key, item.value);
    }
  }
  
  logAction('data_imported', { 
    snapshotsCount: data.snapshots?.length || 0,
    configCount: data.config?.length || 0
  });
}

// Helper functions for getting all config/preferences
async function getAllConfig(): Promise<ConfigEntry[]> {
  const database = await openDB();
  
  return new Promise<ConfigEntry[]>((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFIG], 'readonly');
    const store = transaction.objectStore(STORES.CONFIG);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve((request.result || []) as ConfigEntry[]);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getAllPreferences(): Promise<PreferenceEntry[]> {
  const database = await openDB();

  return new Promise<PreferenceEntry[]>((resolve, reject) => {
    const transaction = database.transaction([STORES.PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve((request.result || []) as PreferenceEntry[]);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Clear all data (for testing or reset)
 * @returns {Promise<void>}
 */
export async function clearAllData(): Promise<void> {
  const database = await openDB();
  
  const stores = [STORES.SNAPSHOTS, STORES.CONFIG, STORES.PREFERENCES, STORES.AUDIT_LOG];
  const transaction = database.transaction(stores, 'readwrite');
  
  const promises = stores.map(storeName => {
    return new Promise<void>((resolve, reject) => {
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  
  await Promise.all(promises);
  logAction('data_cleared', { timestamp: new Date().toISOString() });
}

const dataStoreApi = {
  saveSnapshot,
  getAllSnapshots,
  getSnapshot,
  deleteSnapshot,
  getSnapshotsByDateRange,
  saveConfig,
  getConfig,
  savePreference,
  getPreference,
  savePref,
  getPref,
  getAuditLog,
  compareSnapshots,
  exportAllData,
  importData,
  clearAllData
};

export default dataStoreApi;
