import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"

export const pingCommand = defineSlashCommand({
	name: "ping",
	description: "Ping check",
	run(ctx) {
		ctx.reply(() => "Pong")
	},
})
