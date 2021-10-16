import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { destroyPlayer, tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "leave",
		description: "Leave the current voice channel",
		run(ctx) {
			const player = tryGetPlayer(ctx)
			if (!player) return

			destroyPlayer(ctx.guild?.id ?? "")
			ctx.reply(() => "_:wave:_")
		},
	})
}
