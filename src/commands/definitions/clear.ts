import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("clear"),
		description: "Clear all upcoming songs",
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const deleted = controller.queue.clear()

			ctx.reply(() => `Cleared ${deleted.length || "no"} songs`)
		},
	})
}
