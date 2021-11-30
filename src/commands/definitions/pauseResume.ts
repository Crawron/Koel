import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("pause"),
		aliases: cmdName(["resume"]),
		description: "Pause or resume the player",
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			if (controller.player.paused) controller.player.resume()
			else controller.player.pause()
		},
	})
}
