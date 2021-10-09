import { SlashCommandInteractionContext } from "@itsmapleleaf/gatekeeper"
import {
	BaseGuildTextChannel,
	Snowflake,
	StageChannel,
	VoiceChannel,
} from "discord.js"
import { Player } from "./Player"

const activePlayers = new Map<Snowflake, Player>()

/** Does all the player command context checking logic and replies accordingly on error. Returns a Player object if successful. */
export function tryGetPlayer(
	ctx: SlashCommandInteractionContext
): Player | undefined {
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

	return (
		findPlayer(ctx.guild.id) ??
		createPlayer(ctx.member.voice.channel, ctx.channel)
	)
}

export function destroyPlayer(guildId: Snowflake): boolean {
	activePlayers.get(guildId)?.destroy()
	return activePlayers.delete(guildId)
}

export function findPlayer(guildId: Snowflake): Player | undefined {
	return activePlayers.get(guildId)
}

export function createPlayer(
	voiceChannel: VoiceChannel | StageChannel,
	textChannel: BaseGuildTextChannel
) {
	const newPlayer = new Player(voiceChannel, textChannel)
	activePlayers.set(voiceChannel.guildId, newPlayer)
	return newPlayer
}
