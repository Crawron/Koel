import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"
import { getNowPlayingMessage } from "../messageHelpers"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("now-playing"),
		aliases: cmdName(["np"]),
		description: "Display info on the current song",
		run: (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			const controller = controllerStore.getOrCreate(ctx.guild.id)

			ctx.reply(() => getNowPlayingMessage(controller))
		},
	})
}
