import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../helpers"
import { getNowPlayingMessage } from "../messageHelpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("now-playing"),
		aliases: cmdName(["np"]),
		description: "Show currently playing song",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			ctx.reply(() => getNowPlayingMessage(queue))
		},
	})
}
