/**
 * Get a fragment metadata with ID
 */
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info('Get by info by id');
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'Returned fragment meta data by Id');

    res.status(200).send(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error getting by fragment ID:"${error.message}`);
    return res.status(404).json(createErrorResponse(404, error.message));
  }
};
