import {
	SlashCommandInteractionContext,
	SlashCommandOptionConfigMap,
	Gatekeeper,
	embedComponent,
	ReplyHandle,
} from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"
import {
	accentButton,
	getQueueAddedMessage,
	grayButton,
} from "../messageHelpers"
import { Song } from "../Song"
import { checkRequestType } from "../sourceHandler"
import { cmdName } from "../helpers"
import { RequestType } from "../Queue"

const playCommandOptions = {
	song: { description: "Song to queue", type: "STRING", required: true },
	position: {
		description: "Where to add queue. If empty, add to the end",
		type: "INTEGER",
	},
} as const

const playCommandRun = async (
	ctx: SlashCommandInteractionContext<
		SlashCommandOptionConfigMap & typeof playCommandOptions
	>
) => {
	const queue = tryGetQueue(ctx)
	if (!queue) return

	const { song: request, position = queue.upcomingSongs.length + 1 } =
		ctx.options

	const addedSongs: Song[] = []

	const reqType = checkRequestType(request)

	let phase: "prompting" | "queuing" | "finished" =
		reqType === "PlaylistVideo" ? "prompting" : "queuing"

	async function processRequest(type: RequestType, replyHandle: ReplyHandle) {
		if (!queue) throw new Error("Queue is undefined")
		const result = queue.request(request, ctx.user.id, type, position)

		phase = "queuing"
		const interval = setInterval(() => replyHandle.refresh(), 2000)
		for await (const song of result) addedSongs.push(song)

		phase = "finished"
		clearInterval(interval)
		replyHandle.refresh()
	}

	const reply = ctx.reply(() => {
		if (phase === "prompting") {
			return [
				embedComponent({
					description:
						"This video belongs to a playlist, do you want me to queue **the whole playlist** or **just this one video**?",
					color: 0x0774e6,
				}),
				accentButton("The whole playlist", async (buttonCtx) => {
					buttonCtx.defer()
					processRequest("Playlist", reply)
				}),
				accentButton("Just this one video", async (buttonCtx) => {
					buttonCtx.defer()
					processRequest("Video", reply)
				}),
				grayButton("Cancel", async () => reply.delete()),
			]
		}

		if (phase === "queuing") {
			const songList = addedSongs
				.map((song, i) =>
					song.stringify({
						index: i + position,
						uploader: false,
						requester: false,
					})
				)
				.slice(-5)
				.join("\n")

			return [
				embedComponent({
					author: {
						name: "Queuing...",
						icon_url:
							"https://cdn.discordapp.com/emojis/675548186672234519.gif",
					},
					description: songList,
					color: 0x0774e6,
				}),
			]
		}

		if (phase === "finished") return getQueueAddedMessage(addedSongs, position)

		return [
			embedComponent({
				description: "<a:time:675548186672234519> _Hold on..._",
				color: 0x0774e6,
			}),
		]
	})

	if (reqType !== "PlaylistVideo") processRequest(reqType, reply)
}

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("play"),
		description: "Queue a song then playing",
		options: playCommandOptions,
		run: playCommandRun,
	})

	gatekeeper.addSlashCommand({
		name: cmdName("p"),
		description: "Alias to /play",
		options: playCommandOptions,
		run: playCommandRun,
	})
}
