import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("clear"),
		description: "Clear the queue",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			const deleted = queue.clearQueue()

			ctx.reply(() => `Cleared ${deleted} songs from the queue`)
		},
	})
}
