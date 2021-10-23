import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "pause",
		description: "Pause playback",
		run(ctx) {
			const player = tryGetPlayer(ctx)
			if (!player) return

			player.togglePlay()

			ctx.reply(() => `_${player.status}_`)
		},
	})

	gatekeeper.addSlashCommand({
		name: "resume",
		description: "Resume playback",
		run(ctx) {
			const player = tryGetPlayer(ctx)
			if (!player) return

			player.togglePlay()

			ctx.reply(() => `_${player.status}_`)
		},
	})
}
