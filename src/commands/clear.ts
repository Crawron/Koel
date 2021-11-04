import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "clear",
		description: "Clear the queue",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			const deleted = queue.clearQueue()

			ctx.reply(() => `Cleared ${deleted.length} songs from the queue`)
		},
	})
}
