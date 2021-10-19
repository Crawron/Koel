import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "join",
		description: "Join a voice channel and change the active ",
		run(ctx) {
			const player = tryGetPlayer(ctx)
			if (!player) return

			ctx.reply(() => "Joined :thumbsup:")
		},
	})
}
