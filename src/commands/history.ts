import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"

export const historyCommand = defineSlashCommand({
	name: "history",
	description: "Show a history of previously played songs",
	run() {},
})
