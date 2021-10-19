import {
	SlashCommandInteractionContext,
	SlashCommandOptionConfigMap,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import { RequestType } from "../Queue"
import { tryGetPlayer } from "../playerHandler"
import { accentButton, getQueueAddedMessage, grayButton } from "../helpers"
import { requestYtdl, Song } from "../Song"
import { log } from "../logging"
import { checkRequestType } from "../sourceHandler"

const playCommandOptions = {
	song: { description: "Song to queue", type: "STRING", required: true },
} as const

const playCommandRun = async (
	ctx: SlashCommandInteractionContext<
		SlashCommandOptionConfigMap & typeof playCommandOptions
	>
) => {
	ctx.defer()

	const player = tryGetPlayer(ctx)
	if (!player) return

	const { song: request } = ctx.options

	let resolved = false
	let loading = false
	const songs: Song[] = []

	async function resolveRequest() {
		for await (const metadata of requestYtdl(request)) {
			log({ queued: metadata.title }, 0)
			const song = new Song(metadata, ctx.user.id)

			songs.push(song)
			player?.addToQueue(song)
		}

		resolved = true
		loading = false
		// if (reply) reply.refresh()
	}

	const reqType = checkRequestType(request)
	if (reqType !== "PlaylistVideo") await resolveRequest()

	const reply = ctx.reply(() => {
		if (loading) return "One sec..."
		if (!resolved)
			return [
				"This is part of a playlist. Should I queue the **entire playlist** or **just this one song**? *(i disabled this for a bit for testing)*",
				// accentButton("Entire playlist", async (ctx) => {
				// 	ctx.defer()
				// 	loading = true
				// 	resolveRequest("Playlist")
				// }),
				// accentButton("Just this one song", async (ctx) => {
				// 	ctx.defer()
				// 	loading = true
				// 	resolveRequest("Video")
				// }),
				// grayButton("Cancel", () => reply.delete()),
			]

		if (songs.length < 1) return "Failed to get any songs to add to queue"
		return getQueueAddedMessage(...songs)
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
