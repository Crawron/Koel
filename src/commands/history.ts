import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { fmtTime, twoDigits } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "history",
		description: "Show a history of previously played songs",
		run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return
			ctx.reply(() =>
				embedComponent({
					title: "Queue History",
					description: queue.history
						.map(
							(song, i) =>
								`\`${twoDigits(i + 1)}\` ${song.title} \`${fmtTime(
									song.duration
								)}\``
						)
						.join(`\n`),
				})
			)
		},
	})
}
