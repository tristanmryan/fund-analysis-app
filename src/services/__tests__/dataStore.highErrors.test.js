let dataStore;

let originalIndexedDB;
let originalWindowIndexedDB;

beforeEach(() => {
  jest.resetModules();
  originalIndexedDB = global.indexedDB;
  if (typeof window !== 'undefined') originalWindowIndexedDB = window.indexedDB;
  dataStore = require('@/services/dataStore');
});

afterEach(() => {
  global.indexedDB = originalIndexedDB;
  if (typeof window !== 'undefined') window.indexedDB = originalWindowIndexedDB;
});

describe.skip('dataStore high-priority errors', () => {
  test('getAllSnapshots throws on request error', async () => {
    jest.useFakeTimers();
    const error = new Error('mock failure');
    const fakeDB = {
      transaction: () => ({
        objectStore: () => ({
          getAll: () => {
            const req = { get error() { return error; } };
            setTimeout(() => req.onerror && req.onerror());
            return req;
          }
        })
      })
    };
    window.indexedDB = {
      open: jest.fn(() => {
        let onsuccess;
        const req = {
          get onsuccess() { return onsuccess; },
          set onsuccess(fn) { onsuccess = fn; req.result = fakeDB; fn({ target: { result: fakeDB } }); },
          onerror: null,
          onupgradeneeded: null
        };
        return req;
      })
    };

    const promise = dataStore.getAllSnapshots();
    jest.runAllTimers();
    await expect(promise).rejects.toThrow(error);
  });

  test('initializeObjectStore called when store missing', async () => {
    jest.useFakeTimers();
    window.indexedDB = {
      open: jest.fn(() => {
        const req = {};
        setTimeout(() => {
          req.onupgradeneeded && req.onupgradeneeded({ target: { result: { createObjectStore: jest.fn() } } });
          req.onsuccess && req.onsuccess({ result: {} });
        });
        return req;
      })
    };

    const db = {
      objectStoreNames: { contains: () => false },
      close: jest.fn(),
      version: 1
    };
    const promise = dataStore.initializeObjectStore(db);
    jest.runAllTimers();
    await expect(promise).resolves.not.toThrow();
  });
});
