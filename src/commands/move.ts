import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "move",
		description: "Move a song in queue to a different position",
		options: {
			from: {
				type: "INTEGER",
				description: "Which song to move",
				required: true,
			},
			to: {
				type: "INTEGER",
				description: "Where to move it to",
				required: true,
			},
		},
		run(ctx) {
			const player = tryGetPlayer(ctx)
			if (!player) return

			const { from, to } = ctx.options

			player.moveSong(from - 1, to - 1)

			ctx.reply(() => "_:thumbsup:_")
		},
	})
}