import { pino } from "pino";

const logger = pino({
	base: null,
	timestamp: pino.stdTimeFunctions.isoTime,
	transport: {
		target: "pino-pretty",
	},
});

export default logger;
