import {
	SlashCommandInteractionContext,
	SlashCommandOptionConfigMap,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"
import {
	accentButton,
	getQueueAddedMessage,
	grayButton,
} from "../messageHelpers"
import { Song } from "../Song"
import { checkRequestType, requestYtdl } from "../sourceHandler"
import { cmdName } from "../helpers"

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
	const player = tryGetQueue(ctx)
	if (!player) return

	ctx.defer()

	const { song: request, position = player.upcomingSongs.length + 1 } =
		ctx.options

	const addedSongs: Song[] = []

	let reqType = checkRequestType(request)

	async function resolveRequest(url = request) {
		if (!player) throw new Error("Missing player")
		if (!url) throw new Error("Missing request url")

		let queuingPosition = position + player.queuePosition

		for await (const metadata of requestYtdl(url)) {
			const song = Song.fromYtdl(metadata, ctx.user.id)

			addedSongs.push(song)
			player.addToQueue(song, queuingPosition)
			queuingPosition += 1
		}
	}

	if (reqType != "PlaylistVideo") {
		ctx.defer()
		await resolveRequest()
	}

	let loading = false

	const reply = ctx.reply(() => {
		if (loading) return "One sec..."

		if (reqType === "PlaylistVideo")
			return [
				"This video belongs to a playlist, do you want me to queue **the whole playlist** or **just this one video**?",
				accentButton("The whole playlist", async (buttonCtx) => {
					buttonCtx.defer()
					reqType = "Playlist"
					loading = true
					reply.refresh()
					await resolveRequest(
						request.replace(/v=[^&]+&/, "").replace("/watch", "/playlist")
					)
					loading = false
					reply.refresh()
				}),
				accentButton("Just this one video", async (buttonCtx) => {
					buttonCtx.defer()
					reqType = "Video"
					loading = true
					reply.refresh()
					await resolveRequest(request.replace(/&list=.*$/, ""))
					loading = false
					reply.refresh()
				}),
				grayButton("Cancel", async () => reply.delete()),
			]

		if (addedSongs.length < 1) return "Failed to get any songs to add to queue"
		return getQueueAddedMessage(addedSongs, position)
	})
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
