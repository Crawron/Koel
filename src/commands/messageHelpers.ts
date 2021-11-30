import {
	buttonComponent,
	embedComponent,
	ReplyComponent,
} from "@itsmapleleaf/gatekeeper"
import { cap, fmtTime, isTruthy, paginate } from "../helpers"
import { Player } from "../modules/Player"
import { Queue } from "../modules/Queue"

export function messagefyQueue(
	queue: Queue,
	player: Player,
	page: number,
	onPageChange: (toPage: number) => void
): ReplyComponent[] {
	const nowPlaying = queue.current
	const upNext = paginate(queue.upcoming, 10)
	const pageIndex = cap(page, 1, upNext.pageCount) - 1

	const currentPage = upNext.pages[pageIndex]

	const remainingTime = Math.max(
		(nowPlaying ? (nowPlaying.duration ?? 0) - player.timer.time : 0) +
			queue.upcoming.reduce((p, c) => p + (c.duration ?? 0), 0),
		0
	)

	const uncertain = queue.upcoming.some((s) => !s.duration) ? "*" : ""

	let description = ""

	if (player.paused) description += "⏸️ "

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
			elapsedTime: player.timer.time,
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
						queue.upcoming.length || "No"
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
