const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.info('Delete route for fragment');
  const id = req.params.id;
  const ownerId = req.user;

  try {
    await Fragment.delete(ownerId, id);

    const successResponse = createSuccessResponse();
    res.status(200).json(successResponse);
  } catch (error) {
    logger.error(`Error deleting user fragment: ${error.message}`);
    if (error.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, error.message));
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};
