import chalk from "chalk"

export enum LogLevel {
	Debug,
	Info,
	Warning,
	Error,
}

const levelText = {
	0: chalk.bgWhite.black` Dbg `,
	1: chalk.bgBlueBright.black` Inf `,
	2: chalk.bgYellow.black` Wrn `,
	3: chalk.bgRedBright.black` Err `,
}

export function log(message: unknown, level = LogLevel.Info): void {
	if (level < (process.env.LOGLEVEL ?? 1)) return

	const timestamp = new Date().toLocaleTimeString()

	if (level === LogLevel.Error)
		console.error(levelText[level], chalk.gray(timestamp), message)
	else console.log(levelText[level], chalk.gray(timestamp), message)
	// TODO log to discord channel
}
