import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { escFmting, fmtTime, isTruthy } from "../helpers"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "now-playing",
		description: "Show currently playing song",
		run(ctx) {
			const player = tryGetQueue(ctx)
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
						currentSong.chapters.length > 0 && {
							name: `${currentSong.chapters.length} Chapters`,
							value: currentSong.getFormattedChapters(player.currentTime),
						},
					].filter(isTruthy),
				})
			)
		},
	})
}
