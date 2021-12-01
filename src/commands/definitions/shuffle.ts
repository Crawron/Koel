import { buttonComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, shuffle } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("shuffle"),
		description: "Shuffle upcoming songs in queue",
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)
			controller.queue.shuffle()

			ctx.reply(() => [
				shuffle([...`Shuffled 👍`]).join(""),
				buttonComponent({
					label: "Shuffle again",
					style: "SECONDARY",
					onClick: () => controller.queue.shuffle(),
				}),
			])
		},
	})
}
