import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { escFmting, fmtTime, isNotNullish } from "../helpers"
import { tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
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
					author: { name: escFmting(currentSong.uploader ?? "") },
					title: escFmting(currentSong.title),
					url: currentSong.url,
					thumbnail: currentSong.thumbnail
						? { url: currentSong.thumbnail }
						: undefined,
					description: `**\`${fmtTime(player.currentTime)} / ${fmtTime(
						currentSong.duration
					)}\`** requested by <@${currentSong.requester}>`,
					fields: [
						currentSong.chapters && {
							name: `${currentSong.chapters.length} Chapters`,
							value: currentSong.getFormattedChapters(player.currentTime),
						},
					].filter(isNotNullish),
				})
			)
		},
	})
}
