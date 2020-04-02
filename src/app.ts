import fs from 'fs';
import pino from 'pino';

import { WikiScraper } from './wiki-scraper';

const outputDir = 'output';
const logger = pino({
  prettyPrint: true,
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
});

function ensureOutputDirExists(): void {
  try {
    fs.mkdirSync(outputDir);
  } catch (error) {
    if (error.code === 'EEXIST') {
      logger.warn(`Output directory '${outputDir}' already exists.`);
    } else {
      throw error;
    }
  }
}

(async (): Promise<void> => {
  logger.info(`Starting scraping data from ${WikiScraper.wikiUrl}`);
  const wikiScraper = new WikiScraper();

  logger.info('Retrieving global functions');
  const globalFunctions = await wikiScraper.getGlobalFunctions();

  logger.info('Writing data to disk');
  ensureOutputDirExists();
  fs.writeFileSync('global-functions.json', JSON.stringify(globalFunctions, null, 2));
})();
