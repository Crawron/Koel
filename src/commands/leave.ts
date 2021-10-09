import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { destroyPlayer, tryGetPlayer } from "../playerHandler"

export const leaveCommand = defineSlashCommand({
	name: "leave",
	description: "Leave the current voice channel",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		destroyPlayer(ctx.guild?.id ?? "")
		ctx.reply(() => "_:wave:_")
	},
})
