import { selectMenuComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { MessageSelectOptionData } from "discord.js"
import { cmdName, escFmting, fmtTime } from "../helpers"
import {
	accentButton,
	getQueueAddedMessage,
	grayButton,
} from "../messageHelpers"
import { tryGetQueue } from "../queueHandler"
import { Song } from "../Song"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("search"),
		description: "Search YouTube for a video then queue it",
		options: {
			query: { type: "STRING", description: "Search query", required: true },
		},
		async run(ctx) {
			const queue = tryGetQueue(ctx)
			if (!queue) return

			ctx.reply(() => "This command has been temporarily witheld for testing")

			// const { query } = ctx.options
			// const songs: Song[] = []

			// let selected: string[] = ["0"]

			// for await (const song of requestYtdl(query, 10))
			// 	songs.push(Song.fromYtdl(song, ctx.user.id))

			// const options = songs.map(
			// 	(video, i): MessageSelectOptionData => ({
			// 		label: video.title,
			// 		description: `[${fmtTime(video.duration)}] ${video.uploader}`,
			// 		value: i.toString(),
			// 	})
			// )

			// const selectedSongs: Song[] = []

			// const replyMessage = ctx.reply(() => {
			// 	if (selectedSongs.length < 1) {
			// 		return [
			// 			`**Results for \`${escFmting(query)}\`**`,
			// 			"> Pick songs to **Add to Queue**. _You can pick one or more \\💙_",
			// 			selectMenuComponent({
			// 				options,
			// 				maxValues: options.length,
			// 				selected,
			// 				onSelect: ({ values }) => (selected = values),
			// 			}),
			// 			accentButton("Add to Queue", () => {
			// 				selectedSongs.push(
			// 					...selected
			// 						.map((v) => songs[parseInt(v)])
			// 						.filter((song): song is Song => !!song)
			// 				)

			// 				for (const song of selectedSongs) queue.addToQueue(song)
			// 			}),
			// 			grayButton("Cancel", () => replyMessage.delete()),
			// 		]
			// 	} else {
			// 		return getQueueAddedMessage(selectedSongs, queue.upcomingSongs.length)
			// 	}
			// })
		},
	})
}
