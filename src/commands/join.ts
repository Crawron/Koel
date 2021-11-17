import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "join",
		description: "Join a voice channel and change the active ",
		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			if (!ctx.member?.voice.channel) {
				ctx.reply(() => "You must be in a voice channel to join")
				return
			}

			player.connect(ctx.member.voice.channel)
			ctx.reply(() => "Joined :thumbsup:")
		},
	})
}
