import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export const skipCommand = defineSlashCommand({
	name: "skip",
	description: "Skip the current song",
	options: { count: { type: "INTEGER", description: "Skip multiple songs" } },
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return
		const count = ctx.options.count ?? 1

		ctx.reply(
			() =>
				`Skipping **${player.currentSong?.title}**${
					count > 1 ? ` and ${count - 1} more songs` : ""
				}...`
		)

		player.queuePosition += count
	},
})
