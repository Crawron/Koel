import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("leave"),
		description: "Leave the current voice channel",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			queue.disconnect()
			ctx.reply(() => "_:wave:_")
		},
	})
}
