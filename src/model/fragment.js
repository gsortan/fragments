// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const validateString = (key) => typeof key === 'string';

const validateNumber = (key) => typeof key === 'number';

const logger = require('../logger');

function uniqueId() {
  const uuid = crypto.randomUUID();
  return uuid;
}

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    logger.info({ id, ownerId, created, updated, type, size }, 'Creating new fragment instance');
    if (!(validateString(ownerId) && validateString(type))) {
      logger.error(`ownerId and type strings are required, got ownerId=${ownerId}, type=${type}`);
      throw new Error(
        `ownerId and type strings are required, got ownerId=${ownerId}, type=${type}`
      );
    }
    if (type !== 'text/plain' && type !== 'text/plain; charset=utf-8') {
      logger.error(`Type is invalid and not text/plain or text/plain; charset=utf-8`);
      throw new Error(`Type is invalid and not text/plain or text/plain; charset=utf-8 `);
    }

    if (!validateNumber(size)) {
      logger.error(`Size must be a number`);
      throw new Error(`Size must be a number`);
    }

    if (size < 0) {
      logger.error(`Size cannot be negative`);
      throw new Error(`Size cannot be negative`);
    }

    this.id = id || uniqueId();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || this.created;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    logger.info({ ownerId, expand }, 'Executing byUser function');
    return await listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    logger.info({ ownerId, id }, 'byId function is called');
    const result = await readFragment(ownerId, id);
    logger.debug({ result }, 'Result of read fragment call with ownerId and id');
    if (!result) {
      logger.error(`Fragment with id ${id} for ownerId ${ownerId} not found.`);
      throw new Error(`Fragment with id ${id} for ownerId ${ownerId} not found.`);
    }

    const fragment = new Fragment(result);
    logger.debug({ fragment }, 'Resultant fragment');

    return Promise.resolve(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    logger.info({ ownerId, id }, 'Deleting fragment with passed in parameters');
    return await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    logger.info('Executing save operation for fragment');
    this.updated = new Date().toISOString();

    const fragment = {
      ownerId: this.ownerId,
      id: this.id,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    };

    logger.debug({ fragment }, 'Updated fragment properties');
    return await writeFragment(fragment);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    logger.info(`Executing getData function with ownerId and id:${this.ownerId}${this.id}`);
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    logger.info({ data }, 'setData function execution with passed in data');
    if (!Buffer.isBuffer(data)) {
      logger.error('Data is not a buffer');
      throw new Error(`Data is not a buffer`);
    }

    this.size = data.length;

    this.updated = new Date().toISOString();

    logger.debug({ data }, 'Updated data');

    await writeFragmentData(this.ownerId, this.id, data);

    await this.save();

    return Promise.resolve();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    logger.info('Getting mimeType');
    const { type } = contentType.parse(this.type);
    logger.debug({ type });
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    logger.info('Executing is text function');
    logger.debug(`Mime type: ${this.mimeType}`);
    return this.mimeType === 'text/plain';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    logger.info('Getting formats');
    const keyType = this.mimeType;

    logger.debug(`Mime type:${keyType}`);

    const mappedConversions = new Map([
      ['text/plain', ['text/plain']],
      ['text/markdown', ['text/markdown', 'text/html', 'text/plain']],
      ['text/html', ['text/html', 'text/plain']],
      ['text/csv', ['text/csv', 'text/plain', 'application/json']],
      ['application/json', ['application/json', 'application/yaml', 'text/plain']],
      ['application/yaml', ['application/yaml', 'text/plain']],
      ['image/png', ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']],
      ['image/jpeg', ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']],
      ['image/webp', ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']],
      ['image/avif', ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']],
      ['image/gif', ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']],
    ]);

    return mappedConversions.get(keyType) || [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    logger.info('Is supported type function');
    if (value === 'text/plain' || value === 'text/plain; charset=utf-8') {
      return true;
    }
    return false;
  }
}

module.exports.Fragment = Fragment;
