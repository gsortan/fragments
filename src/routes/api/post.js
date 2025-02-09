const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info('Fragment post route');

    if (!Buffer.isBuffer(req.body)) {
      throw new Error('Unsupported Content-Type');
    }

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    logger.debug({ baseUrl });
    const locationURL = `${baseUrl}/v1/fragments`;
    const type = req.headers['content-type'];

    const newFragment = new Fragment({ ownerId: req.user, type, size: req.body.length });
    logger.debug({ newFragment }, 'New fragment to create');

    await newFragment.save();
    await newFragment.setData(req.body);

    res
      .status(201)
      .location(`${locationURL}/${newFragment.id}`)
      .json(createSuccessResponse({ fragment: newFragment }));
  } catch (error) {
    logger.error(`Error in POST /fragments: ${error.message}`);

    res.status(415).json(createErrorResponse(415, error.message));
  }
};
