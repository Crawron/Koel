import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, sleep } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck, memberCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("rejoin"),
		description:
			"Rejoin the current voice channel. Use in case of audio crackling",
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			if (!memberCheck(ctx, ctx.member)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)
			const vc = ctx.guild.voiceStates.cache.get(ctx.member.id)?.channel

			if (!vc) {
				ctx.reply(() => `I'm not in a voice channel`)
				return
			}

			controller.player.disconnect()
			await sleep(500)
			controller.player.connect(vc)

			ctx.reply(() => `Rejoined <#${vc.id}>`)
		},
	})
}
