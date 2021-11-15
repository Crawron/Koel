import {
	buttonComponent,
	embedComponent,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import { createQueueMessage } from "../embedHelpers"
import { cap, escFmting, fmtTime, paginate } from "../helpers"
import { createQueue, tryGetQueue } from "../queueHandler"

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
