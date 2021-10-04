import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { shuffle } from "../helpers"
import { tryGetPlayer } from "../playerHandler"

export const shuffleCommand = defineSlashCommand({
	name: "shuffle",
	description: "Shuffle the player queue",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		player.shuffle()

		ctx.reply(() => shuffle([..."Shuffled 👍"]).join(""))
	},
})
