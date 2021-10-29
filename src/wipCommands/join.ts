import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "join",
		description: "Join a voice channel and change the active ",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			ctx.reply(() => "Joined :thumbsup:")
		},
	})
}
