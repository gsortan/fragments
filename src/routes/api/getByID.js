/**
 * Get a fragment by ID for user
 */
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info('Get by id route');
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'Returned fragment meta data by Id');
    const fragData = await fragment.getData();
    logger.debug({ fragData }, 'Returned fragment data');

    res.setHeader('Content-Type', fragment.type);

    res.status(200).send(fragData);
  } catch (error) {
    logger.error(`Error getting by fragment ID:"${error.message}`);
    if (error.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, error.message));
    }

    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
