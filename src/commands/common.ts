import { SlashCommandInteractionContext } from "@itsmapleleaf/gatekeeper"
import { Guild, GuildMember, StageChannel, VoiceChannel } from "discord.js"

export function guildCheck(
	ctx: SlashCommandInteractionContext,
	guild: Guild | undefined
): guild is Guild {
	if (!guild) {
		ctx.reply(() => "This command can only be used in a guild")
		return false
	}
	return true
}

export function memberCheck(
	ctx: SlashCommandInteractionContext,
	member: GuildMember | undefined
): member is GuildMember {
	if (!member) {
		ctx.reply(() => "This command can only be used in a guild")
		return false
	}
	return true
}

export function voiceChannelCheck<T extends VoiceChannel | StageChannel>(
	ctx: SlashCommandInteractionContext,
	vc: T | undefined
): vc is T {
	if (!vc || !["GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(vc.type)) {
		ctx.reply(() => "You must be in a voice channel")
		return false
	}

	return true
}
