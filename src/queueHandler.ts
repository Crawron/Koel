import { SlashCommandInteractionContext } from "@itsmapleleaf/gatekeeper"
import { Snowflake, StageChannel, VoiceChannel } from "discord.js"
import { prismaDb } from "./clients"
import { Queue } from "./Queue"

const activeQueues = new Map<Snowflake, Queue>()

export async function loadQueues() {
	const queues = await prismaDb.queueData.findMany({
		include: { list: { include: { chapters: true } } },
	})

	for (const q of queues) activeQueues.set(q.id, Queue.fromData(q))
}

export async function saveQueue(queue: Queue) {
	const { list, ...queueData } = queue.toData()

	await prismaDb.queueData.upsert({
		where: { id: queueData.id },
		create: queueData,
		update: queueData,
	})

	for (const s of list) {
		const { chapters, ...songData } = s

		await prismaDb.songData.upsert({
			where: { url: songData.url },
			create: songData,
			update: songData,
		})

		for (const chapter of chapters) {
			await prismaDb.chapterData.upsert({
				where: { id: chapter.id },
				create: chapter,
				update: chapter,
			})
		}
	}
}

/** Does all the player command context checking logic and replies accordingly on error. Returns a Player object if successful. */
export function tryGetQueue(
	ctx: SlashCommandInteractionContext
): Queue | undefined {
	if (!ctx.guild || ctx.channel?.type !== "GUILD_TEXT") {
		ctx.reply(() => "This command is only available in guilds")
		return
	}

	if (!ctx.member?.voice.channel) {
		ctx.reply(() => "You must be in a voice channel to use this command")
		return
	}

	if (!ctx.channel) {
		ctx.reply(
			() =>
				"You seem to have not called this command from a text channel. I don't know how this is possible, and I don't think this reply will be seen by any eyes outside of the source code, but I *am* forced to make this check and reply regardless. Have a good one"
		)
		return
	}

	return activeQueues.get(ctx.guild.id) ?? createQueue(ctx.member.voice.channel)
}

export function destroyPlayer(guildId: Snowflake): boolean {
	activeQueues.get(guildId)?.destroy()
	return activeQueues.delete(guildId)
}

export function createQueue(voiceChannel: VoiceChannel | StageChannel) {
	const newQueue = new Queue(voiceChannel.guildId)
	newQueue.connect(voiceChannel)
	activeQueues.set(voiceChannel.guildId, newQueue)
	return newQueue
}
