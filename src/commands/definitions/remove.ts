import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("remove"),
		description: "Remove a song from the queue",
		options: {
			position: {
				type: "INTEGER",
				description:
					"Song to remove, by index in queue (or negative for history)",
				required: true,
			},
		},
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const removed = controller.queue.remove(ctx.options.position)

			ctx.reply(() => [
				embedComponent({
					color: 0x0773e6,
					description: `Removed **${removed
						.map((song) => song.title)
						.join(", ")}**`,
				}),
			])
		},
	})
}
