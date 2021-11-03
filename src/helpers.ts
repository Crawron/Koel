import {
	buttonComponent,
	ButtonInteractionContext,
	SlashCommandInteractionContext,
} from "@itsmapleleaf/gatekeeper"
import { log, LogLevel } from "./logging"
import { Queue } from "./Queue"
import { Song } from "./Song"
import { tryGetQueue } from "./queueHandler"

/** Escape Discord formatting  */
export function escFmting(text: string | undefined) {
	return text?.replace(/[<>:*_~#@]/g, "$&") ?? "_none_"
}

/** Check if two numbers are close to each other by a certain margin */
export function closeNums(a: number, b: number, closeBy: number) {
	return Math.abs(a - b) <= closeBy
}

/** Takes a time string (hh:ss:mm) and returns its value in milliseconds */
export function parseTime(time: string) {
	const [seconds = 0, minutes = 0, hours = 0] = time
		.split(":")
		.map((n) => parseInt(n))
		.reverse()

	return ((hours * 60 + minutes) * 60 + seconds) * 1000
}

export const twoDigits = (n: number) => n.toString().padStart(2, "0")

/** Format milliseconds to human time */
export function fmtTime(time: number): string {
	const seconds = Math.floor(time / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)

	return (
		(hours ? hours + ":" : "") +
		(hours ? twoDigits(minutes % 60) : minutes % 60) +
		":" +
		twoDigits(seconds % 60)
	)
}

type Page<T> = { items: T[]; isLastPage: boolean; isFirstPage: boolean }
export function paginate<T>([...arr]: T[], itemsPerPage: number): Page<T>[] {
	const pages: Page<T>[] = []

	const pageCount = Math.ceil(arr.length / itemsPerPage)
	for (let page = 0; page < pageCount; page++) {
		pages.push({
			items: arr.splice(0, itemsPerPage),
			isLastPage: page === pageCount - 1,
			isFirstPage: page === 0,
		})
	}

	return pages
}

export const createPlayerCommandRun =
	<T extends SlashCommandInteractionContext>(
		callback: (ctx: T, player: Queue) => void | Promise<unknown>
	) =>
	async (ctx: T) => {
		const player = tryGetQueue(ctx)
		if (!player) return

		try {
			await callback(ctx, player)
		} catch (e) {
			log(e, LogLevel.Error)
		}
	}

/** Shuffle an array, duh. Modified from https://stackoverflow.com/a/2450976 */
export function shuffle<T>([...array]: T[]): T[] {
	let currentIndex = array.length,
		randomIndex

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex--

		const currentItem = array[currentIndex]
		const randomItem = array[randomIndex]
		if (currentItem != undefined) array[randomIndex] = currentItem
		if (randomItem != undefined) array[currentIndex] = randomItem
	}

	return array
}

export function getQueueAddedMessage(...songs: Song[]) {
	const songList = songs
		.map((song) => `[${escFmting(song.title)}](<${song.url}>)`)
		.join(", ")

	if (songList.length > 250) return `Queued ${songs.length} songs`
	else return `Queued ${songList}`
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

export function cap(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

export function move<T>([...arr]: T[], from: number, to: number) {
	arr.splice(to, 0, ...arr.splice(from, 1))
	return arr
}

export function focusOn<T>(arr: T[], pivot: number, radius: number) {
	const start = Math.max(pivot - radius, 0)

	return {
		items: arr.slice(start, Math.min(pivot + radius + 1, arr.length)),
		pivot: pivot - start,
	}
}

export function isTruthy<T>(
	thing: T | undefined | null | 0 | "" | false
): thing is T {
	return !!thing
}
