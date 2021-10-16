import {
	SlashCommandInteractionContext,
	SlashCommandOptionConfigMap,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import {
	checkRequestType,
	RequestType,
	resolveQueueRequest,
	Song,
} from "../Queue"
import { tryGetPlayer } from "../playerHandler"
import { accentButton, getQueueAddedMessage, grayButton } from "../helpers"
import { log } from "../logging"

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

	async function resolveRequest(reqType: RequestType) {
		songs.push(...(await resolveQueueRequest(request, ctx.user.id, reqType)))
		if (reqType === "Query") songs.splice(1)

		if (!player) return
		player.addToQueue(...songs)

		resolved = true
		loading = false
		reply.refresh()
	}

	const reqType = checkRequestType(request)
	if (reqType !== "PlaylistVideo") await resolveRequest(reqType)

	const reply = ctx.reply(() => {
		if (loading) return "One sec..."
		if (!resolved)
			return [
				"This is part of a playlist. Should I queue the **entire playlist** or **just this one song**?",
				accentButton("Entire playlist", async (ctx) => {
					ctx.defer()
					loading = true
					resolveRequest("Playlist")
				}),
				accentButton("Just this one song", async (ctx) => {
					ctx.defer()
					loading = true
					resolveRequest("Video")
				}),
				grayButton("Cancel", () => reply.delete()),
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
