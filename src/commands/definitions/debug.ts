import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("debug"),
		description: "Print full info about a controller",
		options: {
			guild: {
				type: "STRING",
				description: "Guild ID",
			},
		},
		run: (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			const guildId = ctx.options.guild || ctx.guild.id

			const controller = controllerStore.get(guildId)

			if (!controller) {
				ctx.reply(() => `No controller found for \`${guildId}\``)
				return
			}

			ctx.reply(
				() =>
					`Controller for \`${guildId}\`:\n\`\`\`json\n${JSON.stringify(
						controller.serialize(),
						null,
						2
					)}\`\`\``
			)
		},
	})
}
