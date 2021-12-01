import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cap, cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"
import { messagefyQueue } from "../messageHelpers"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("queue"),
		description: "View the current queue",
		aliases: ["q"],
		options: {
			page: {
				description: "Which page to view",
				type: "INTEGER",
			},
		},
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const upcomingPages = Math.ceil(controller.queue.upcoming.length / 10)
			let page = cap(ctx.options.page ?? 1, 1, upcomingPages)

			ctx.reply(() =>
				messagefyQueue(
					controller.queue,
					controller.player,
					page,
					(toPage) => (page = toPage)
				)
			)
		},
	})
}
