import {
	buttonComponent,
	embedComponent,
	Gatekeeper,
	ReplyHandle,
} from "@itsmapleleaf/gatekeeper"
import { cmdName, isTruthy, safeNewHttpUrl } from "../../helpers"
import {
	mediaServer,
	MediaServerMetadataResponse,
} from "../../modules/MediaServer"
import { Song } from "../../modules/Song"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"
import { getQueueAddedMessage } from "../messageHelpers"

const playCommandOptions = {
	song: { description: "Song to queue", type: "STRING", required: true },
	position: {
		description: "Where to add queue. If empty, add to the end",
		type: "INTEGER",
	},
} as const

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("play"),
		aliases: cmdName(["p"]),
		description: "Queue a song then play",
		options: playCommandOptions,
		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return

			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const { song: request, position } = ctx.options

			const discoveredSongs: MediaServerMetadataResponse["metadata"] = []
			const addedSongs: Song[] = []

			const ambiguousUrl = checkAmbiguous(request)

			const errors: string[] = []

			let phase: "prompting" | "queuing" | "finished" = ambiguousUrl
				? "prompting"
				: "queuing"

			async function processRequest(
				noPlaylist: boolean,
				replyHandle: ReplyHandle
			) {
				const response = await mediaServer.request(request, {
					noPlaylist,
					searchCount: 1,
				})

				phase = "queuing"
				const interval = setInterval(() => replyHandle.refresh(), 2000)

				if ("error" in response) {
					errors.push(response.error)
					phase = "finished"
					clearInterval(interval)
					replyHandle.refresh()
					return
				}

				discoveredSongs.push(...response.metadata)

				if (response.partial) {
					const responses = mediaServer.requestSeveral(
						response.metadata.map((song) => song.pageUrl)
					)

					for await (const response of responses) {
						if ("error" in response) {
							errors.push(
								`Error queueing \`${response.query}\`: ${response.error}`
							)
							continue
						}

						if (response.partial) {
							// Recursive???? It won't happen
							errors.push(
								`Error queueing \`${response.query}\`: Unexpected partial response. I'll handle this one properly one day`
							)
							continue
						}

						const [songData] = response.metadata

						if (!songData) {
							errors.push(
								`Error queueing \`${response.query}\`: Media server returned nothing`
							)
							continue
						}

						const song = new Song({ ...songData, requester: ctx.user.id })
						controller.queue.add([song], position)
						addedSongs.push(song)
					}
				} else {
					const [songData] = response.metadata

					if (!songData) {
						errors.push(
							`Error queueing \`${response.query}\`: Media server returned nothing`
						)
						phase = "finished"
						clearInterval(interval)
						replyHandle.refresh()
						return
					}

					const song = new Song({ ...songData, requester: ctx.user.id })
					controller.queue.add([song], position)
					addedSongs.push(song)
				}

				phase = "finished"
				clearInterval(interval)
				replyHandle.refresh()
			}

			if (ctx.member?.voice?.channel && !controller.player.isConnected)
				controller.player.connect(ctx.member.voice.channel)

			const reply = ctx.reply(() => {
				if (phase === "prompting") {
					return [
						embedComponent({
							description:
								"This video belongs to a playlist, do you want me to queue **the whole playlist** or **just this one video**?",
							color: 0x0774e6,
						}),
						buttonComponent({
							label: "The whole playlist",
							style: "PRIMARY",
							onClick: async (buttonCtx) => {
								buttonCtx.defer()
								processRequest(false, reply)
							},
						}),
						buttonComponent({
							label: "Just this one video",
							style: "SECONDARY",
							onClick: async (buttonCtx) => {
								buttonCtx.defer()
								processRequest(true, reply)
							},
						}),
						buttonComponent({
							label: "Cancel",
							style: "SECONDARY",
							onClick: async (buttonCtx) => {
								buttonCtx.defer()
								reply.delete()
							},
						}),
					]
				}

				if (phase === "queuing") {
					const songList = addedSongs
						.map((song, i) =>
							song.stringify({
								index: i + (position ?? controller.queue.upcoming.length + 1),
								uploader: false,
								requester: false,
							})
						)
						.slice(-5)
						.join("\n")

					return [
						embedComponent({
							author: {
								name: `Queuing...`,
								icon_url:
									"https://cdn.discordapp.com/emojis/675548186672234519.gif",
							},
							description: songList,
							color: 0x0774e6,
							footer: discoveredSongs.length
								? { text: `Found ${discoveredSongs.length}` }
								: undefined,
						}),
					]
				}

				if (phase === "finished")
					return [
						getQueueAddedMessage(
							addedSongs,
							position ?? controller.queue.upcoming.length + 1
						),
						errors.length > 0 &&
							embedComponent({
								author: { name: "There's been some issues" },
								color: 0xff3e50,
								description: errors.join("\n"),
								footer: { text: "Bother craw about these if they persist" },
							}),
					].filter(isTruthy)

				return [
					embedComponent({
						description: "<a:time:675548186672234519> _Hold on..._",
						color: 0x0774e6,
					}),
				]
			})

			if (!ambiguousUrl) processRequest(ambiguousUrl, reply)
		},
	})
}

function checkAmbiguous(query: string): boolean {
	const url = safeNewHttpUrl(query)
	if (!url) return false

	if (
		!["www.youtube.com", "youtu.be", "youtube.com"].includes(url.host) &&
		url.pathname === "/watch" &&
		url.searchParams.get("list")
	)
		return true

	return false
}
