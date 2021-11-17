import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { createQueueMessage } from "../messageHelpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "queue",
		description: "List the queue",
		options: { page: { type: "INTEGER", description: "Queue page" } },
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			let { page } = ctx.options

			ctx.reply(() =>
				createQueueMessage(queue, page ?? 0, (newPage) => (page = newPage))
			)
		},
	})
}
