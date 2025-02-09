const MemoryDB = require('./memory-db');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();
const logger = require('../../../logger');

// Write a fragment's metadata to memory db. Returns a Promise<void>
function writeFragment(fragment) {
  logger.info('WriteFragment function');
  // Simulate db/network serialization of the value, storing only JSON representation.
  // This is important because it's how things will work later with AWS data stores.
  const serialized = JSON.stringify(fragment);
  logger.debug(`Serialized:${serialized}`);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

// Read a fragment's metadata from memory db. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  logger.info('readFragment function');
  // NOTE: this data will be raw JSON, we need to turn it back into an Object.
  // You'll need to take care of converting this back into a Fragment instance
  // higher up in the callstack.
  const serialized = await metadata.get(ownerId, id);
  logger.debug(`Serialized:${serialized}`);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

// Write a fragment's data buffer to memory db. Returns a Promise
function writeFragmentData(ownerId, id, buffer) {
  logger.info('writeFragmentData function');
  return data.put(ownerId, id, buffer);
}

// Read a fragment's data from memory db. Returns a Promise
function readFragmentData(ownerId, id) {
  logger.info('readFragmentData function');
  return data.get(ownerId, id);
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  logger.info('listFragments function');
  const fragments = await metadata.query(ownerId);
  logger.debug({ fragments }, `Fragment list`);
  const parsedFragments = fragments.map((fragment) => JSON.parse(fragment));
  logger.debug({ parsedFragments }, 'Parsed Fragments');

  // If we don't get anything back, or are supposed to give expanded fragments, return
  if (expand || !fragments) {
    logger.info('return expanded fragments');
    return parsedFragments;
  }

  // Otherwise, map to only send back the ids
  return parsedFragments.map((fragment) => fragment.id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
function deleteFragment(ownerId, id) {
  logger.info('deleteFragment function');
  return Promise.all([
    // Delete metadata
    metadata.del(ownerId, id),
    // Delete data
    data.del(ownerId, id),
  ]);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
