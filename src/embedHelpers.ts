import {
	buttonComponent,
	embedComponent,
	ReplyComponent,
} from "@itsmapleleaf/gatekeeper"
import {
	cap,
	escFmting,
	fmtTime,
	isTruthy,
	paginate,
	twoDigits,
} from "./helpers"
import { Queue } from "./Queue"
import { Song } from "./Song"

function formatSong(
	song: Song,
	{
		index,
		elapsedTime,
		link,
		bold,
		requester = true,
		uploader,
	}: {
		index?: number
		elapsedTime?: number
		bold?: boolean
		link?: boolean
		uploader?: boolean
		requester?: boolean
	} = {}
): string {
	let result = ""

	if (index != undefined) result += `\`${twoDigits(index)}\` `

	let title = escFmting(song.title)
	if (link) title = `[${title}](${song.url})`
	if (bold) title = `**${title}**`
	result += title

	if (uploader) result += ` *${song.uploader}*`

	const duration = [
		elapsedTime && fmtTime(elapsedTime),
		song.duration && fmtTime(song.duration),
	]
		.filter(isTruthy)
		.join(" / ")
	if (duration) result += ` \`${duration}\``

	if (requester) result += ` _<@${song.requester}>_`

	return result
}

export function createQueueMessage(
	queue: Queue,
	page: number,
	onPageChange: (toPage: number) => void
): ReplyComponent[] {
	const nowPlaying = queue.currentSong
	const upNext = paginate(queue.upcomingSongs, 10)
	const pageIndex = cap(page, 1, upNext.pageCount) - 1

	const currentPage = upNext.pages[pageIndex]

	const remainingTime =
		(nowPlaying ? nowPlaying.duration - queue.currentTime : 0) +
		queue.upcomingSongs.reduce((p, c) => p + c.duration, 0)

	let description = ""

	if (queue.status === "Paused") description += "⏸️ "

	if (!nowPlaying && !currentPage)
		return [
			embedComponent({
				color: 0x0774e6,
				description: description + "_Nothing's playin_",
			}),
		]

	if (nowPlaying)
		description += `**Now Playing**\n${formatSong(nowPlaying, {
			index: 0,
			bold: true,
			link: true,
			uploader: true,
			elapsedTime: queue.currentTime,
		})}\n\n`

	if (currentPage) {
		description += `**Up Next**\n`
		description += currentPage.items
			.map((song, i) => formatSong(song, { index: i + 1 + pageIndex * 10 }))
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
					} songs left  ·  Remaining runtime ${fmtTime(remainingTime)}`,
			},
		}),
		currentPage &&
			buttonComponent({
				label: "First",
				style: "SECONDARY",
				disabled: currentPage.isFirstPage,
				onClick: () => onPageChange(0),
			}),
		currentPage &&
			buttonComponent({
				emoji: "⬅️",
				label: "",
				style: "SECONDARY",
				disabled: currentPage.isFirstPage,
				onClick: () => onPageChange(pageIndex),
			}),
		currentPage &&
			buttonComponent({
				emoji: "➡️",
				label: "",
				style: "SECONDARY",
				disabled: currentPage.isLastPage,
				onClick: () => onPageChange(pageIndex + 2),
			}),
		currentPage &&
			buttonComponent({
				label: "Last",
				style: "SECONDARY",
				disabled: currentPage.isLastPage,
				onClick: () => onPageChange(upNext.pageCount),
			}),
	].filter(isTruthy)
}
