import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { StageChannel, VoiceChannel } from "discord.js"
import { cmdName } from "../../helpers"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck, memberCheck, voiceChannelCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("join"),
		description: "Join a voice channel",
		options: {
			vc: {
				description:
					"The channel to join. If ommited, whichever channel you're on",
				type: "CHANNEL",
				channelTypes: ["GUILD_VOICE"],
			},
		},
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			if (!memberCheck(ctx, ctx.member)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)
			const vc =
				(ctx.options.vc as VoiceChannel | StageChannel | undefined) ??
				ctx.member.voice.channel ??
				undefined

			if (!voiceChannelCheck(ctx, vc)) return

			controller.player.connect(vc)

			ctx.reply(() => `Joined <#${vc.id}>`)
		},
	})
}
