import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "skip",
		description: "Skip the current song",
		options: { count: { type: "INTEGER", description: "Skip multiple songs" } },
		run(ctx) {
			const player = tryGetQueue(ctx)
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
}
