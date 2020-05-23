#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { WikiScraper } from './wiki-scraper';
import { WikiApiClient } from './wiki-api-client';
import logger from './logger';

const outputDir = 'output';

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

  logger.info('Retrieving global functions (1 / 7)');
  const globalFunctions = await wikiScraper.getGlobalFunctions();

  logger.info('Retrieving classes (2 / 7)');
  const classes = await wikiScraper.getClasses();

  logger.info('Retrieving libraries (3 / 7)');
  const libraries = await wikiScraper.getLibraries();

  logger.info('Retrieving hooks (4 / 7)');
  const hooks = await wikiScraper.getHooks();

  logger.info('Retrieving panels (5 / 7)');
  const panels = await wikiScraper.getPanels();

  logger.info('Retrieving enums (6 / 7)');
  const enums = await wikiScraper.getEnums();

  logger.info('Retrieving structs (7 / 7)');
  const structs = await wikiScraper.getStructs();

  logger.info('Writing data to disk');
  ensureOutputDirExists();
  fs.writeFileSync(path.join(outputDir, 'global-functions.json'), JSON.stringify(globalFunctions, null, 2));
  fs.writeFileSync(path.join(outputDir, 'classes.json'), JSON.stringify(classes, null, 2));
  fs.writeFileSync(path.join(outputDir, 'libraries.json'), JSON.stringify(libraries, null, 2));
  fs.writeFileSync(path.join(outputDir, 'hooks.json'), JSON.stringify(hooks, null, 2));
  fs.writeFileSync(path.join(outputDir, 'panels.json'), JSON.stringify(panels, null, 2));
  fs.writeFileSync(path.join(outputDir, 'enums.json'), JSON.stringify(enums, null, 2));
  fs.writeFileSync(path.join(outputDir, 'structs.json'), JSON.stringify(structs, null, 2));
})();
