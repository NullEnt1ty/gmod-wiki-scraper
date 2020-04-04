import fs from 'fs';
import path from 'path';
import pino from 'pino';

import { WikiScraper } from './wiki-scraper';
import { WikiApiClient } from './wiki-api-client';

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
  logger.info(`Starting scraping data from ${WikiApiClient.wikiUrl}`);
  logger.info('This might take a few minutes so please be patient');
  const wikiApiClient = new WikiApiClient();
  const wikiScraper = new WikiScraper(wikiApiClient);

  logger.info('Retrieving global functions');
  const globalFunctions = await wikiScraper.getGlobalFunctions();

  logger.info('Retrieving class functions');
  const classFunctions = await wikiScraper.getClassFunctions();

  logger.info('Retrieving library functions');
  const libraryFunctions = await wikiScraper.getLibraryFunctions();

  logger.info('Retrieving hook functions');
  const hookFunctions = await wikiScraper.getHookFunctions();

  logger.info('Retrieving panels');
  const panels = await wikiScraper.getPanels();

  logger.info('Writing data to disk');
  ensureOutputDirExists();
  fs.writeFileSync(path.join(outputDir, 'global-functions.json'), JSON.stringify(globalFunctions, null, 2));
  fs.writeFileSync(path.join(outputDir, 'class-functions.json'), JSON.stringify(classFunctions, null, 2));
  fs.writeFileSync(path.join(outputDir, 'library-functions.json'), JSON.stringify(libraryFunctions, null, 2));
  fs.writeFileSync(path.join(outputDir, 'hook-functions.json'), JSON.stringify(hookFunctions, null, 2));
  fs.writeFileSync(path.join(outputDir, 'panels.json'), JSON.stringify(panels, null, 2));
})();
