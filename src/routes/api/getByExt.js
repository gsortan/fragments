/**
 * Fragment conversion with EXT here
 */
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const markdownit = require('markdown-it');
const { createErrorResponse } = require('../../response');

const md = markdownit();
const sharp = require('sharp');
const yaml = require('js-yaml');
const { parse } = require('csv-parse/sync');

const extToMime = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const validTypes = Object.keys(extToMime);

const validConversions = {
  'text/plain': ['txt'],
  'text/markdown': ['md', 'html', 'txt'],
  'text/html': ['html', 'txt'],
  'text/csv': ['csv', 'txt', 'json'],
  'application/json': ['json', 'yaml', 'yml', 'txt'],
  'application/yaml': ['yaml', 'txt', 'json'],
  'image/png': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/jpeg': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/webp': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/avif': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/gif': ['png', 'jpg', 'webp', 'gif', 'avif'],
};

module.exports = async (req, res) => {
  try {
    const ext = req.params.ext;

    if (!validTypes.includes(ext)) {
      logger.error(`Unsupported Content-Type received: ${req.params.ext}`);
      return res
        .status(415)
        .json(createErrorResponse(415, `Unsupported Content-Type received: ${req.params.ext}`));
    }

    logger.info('Conversion of fragment route');
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'Returned fragment meta data by Id');
    const fragData = await fragment.getData();

    const sourceType = fragment.mimeType;

    const isValid = validConversions[sourceType]?.includes(ext);
    if (!isValid) {
      logger.error(`Unsupported Content-Type received: ${req.params.ext}`);
      return res
        .status(415)
        .json(
          createErrorResponse(415, `Conversion from ${sourceType} to .${ext} is not supported`)
        );
    }

    const targetMime = extToMime[ext];
    res.setHeader('Content-Type', targetMime);

    if (fragment.isText || sourceType === 'application/json' || sourceType === 'application/yaml') {
      const text = fragData.toString();
      logger.debug(text);
      if (sourceType === 'text/csv' && ext === 'json') {
        const records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        return res.status(200).send(JSON.stringify(records, null, 2));
      }

      if (sourceType === 'text/markdown' && ext === 'html') {
        return res.status(200).send(md.render(text));
      }

      if (sourceType === 'application/yaml' && ext === 'json') {
        const parsed = yaml.load(text);
        return res.status(200).send(JSON.stringify(parsed, null, 2));
      }

      if (sourceType === 'application/json' && ['yaml', 'yml'].includes(ext)) {
        return res.status(200).send(yaml.dump(JSON.parse(text)));
      }

      return res.status(200).send(text);
    }

    logger.debug(req.params.ext);

    const sharpMethodMap = {
      jpg: 'jpeg',
      jpeg: 'jpeg',
      png: 'png',
      webp: 'webp',
      gif: 'gif',
      avif: 'avif',
    };

    if (
      !fragment.isText &&
      sourceType !== 'application/json' &&
      sourceType !== 'application/yaml'
    ) {
      const method = sharpMethodMap[ext];

      if (!method) {
        return res
          .status(415)
          .json(createErrorResponse(415, `Image conversion to .${ext} not supported`));
      }

      const converted = await sharp(fragData)[method]().toBuffer();
      return res.status(200).send(converted);
    }

    return res
      .status(415)
      .json(createErrorResponse(415, `Unsupported fragment type: ${sourceType}`));
  } catch (error) {
    logger.error(`Error converting fragment: ${error.message}`);
    return res.status(404).json(createErrorResponse(404, error.message));
  }
};
