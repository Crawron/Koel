import {
	SlashCommandInteractionContext,
	SlashCommandOptionConfigMap,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"
import { accentButton, getQueueAddedMessage, grayButton } from "../helpers"
import { requestYtdl, Song } from "../Song"
import { checkRequestType } from "../sourceHandler"

const playCommandOptions = {
	song: { description: "Song to queue", type: "STRING", required: true },
} as const

const playCommandRun = async (
	ctx: SlashCommandInteractionContext<
		SlashCommandOptionConfigMap & typeof playCommandOptions
	>
) => {
	const player = tryGetPlayer(ctx)
	if (!player) return

	const { song: request } = ctx.options

	const addedSongs: Song[] = []

	let reqType = checkRequestType(request)

	async function resolveRequest(url = request) {
		for await (const metadata of requestYtdl(url)) {
			const song = new Song(metadata, ctx.user.id)

			addedSongs.push(song)
			player?.addToQueue(song)
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
		return getQueueAddedMessage(...addedSongs)
	})
}

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "play",
		description: "Queue a song then playing",
		options: playCommandOptions,
		run: playCommandRun,
	})

	gatekeeper.addSlashCommand({
		name: "p",
		description: "Alias to /play",
		options: playCommandOptions,
		run: playCommandRun,
	})
}
