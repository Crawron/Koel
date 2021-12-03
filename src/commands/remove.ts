import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, escFmting } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("remove"),
		description: "Remove a song in queue",
		options: {
			position: {
				type: "INTEGER",
				description: "Which song to remove",
				required: true,
			},
		},
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			const { position } = ctx.options

			const removed = queue.removeSong(position)

			ctx.reply(() =>
				embedComponent({
					description: `Removed ${
						removed
							.map((song) => `[${escFmting(song.title)}](${song.pageUrl})`)
							.join(", ") || `...nothing`
					}`,
					color: 0x0773e6,
				})
			)
		},
	})
}
