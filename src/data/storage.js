// src/data/storage.js
import { saveConfig, getConfig } from '../services/dataStore';

// Keys for configuration storage
const CONFIG_KEYS = {
  RECOMMENDED_FUNDS: 'recommendedFunds',
  ASSET_CLASS_BENCHMARKS: 'assetClassBenchmarks'
};

/**
 * Get stored configuration from IndexedDB
 * @returns {Object} Saved funds and benchmarks
 */
export const getStoredConfig = async () => {
  try {
    // Get from IndexedDB
    const [savedFunds, savedBenchmarks] = await Promise.all([
      getConfig(CONFIG_KEYS.RECOMMENDED_FUNDS),
      getConfig(CONFIG_KEYS.ASSET_CLASS_BENCHMARKS)
    ]);
    
    return {
      savedFunds,
      savedBenchmarks
    };
  } catch (error) {
    console.error('Error getting stored config:', error);
    return { savedFunds: null, savedBenchmarks: null };
  }
};

/**
 * Save configuration to IndexedDB
 * @param {Array} recommendedFunds - List of recommended funds
 * @param {Object} assetClassBenchmarks - Asset class to benchmark mappings
 */
export const saveStoredConfig = async (recommendedFunds, assetClassBenchmarks) => {
  try {
    await Promise.all([
      saveConfig(CONFIG_KEYS.RECOMMENDED_FUNDS, recommendedFunds),
      saveConfig(CONFIG_KEYS.ASSET_CLASS_BENCHMARKS, assetClassBenchmarks)
    ]);
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
};