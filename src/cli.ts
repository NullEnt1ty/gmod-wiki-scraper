#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { WikiScraper } from "./wiki-scraper.js";
import { WikiApiClient } from "./wiki-api-client.js";
import logger from "./logger.js";

const argv = yargs(hideBin(process.argv))
	.usage("Usage: $0 [OPTIONS]")
	.options({
		"skip-global-functions": {
			boolean: true,
			describe: "Do not retrieve global functions",
		},
		"skip-classes": {
			boolean: true,
			describe: "Do not retrieve classes",
		},
		"skip-libraries": {
			boolean: true,
			describe: "Do not retrieve libraries",
		},
		"skip-hooks": {
			boolean: true,
			describe: "Do not retrieve hooks",
		},
		"skip-panels": {
			boolean: true,
			describe: "Do not retrieve panels",
		},
		"skip-enums": {
			boolean: true,
			describe: "Do not retrieve enums",
		},
		"skip-structs": {
			boolean: true,
			describe: "Do not retrieve structs",
		},
	})
	.parseSync();

const outputDir = "output";

function ensureOutputDirExists(): void {
	try {
		fs.mkdirSync(outputDir);
	} catch (error) {
		if (error.code === "EEXIST") {
			logger.info(`Output directory '${outputDir}' already exists.`);
		} else {
			throw error;
		}
	}
}

function writeToDisk(filename: string, data: any): void {
	fs.writeFileSync(
		path.join(outputDir, filename),
		JSON.stringify(data, null, 2),
	);
}

(async (): Promise<void> => {
	ensureOutputDirExists();

	const wikiApiClient = new WikiApiClient();
	const wikiScraper = new WikiScraper(wikiApiClient);

	logger.info(`Starting scraping data from ${WikiApiClient.wikiUrl}`);
	logger.info("This might take a few minutes so please be patient");

	if (argv.skipGlobalFunctions) {
		logger.info("Skipping global functions (1 / 7)");
	} else {
		logger.info("Retrieving global functions (1 / 7)");
		writeToDisk(
			"global-functions.json",
			await wikiScraper.getGlobalFunctions(),
		);
	}

	if (argv.skipClasses) {
		logger.info("Skipping classes (2 / 7)");
	} else {
		logger.info("Retrieving classes (2 / 7)");
		writeToDisk("classes.json", await wikiScraper.getClasses());
	}

	if (argv.skipLibraries) {
		logger.info("Skipping libraries (3 / 7)");
	} else {
		logger.info("Retrieving libraries (3 / 7)");
		writeToDisk("libraries.json", await wikiScraper.getLibraries());
	}

	if (argv.skipHooks) {
		logger.info("Skipping hooks (4 / 7)");
	} else {
		logger.info("Retrieving hooks (4 / 7)");
		writeToDisk("hooks.json", await wikiScraper.getHooks());
	}

	if (argv.skipPanels) {
		logger.info("Skipping panels (5 / 7)");
	} else {
		logger.info("Retrieving panels (5 / 7)");
		writeToDisk("panels.json", await wikiScraper.getPanels());
	}

	if (argv.skipEnums) {
		logger.info("Skipping enums (6 / 7)");
	} else {
		logger.info("Retrieving enums (6 / 7)");
		writeToDisk("enums.json", await wikiScraper.getEnums());
	}

	if (argv.skipStructs) {
		logger.info("Skipping structs (7 / 7)");
	} else {
		logger.info("Retrieving structs (7 / 7)");
		writeToDisk("structs.json", await wikiScraper.getStructs());
	}
})();
