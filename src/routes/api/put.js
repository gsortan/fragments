const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info('Fragment PUT update route');

    let fragment;
    try {
      fragment = await Fragment.byId(req.user, req.params.id);
    } catch (err) {
      logger.error(err.message);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const requestContentType = req.headers['content-type'];
    if (requestContentType !== fragment.type) {
      logger.error(`Content-Type mismatch: expected ${fragment.type}, got ${requestContentType}`);
      return res
        .status(400)
        .json(createErrorResponse(400, 'Content-Type does not match fragment type'));
    }
    await fragment.setData(req.body);

    res
      .setHeader('Content-Type', 'application/json')
      .status(200)
      .json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(`Error in PUT /fragments/${req.params.id}: ${error.message}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
