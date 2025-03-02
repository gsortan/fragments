// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.info('Get route for fragment');

  const expand = req.query.expand === '1';
  logger.debug({ expand });

  try {
    const data = await Fragment.byUser(req.user, expand);
    logger.debug({ data }, 'Data from byUser');

    const successResponse = createSuccessResponse({ fragments: data });
    res.status(200).json(successResponse);
  } catch (error) {
    logger.error(`Error retrieving user fragments: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
