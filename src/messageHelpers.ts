import {
	buttonComponent,
	ButtonInteractionContext,
	embedComponent,
	ReplyComponent,
} from "@itsmapleleaf/gatekeeper"
import { cap, escFmting, fmtTime, isTruthy, paginate } from "./helpers"
import { Queue } from "./Queue"
import { Song } from "./Song"

export function createQueueMessage(
	queue: Queue,
	page: number,
	onPageChange: (toPage: number) => void
): ReplyComponent[] {
	const nowPlaying = queue.currentSong
	const upNext = paginate(queue.upcomingSongs, 10)
	const pageIndex = cap(page, 1, upNext.pageCount) - 1

	const currentPage = upNext.pages[pageIndex]

	const remainingTime = Math.max(
		(nowPlaying ? nowPlaying.duration - queue.currentTime : 0) +
			queue.upcomingSongs.reduce((p, c) => p + c.duration, 0),
		0
	)

	const uncertain = queue.upcomingSongs.some((s) => !s.duration) ? "*" : ""

	let description = ""

	if (queue.paused) description += "⏸️ "

	if (!nowPlaying && !currentPage)
		return [
			embedComponent({
				color: 0x0774e6,
				description: description + "_Nothing's playin_",
			}),
		]

	if (nowPlaying)
		description += `**Now Playing**\n${nowPlaying.stringify({
			bold: true,
			link: true,
			uploader: true,
			elapsedTime: queue.currentTime,
		})}\n\n`

	if (currentPage) {
		description += `**Up Next**\n`
		description += currentPage.items
			.map((song, i) => song.stringify({ index: i + 1 + pageIndex * 10 }))
			.join("\n")
	}

	return [
		embedComponent({
			description,
			color: 0x0774e6,
			footer: {
				text:
					(upNext.pageCount > 1
						? `Page ${pageIndex + 1} of ${upNext.pageCount}  ·  `
						: "") +
					`${
						queue.upcomingSongs.length || "No"
					} songs left  ·  Remaining runtime ${fmtTime(
						remainingTime
					)}${uncertain}`,
			},
		}),
		currentPage &&
			upNext.pageCount > 1 &&
			buttonComponent({
				label: "First",
				style: "SECONDARY",
				disabled: currentPage.isFirstPage,
				onClick: () => onPageChange(0),
			}),
		currentPage &&
			upNext.pageCount > 1 &&
			buttonComponent({
				emoji: "⬅️",
				label: "",
				style: "SECONDARY",
				disabled: currentPage.isFirstPage,
				onClick: () => onPageChange(pageIndex),
			}),
		currentPage &&
			upNext.pageCount > 1 &&
			buttonComponent({
				emoji: "➡️",
				label: "",
				style: "SECONDARY",
				disabled: currentPage.isLastPage,
				onClick: () => onPageChange(pageIndex + 2),
			}),
		currentPage &&
			upNext.pageCount > 1 &&
			buttonComponent({
				label: "Last",
				style: "SECONDARY",
				disabled: currentPage.isLastPage,
				onClick: () => onPageChange(upNext.pageCount),
			}),
	].filter(isTruthy)
}

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
