import pino from "pino";

const logger = pino({
	prettyPrint: true,
	base: null,
	timestamp: pino.stdTimeFunctions.isoTime,
});

export = logger;
