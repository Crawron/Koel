import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"
import { getNowPlayingMessage } from "../messageHelpers"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("skip"),
		aliases: cmdName(["s"]),
		description: "Skip the current song",
		options: {
			amount: {
				type: "INTEGER",
				description:
					"Amount of songs to skip. Allows negative to go back in queue",
			},
		},
		run: (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			controller.queue.next(ctx.options.amount)

			ctx.reply(() => getNowPlayingMessage(controller))
		},
	})
}
