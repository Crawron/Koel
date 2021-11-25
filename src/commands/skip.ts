import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../helpers"
import { getNowPlayingMessage } from "../messageHelpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("skip"),
		description: "Skip the current song",
		options: { count: { type: "INTEGER", description: "Skip multiple songs" } },
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return
			const count = ctx.options.count ?? 1

			ctx.reply(() => getNowPlayingMessage(queue))

			queue.queuePosition += count
		},
	})
}
