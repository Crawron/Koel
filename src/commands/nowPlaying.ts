import { defineSlashCommand, embedComponent } from "@itsmapleleaf/gatekeeper"
import { escFmting, fmtTime } from "../helpers"
import { tryGetPlayer } from "../playerHandler"

export const nowPlayingCommand = defineSlashCommand({
	name: "now-playing",
	description: "Show currently playing song",
	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		const currentSong = player.currentSong
		if (!currentSong) {
			ctx.reply(() => "Nothing's playing currently")
			return
		}

		ctx.reply(() =>
			embedComponent({
				author: { name: escFmting(currentSong.author) },
				title: escFmting(currentSong.title),
				url: currentSong.source,
				thumbnail: currentSong.thumbnail
					? { url: currentSong.thumbnail }
					: undefined,
				description: `**\`${fmtTime(player.currentTime)} / ${fmtTime(
					currentSong.duration
				)}\`** requested by <@${currentSong.requesterId}>`,
			})
		)
	},
})
