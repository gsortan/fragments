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
    logger.error(`Error deleting user fragment: Fragment not found`);
    if (error.message.includes('missing entry')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};
