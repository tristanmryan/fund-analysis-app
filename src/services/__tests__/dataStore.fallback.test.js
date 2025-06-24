import dataStore from '../dataStore';

describe('dataStore localStorage fallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveSnapshot and getAllSnapshots use localStorage when indexedDB missing', async () => {
    const original = global.indexedDB;
    delete global.indexedDB;

    const snapshot = {
      date: '2024-01-01',
      funds: [{ Symbol: 'AAA' }],
      metadata: { fileName: 'test.xlsx' }
    };

    await dataStore.saveSnapshot(snapshot);
    const raw = localStorage.getItem('lightship-snapshots');
    const stored = JSON.parse(raw);
    expect(stored.length).toBe(1);
    expect(stored[0].funds[0].Symbol).toBe('AAA');

    const snaps = await dataStore.getAllSnapshots();
    expect(snaps.length).toBe(1);
    expect(snaps[0].funds[0].Symbol).toBe('AAA');

    global.indexedDB = original;
  });
});
