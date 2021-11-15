import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "leave",
		description: "Leave the current voice channel",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			queue.disconnect()
			ctx.reply(() => "_:wave:_")
		},
	})
}
