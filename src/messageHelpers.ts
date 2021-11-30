import {
	buttonComponent,
	ButtonInteractionContext,
	embedComponent,
	ReplyComponent,
} from "@itsmapleleaf/gatekeeper"
import { cap, escFmting, fmtTime, isTruthy, paginate } from "./helpers"
import { Queue } from "./Queue"
import { Song } from "./modules/Song"

export function getQueueAddedMessage(
	songs: Song[],
	addedPosition: number
): ReplyComponent[] {
	const songList = songs
		.slice(0, 5)
		.map((song, i) =>
			song.stringify({ link: true, index: addedPosition + i, requester: false })
		)
		.join("\n")

	const footer =
		songs.length > 5 ? { text: `And ${songs.length - 5} more...` } : undefined

	return [
		embedComponent({
			author: { name: "Added to queue" },
			description: `${songList}`,
			color: 0x0773e6,
			footer: footer,
		}),
	]
}

export function getNowPlayingMessage(queue: Queue): ReplyComponent[] {
	let description = ""

	if (queue.paused) description += "⏸️ "

	const song = queue.currentSong
	if (!song)
		return [
			embedComponent({
				color: 0x0774e6,
				description: description + "_Nothing's playin_",
			}),
		]

	if (song.uploader) description += `_${escFmting(song.uploader)}_`
	description += `\n**[${escFmting(song.title)}](${song.pageUrl})**`

	const duration = [
		queue.currentTime && fmtTime(queue.currentTime),
		(song.duration && fmtTime(song.duration)) || "??:??",
	]
		.filter(isTruthy)
		.join(" / ")
	if (duration) description += `\n\`${duration}\``

	description += ` _<@${song.requester}>_`

	return [
		embedComponent({
			description,
			thumbnail: { url: song.thumbnailUrl },
			color: 0x0774e6,
			fields: [
				song.chapters.length > 0 && {
					name: `${song.chapters.length} Chapters`,
					value: song.getFormattedChapters(queue.currentTime),
				},
			].filter(isTruthy),
		}),
	]
}

export function accentButton(
	label: string,
	callback: (ctx: ButtonInteractionContext) => void
) {
	return buttonComponent({ label, style: "PRIMARY", onClick: callback })
}

export function grayButton(
	label: string,
	callback: (ctx: ButtonInteractionContext) => void
) {
	return buttonComponent({ label, style: "SECONDARY", onClick: callback })
}
