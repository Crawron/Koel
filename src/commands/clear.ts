import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export const clearCommand = defineSlashCommand({
	name: "clear",
	description: "Clear the queue",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		player.clearQueue()

		ctx.reply(() => "_Cleared_ :thumbsup:")
	},
})
