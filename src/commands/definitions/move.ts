import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { twoDigits } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "move",
		description: "Move a song in the queue",
		options: {
			from: {
				type: "INTEGER",
				description:
					"Song to move, by index in queue (or negative for history)",
				required: true,
			},
			to: {
				type: "INTEGER",
				description:
					"Position to move to. Songs in that position will be pushed down",
				required: true,
			},
		},
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const moved = controller.queue.move(ctx.options.from, ctx.options.to)

			ctx.reply(() => [
				embedComponent({
					color: 0x0773e6,
					description: `Moved **${moved
						.map((song) => song.title)
						.join(", ")}** to \`${twoDigits(ctx.options.to)}\``,
				}),
			])
		},
	})
}
