import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("pause"),
		description: "Pause playback",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			player.togglePlay()

			ctx.reply(() => `_${player.paused}_`)
		},
	})

	gatekeeper.addSlashCommand({
		name: cmdName("resume"),
		description: "Resume playback",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			player.togglePlay()

			ctx.reply(() => `_${player.paused}_`)
		},
	})
}
