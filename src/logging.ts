import {
	bgBlueBright,
	bgRedBright,
	bgWhite,
	bgYellow,
	black,
	gray,
} from "chalk"

export enum LogLevel {
	Debug,
	Info,
	Warning,
	Error,
}

const levelText = {
	0: bgWhite` Dbg `,
	1: bgBlueBright` Inf `,
	2: bgYellow` Wrn `,
	3: bgRedBright` Err `,
}

export function log(message: unknown, level = LogLevel.Info): void {
	if (level < (process.env.LOGLEVEL ?? 1)) return

	const timestamp = new Date().toLocaleTimeString()

	if (level === LogLevel.Error)
		console.error(black(levelText[level]), gray(timestamp), message)
	else console.log(black(levelText[level]), gray(timestamp), message)
	// TODO log to discord channel
}
