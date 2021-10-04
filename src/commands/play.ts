import { buttonComponent, defineSlashCommand } from "@itsmapleleaf/gatekeeper"
import { checkRequestType, resolveQueueRequest } from "../Player"
import { tryGetPlayer } from "../playerHandler"

export const playCommand = defineSlashCommand({
	name: "play",
	description: "Queue a song then playing",
	options: {
		song: { description: "Song to queue", type: "STRING", required: true },
	},
	async run(ctx) {
		ctx.defer()

		const player = tryGetPlayer(ctx)
		if (!player) return

		const { song: request } = ctx.options

		const reqType = checkRequestType(request)

		if (reqType === "PlaylistVideo") {
			const promptReply = ctx.reply(() => [
				"This is part of a playlist. Should I queue the **entire playlist** or **just this one song**?",
				buttonComponent({
					label: "Entire playlist",
					style: "PRIMARY",
					onClick: async () => {
						ctx.reply(() => "Aight, hold on...")

						const songs = await resolveQueueRequest(
							request,
							ctx.user.id,
							"Playlist"
						)

						if (songs.length < 1)
							return ctx.reply(() => "Failed to queue any of those")

						player.addToQueue(...songs)

						if (songs.length > 5)
							ctx.reply(() => `Queued **${songs.length}** songs...`)
						else
							ctx.reply(
								() =>
									`Queued ${songs
										.map((s) => `**[${s.title}](<${s.source}>)**`)
										.join(", ")}`
							)
					},
				}),
				buttonComponent({
					label: "Just this one song",
					style: "PRIMARY",
					onClick: async () => {
						const [song] = await resolveQueueRequest(
							request,
							ctx.user.id,
							"Video"
						)

						if (!song) {
							ctx.reply(() => `Failed to queue \`${request}\``)
							return
						}

						player.addToQueue(song)

						ctx.reply(() => `Queued **[${song.title}](<${song.source}>)**`)
					},
				}),
				buttonComponent({
					label: "Cancel",
					style: "SECONDARY",
					onClick: () => promptReply.delete(),
				}),
			])
			return
		}

		const songs = await resolveQueueRequest(request, ctx.user.id, reqType)
		if (reqType === "Query") songs.splice(1)

		if (songs.length < 1) {
			ctx.reply(() => `Failed to queue \`${request}\``)
			return
		}

		player.addToQueue(...songs)

		if (songs.length > 5) ctx.reply(() => `Queued **${songs.length}** songs...`)
		else
			ctx.reply(
				() =>
					`Queued ${songs
						.map((s) => `**[${s.title}](<${s.source}>)**`)
						.join(", ")}`
			)
	},
})
