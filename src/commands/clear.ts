import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "clear",
		description: "Clear the queue",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			player.clearQueue()

			ctx.reply(() => "_Cleared_ :thumbsup:")
		},
	})
}
