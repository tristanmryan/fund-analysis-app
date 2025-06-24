let originalIndexedDB;
let originalWindowIndexedDB;

function setupFailingDB() {
  const error = new Error('tx fail');

  const failRequest = () => {
    const req = { error };
    setTimeout(() => req.onerror && req.onerror());
    return req;
  };

  const throwErr = () => { throw error; };

  const objectStore = {
    put: () => { throw error; },
    getAll: () => { throw error; },
    get: () => { throw error; },
    delete: () => { throw error; },
    clear: () => { throw error; },
    index: () => ({ openCursor: () => { throw error; } }),
  };

  const fakeDb = {
    transaction: () => ({ objectStore: () => objectStore }),
  };

  const idb = {
    open: () => {
      const req = {};
      setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: fakeDb } }));
      return req;
    },
  };
  global.indexedDB = idb;
  if (typeof window !== 'undefined') window.indexedDB = idb;

  return error;
}

beforeEach(() => {
  jest.resetModules();
  originalIndexedDB = global.indexedDB;
  if (typeof window !== 'undefined') originalWindowIndexedDB = window.indexedDB;
});

afterEach(() => {
  global.indexedDB = originalIndexedDB;
  if (typeof window !== 'undefined') window.indexedDB = originalWindowIndexedDB;
});

test.skip('dataStore methods rethrow transaction errors', async () => {
  const err = setupFailingDB();
  const dataStore = require('../dataStore').default;

  const snapshot = { date: '2024-01-01', funds: [] };

  await expect(dataStore.saveSnapshot(snapshot)).rejects.toThrow(err);
  await expect(dataStore.getAllSnapshots()).rejects.toThrow(err);
  await expect(dataStore.getSnapshot('id')).rejects.toThrow(err);
  await expect(dataStore.deleteSnapshot('id')).rejects.toThrow(err);
  await expect(dataStore.saveConfig('k', 'v')).rejects.toThrow(err);
  await expect(dataStore.getConfig('k')).rejects.toThrow(err);
  await expect(dataStore.savePreference('k', 'v')).rejects.toThrow(err);
  await expect(dataStore.getPreference('k')).rejects.toThrow(err);
  await expect(dataStore.getAuditLog()).rejects.toThrow(err);
});
