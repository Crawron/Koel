import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { destroyPlayer, tryGetPlayer } from "../playerHandler"

export const leaveCommand = defineSlashCommand({
	name: "leave",
	description: "Leave the current voice channel",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		if (!ctx.guild) {
			ctx.reply(() => "Guild only command")
			return
		}

		const result = destroyPlayer(ctx.guild.id)

		if (result) ctx.reply(() => "Bye lol")
		else ctx.reply(() => "Uhh... Somehow I couldn't do that, try again??")
	},
})
