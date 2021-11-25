import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, fmtTime } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("seek"),
		description: "Seek to specific point in the song",
		options: {
			time: {
				type: "INTEGER",
				required: true,
				description:
					"Time to seek to in seconds (i know, i'll make it have a proper format later)",
			},
		},
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			queue.currentTime = ctx.options.time * 1000

			ctx.reply(() => `Seeked to \`${fmtTime(ctx.options.time * 1000)}\``)
		},
	})
}
