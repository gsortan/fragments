// Fix this path to point to your project's `memory-db.js` source file
const MemoryDB = require('../../src/model/data/memory/memory-db');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
  listFragments,
} = require('../../src/model/data/memory/index');

describe('memory-db', () => {
  let db;

  // Each test will get its own, empty database instance
  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() returns nothing', async () => {
    const result = await db.put('a', 'b', {});
    expect(result).toBe(undefined);
  });

  test('get() returns what we put() into the db', async () => {
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('put() and get() work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('get() with incorrect secondaryKey returns nothing', async () => {
    await db.put('a', 'b', 123);
    const result = await db.get('a', 'c');
    expect(result).toBe(undefined);
  });

  test('query() returns all secondaryKey values', async () => {
    await db.put('a', 'a', { value: 1 });
    await db.put('a', 'b', { value: 2 });
    await db.put('a', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  test('query() returns empty array', async () => {
    await db.put('b', 'a', { value: 1 });
    await db.put('b', 'b', { value: 2 });
    await db.put('b', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([]);
  });

  test('del() removes value put() into db', async () => {
    await db.put('a', 'a', { value: 1 });
    expect(await db.get('a', 'a')).toEqual({ value: 1 });
    await db.del('a', 'a');
    expect(await db.get('a', 'a')).toBe(undefined);
  });

  test('del() throws if primaryKey and secondaryKey not in db', () => {
    expect(() => db.del('a', 'a')).rejects.toThrow();
  });

  test('get() expects string keys', () => {
    expect(async () => await db.get()).rejects.toThrow();
    expect(async () => await db.get(1)).rejects.toThrow();
    expect(async () => await db.get(1, 1)).rejects.toThrow();
  });

  test('put() expects string keys', () => {
    expect(async () => await db.put()).rejects.toThrow();
    expect(async () => await db.put(1)).rejects.toThrow();
    expect(async () => await db.put(1, 1)).rejects.toThrow();
  });

  test('query() expects string key', () => {
    expect(async () => await db.query()).rejects.toThrow();
    expect(async () => await db.query(1)).rejects.toThrow();
  });

  test('del() expects string keys', () => {
    expect(async () => await db.del()).rejects.toThrow();
    expect(async () => await db.del(1)).rejects.toThrow();
    expect(async () => await db.del(1, 1)).rejects.toThrow();
  });
});

describe('Fragment operations', () => {
  function uniqueId() {
    const uuid = crypto.randomUUID();
    return uuid;
  }

  test('writeFragment() returns nothing ', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randomtest',
    };

    const result = await writeFragment(fragment);

    expect(result).toBeUndefined();
  });

  test('readFragment() returns what we stored in database with writeFragment()', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randmomtest',
    };

    await writeFragment(fragment);

    const result = await readFragment(fragment.ownerId, fragment.id);

    expect(result).toEqual(fragment);
  });

  test('readFragment() returns nothing when it is unable to find matching primary key', async () => {
    const result = await readFragment(uniqueId(), 'b');

    expect(result).toBeUndefined();
  });

  test('readFragment() with incorrect secondary key returns nothing', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randmomtest',
    };

    await writeFragment(fragment);

    const result = await readFragment(fragment.ownerId, 'incorrectKey');

    expect(result).toBeUndefined();
  });

  test('readFragment() expecting string keys', async () => {
    expect(async () => await readFragment().rejects().toThrow());
    expect(async () => await readFragment(1).rejects().toThrow());
    expect(async () => await readFragment(1, 1).rejects().toThrow());
  });

  test('writeFragmentData() returns nothing', async () => {
    const result = await writeFragmentData(uniqueId(), 'test', []);

    expect(result).toBeUndefined();
  });

  test('writeFragmentData() and readFragmentData() can put in raw data and retrieve buffer', async () => {
    const data = Buffer.from([1, 2, 3]);
    const uniqueID = uniqueId();
    await writeFragmentData(uniqueID, 'test', data);
    const result = await readFragmentData(uniqueID, 'test');
    expect(result).toEqual(data);
  });

  test('readFragmentData() and using non-existent primary key', async () => {
    const uniqueID = uniqueId();
    const result = await readFragmentData(uniqueID, 'test');
    expect(result).toBeUndefined();
  });

  test('readFragmentData() and wrong secondary key used', async () => {
    const data = Buffer.from([1, 2, 3]);
    const uniqueID = uniqueId();
    await writeFragmentData(uniqueID, 'test', data);
    const result = await readFragmentData(uniqueID, 'wrong');
    expect(result).toBeUndefined();
  });

  test('readFragmentData() expecting string keys', async () => {
    expect(async () => await readFragmentData().rejects().toThrow());
    expect(async () => await readFragmentData(1).rejects().toThrow());
    expect(async () => await readFragmentData(1, 1).rejects().toThrow());
  });

  test('listFragments() check if it gets empty array', async () => {
    const ownerId = uniqueId();
    const result = await listFragments(ownerId);

    expect(result).toEqual([]);
  });

  test('listFragments() should return an id with no expand', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randomtest',
    };

    await writeFragment(fragment);

    const result = await listFragments(fragment.ownerId);

    expect(result).toEqual(['randomtest']);
  });

  test('listFragments() should return an id with an expand', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randomtest',
    };
    const data = Buffer.from('this is a fragment');

    await writeFragment(fragment);
    await writeFragmentData(fragment.ownerId, fragment.id, data);

    const result = await listFragments(fragment.ownerId, true);

    expect(result).toEqual([{ ownerId: fragment.ownerId, id: 'randomtest' }]);
  });

  test('deleteFragmentData() using non-string keys', async () => {
    expect(async () => await deleteFragment().rejects().toThrow());
    expect(async () => await deleteFragment(1).rejects().toThrow());
    expect(async () => await deleteFragment(1, 1).rejects().toThrow());
  });

  test('deleteFragmentData() using non-existent keys', async () => {
    expect(async () => await deleteFragment('11111', '1111111').rejects().toThrow());
  });

  test('deleteFragment() successfully deletes a fragment', async () => {
    const fragment = {
      ownerId: uniqueId(),
      id: 'randomtest',
    };
    const data = Buffer.from('this is a fragment');

    await writeFragment(fragment);
    await writeFragmentData(fragment.ownerId, fragment.id, data);

    const storedResultFragment = await readFragment(fragment.ownerId, fragment.id);
    expect(storedResultFragment).toBeDefined();

    const storedResultData = await readFragmentData(fragment.ownerId, fragment.id);
    expect(storedResultData).toEqual(data);

    await deleteFragment(fragment.ownerId, fragment.id);

    const storedResultFragment2 = await readFragment(fragment.ownerId, fragment.id);
    expect(storedResultFragment2).toBeUndefined();
  });
});
