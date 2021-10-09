import {
	buttonComponent,
	defineSlashCommand,
	embedComponent,
} from "@itsmapleleaf/gatekeeper"
import { escFmting, fmtTime, paginate } from "../helpers"
import { tryGetPlayer } from "../playerHandler"

export const queueCommand = defineSlashCommand({
	name: "queue",
	description: "List the queue",
	options: { page: { type: "INTEGER", description: "Queue page" } },
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		const itemsPerPage = 10

		const pageCount = Math.floor(player.queue.length / itemsPerPage) + 1
		let pageNumber = Math.min(
			Math.max(ctx.options.page ?? 1 - 1, 0),
			pageCount - 1
		)

		const nextSongs = player.queue.filter((_, i) => i > player.queuePosition)

		const nextSongsStr = nextSongs.map(
			(song, i) =>
				`**\`${i + 1}\`** ${escFmting(song.title)} \`${fmtTime(
					song.duration
				)}\` _<@${song.requesterId}>_`
		)

		const queuePages = paginate(nextSongsStr, itemsPerPage)

		const totalRuntime = fmtTime(nextSongs.reduce((p, c) => p + c.duration, 0))

		const current = player.currentSong

		const title = current
			? `Playing **${escFmting(current.title)}**`
			: "Song Queue"

		if (nextSongs.length < 1) {
			ctx.reply(() =>
				embedComponent({
					title,
					footer: { text: "The queue is empty..." },
				})
			)
			return
		}

		ctx.reply(() => {
			const currentPage = queuePages[pageNumber]
			if (!currentPage) return "Empty"

			return [
				embedComponent({
					title,
					thumbnail: current?.thumbnail
						? { url: current.thumbnail }
						: undefined,
					description: `${
						current
							? `\`${fmtTime(player.currentTime)} / ${fmtTime(
									current.duration
							  )}\` Uploaded by ${escFmting(current.author)}, requested by <@${
									current.requesterId
							  }>\n`
							: ""
					}${
						nextSongs.length || "No"
					} songs left. Total runtime **${totalRuntime}**`,
					fields: currentPage.items.join("\n")
						? [{ name: "Up next", value: currentPage.items.join("\n") }]
						: [],
					footer:
						pageCount > 1
							? { text: `Page ${pageNumber + 1} of ${pageCount}` }
							: undefined,
				}),
				pageCount > 1
					? [
							buttonComponent({
								emoji: "⬅️",
								label: "Previous",
								style: "SECONDARY",
								disabled: currentPage.isFirstPage,
								onClick: () => (pageNumber -= 1),
							}),
							buttonComponent({
								emoji: "➡️",
								label: "Next",
								style: "SECONDARY",
								disabled: currentPage.isLastPage,
								onClick: () => (pageNumber += 1),
							}),
					  ]
					: [],
			]
		})
	},
})
