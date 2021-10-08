import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export const joinCommand = defineSlashCommand({
	name: "join",
	description: "Join a voice channel and change the active ",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return
		if (ctx.channel?.type !== "GUILD_TEXT") {
			ctx.reply(() => "Only in guilds")
			return
		}

		// player.setPlayerChannels({
		// 	voice: ctx.member?.voice.channel ?? undefined,
		// 	text: ctx.channel,
		// })

		ctx.reply(() => "Joined :thumbsup:")
	},
})
