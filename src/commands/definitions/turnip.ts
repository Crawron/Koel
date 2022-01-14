import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"
import { Song } from "../../modules/Song"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("turnip"),
		description: "turn up",
		options: {
			"media-url": {
				type: "STRING",
				description: "Override media url",
			},
		},
		run: async (ctx) => {
			ctx.defer()

			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			if (ctx.channel) controller.setLogsChannel(ctx.channel)

			controller.queue.add([
				new Song({
					title: "turnip turns up",
					pageUrl: "https://www.youtube.com/watch?v=tx2LXzM-Q2A",
					chapters: [],
					mediaUrl:
						ctx.options["media-url"] ??
						"https://cdn.discordapp.com/attachments/722981100762300427/915066449737969674/turnip.mp3",
					requester: ctx.user.id,
					source: "youtube",
					duration: 24,
					thumbnailUrl:
						"https://i.ytimg.com/vi_webp/tx2LXzM-Q2A/maxresdefault.webp",
					uploader: "zamsire",
				}),
			])

			ctx.reply(() => ":leafy_green:")
		},
	})
}
