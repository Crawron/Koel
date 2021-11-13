import { SlashCommandInteractionContext } from "@itsmapleleaf/gatekeeper"
import { Snowflake, StageChannel, VoiceChannel } from "discord.js"
import { Queue } from "./Queue"
import { QueueData } from "./storage"

const activeQueues = new Map<Snowflake, Queue>()

export function loadQueues(queues: QueueData[]) {
	for (const queue of queues) {
		const newQueue = Queue.fromData(queue)
		activeQueues.set(newQueue.guildId, newQueue)
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

	const queue = activeQueues.get(ctx.guild.id)
	if (queue) return queue

	if (!ctx.member?.voice.channel) {
		ctx.reply(() => "You must be in a voice channel to use this command")
		return
	}

	return createQueue(ctx.member.voice.channel)
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
