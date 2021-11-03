// import { selectMenuComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
// import { MessageSelectOptionData } from "discord.js"
// import {
// 	accentButton,
// 	escFmting,
// 	fmtTime,
// 	getQueueAddedMessage,
// 	grayButton,
// } from "../helpers"
// import { tryGetQueue } from "../queueHandler"
// import { Song } from "../Song"

// export default function defineCommands(gatekeeper: Gatekeeper) {
// 	gatekeeper.addSlashCommand({
// 		name: "search",
// 		description: "Search YouTube for a video then queue it",
// 		options: {
// 			query: { type: "STRING", description: "Search query", required: true },
// 		},
// 		async run(ctx) {
// 			const player = tryGetQueue(ctx)
// 			if (!player) return

// 			ctx.defer()

// 			const { query } = ctx.options
// 			const songs = await Song.requestYtdl(query)

// 			let selected: string[] = ["0"]

// 			const options = songs.map(
// 				(video, i): MessageSelectOptionData => ({
// 					label: video.title,
// 					description: `[${fmtTime(video.duration)}] ${video.author}`,
// 					value: i.toString(),
// 				})
// 			)

// 			const selectedSongs: Song[] = []

// 			const replyMessage = ctx.reply(() => {
// 				if (selectedSongs.length < 1) {
// 					return [
// 						`**Results for \`${escFmting(query)}\`**`,
// 						"> Pick songs to **Add to Queue**. _You can pick one or more \\💙_",
// 						selectMenuComponent({
// 							options,
// 							maxValues: options.length,
// 							selected,
// 							onSelect: ({ values }) => (selected = values),
// 						}),
// 						accentButton("Add to Queue", () => {
// 							selectedSongs.push(
// 								...selected
// 									.map((v) => songs[parseInt(v)])
// 									.filter((song): song is Song => !!song)
// 							)

// 							player.addToQueue(...selectedSongs)
// 						}),
// 						grayButton("Cancel", () => replyMessage.delete()),
// 					]
// 				} else {
// 					return getQueueAddedMessage(...selectedSongs)
// 				}
// 			})
// 		},
// 	})
// }
