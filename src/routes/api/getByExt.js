/**
 * Get a fragment metadata with ID
 */
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const markdownit = require('markdown-it');
const { createErrorResponse } = require('../../response');

const md = markdownit();

module.exports = async (req, res) => {
  try {
    logger.info('Conversion of fragment route');
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'Returned fragment meta data by Id');
    const fragData = await fragment.getData();
    let convertedData;

    res.setHeader('Content-Type', fragment.mimeType);
    logger.debug(req.params.ext);
    if (fragment.mimeType === 'text/markdown' && req.params.ext === 'html') {
      logger.info('Conversion of markdown to html');
      logger.debug(fragData);
      convertedData = md.render(fragData.toString());
      return res.status(200).send(convertedData);
    }

    return res.status(200).send(fragData);
  } catch (error) {
    logger.error(`Error getting by fragment ID:"${error.message}`);
    return res.status(404).json(createErrorResponse(404, error.message));
  }
};
