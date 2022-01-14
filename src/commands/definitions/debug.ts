import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { MessageAttachment } from "discord.js"
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
		run: async (ctx) => {
			if (ctx.user.id !== "109677308410875904") {
				ctx.ephemeralReply(() => "Craw only command")
				return
			}

			if (!guildCheck(ctx, ctx.guild)) return
			const guildId = ctx.options.guild || ctx.guild.id

			const controller = controllerStore.get(guildId)

			if (!controller) {
				ctx.ephemeralReply(() => `No controller found for \`${guildId}\``)
				return
			}

			ctx.ephemeralReply(() => ":)")

			const file = new MessageAttachment(
				Buffer.from(JSON.stringify(controller.serialize(), null, 2), "utf-8"),
				"controller.json"
			)

			const dm = await ctx.user.createDM()
			dm.send({ files: [file] })
		},
	})
}
