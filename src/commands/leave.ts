import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { destroyPlayer, tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "leave",
		description: "Leave the current voice channel",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			destroyPlayer(ctx.guild?.id ?? "")
			ctx.reply(() => "_:wave:_")
		},
	})
}
