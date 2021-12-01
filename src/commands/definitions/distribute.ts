import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("distribute"),
		description:
			"Distribute upcoming songs in queue, so requests are spread even between requesters",
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)
			controller.queue.distribute((song) => song.requester)

			ctx.reply(() => "Distributed 👍")
		},
	})
}
