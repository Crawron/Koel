import {
	buttonComponent,
	defineSlashCommand,
	selectMenuComponent,
} from "@itsmapleleaf/gatekeeper"
import { MessageSelectOptionData } from "discord.js"
import { escFmting, fmtTime } from "./helpers"
import { resolveQueueRequest, Song } from "./Queue"
import { tryGetPlayer } from "./playerHandler"

export const searchCommand = defineSlashCommand({
	name: "search",
	description: "Search YouTube for a video then queue it",
	options: {
		query: { type: "STRING", description: "Search query", required: true },
	},
	async run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		ctx.defer()

		const { query } = ctx.options
		const songs = await resolveQueueRequest(query, ctx.user.id, "Query")

		if (songs.length < 1) {
			ctx.reply(() => `Couldn't find anything for \`${query}\``)
			return
		}

		let selected: string[] = ["0"]

		const options = songs.map(
			(video, i): MessageSelectOptionData => ({
				label: video.title,
				description: `[${fmtTime(video.duration)}] ${video.author}`,
				value: i.toString(),
			})
		)

		const replyMessage = ctx.reply(() => [
			`**Results for \`${escFmting(query)}\`**`,
			"> Pick songs to **Add to Queue**. _You can pick one or more \\💙_",
			selectMenuComponent({
				options,
				maxValues: options.length,
				selected,
				onSelect: ({ values }) => (selected = values),
			}),
			buttonComponent({
				label: "Add to Queue",
				style: "PRIMARY",
				onClick: () => {
					const selectedSongs = selected
						.map((v) => songs[parseInt(v)])
						.filter((song): song is Song => !!song)

					player.addToQueue(...selectedSongs)

					ctx.reply(
						() =>
							`Added ${selectedSongs
								.map((v) => `**[${escFmting(v.title)}](<${v.source}>)**`)
								.join(", ")} to the queue`
					)
				},
			}),
			buttonComponent({
				label: "Cancel",
				style: "SECONDARY",
				onClick: () => replyMessage.delete(),
			}),
		])
	},
})
