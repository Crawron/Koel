import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { shuffle } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "shuffle",
		description: "Shuffle the player queue",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			player.shuffle()

			ctx.reply(() => shuffle([..."Shuffled 👍"]).join(""))
		},
	})
}
