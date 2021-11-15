import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue, destroyQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "destroy",
		description:
			"Completely murder the queue in this server, starting fresh. Use only when queue's completely broken",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			if (ctx.guild?.id) destroyQueue(ctx.guild.id)
			ctx.reply(() => "Destroyed queue for this server :knife:")
		},
	})
}
