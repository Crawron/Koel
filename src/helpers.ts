/** Escape Discord formatting  */
export function escFmting(text: string | undefined) {
	return text?.replace(/[<>:*_~#@]/g, "\\$&") ?? "_none_"
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

/** Format a number to be two digits or more */
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

export function paginate<T>([...arr]: T[], itemsPerPage: number) {
	const pages: Page<T>[] = []

	const pageCount = Math.ceil(arr.length / itemsPerPage)
	for (let page = 0; page < pageCount; page++) {
		pages.push({
			index: page + 1,
			items: arr.splice(0, itemsPerPage),
			isLastPage: page === pageCount - 1,
			isFirstPage: page === 0,
		})
	}

	return { pages, pageCount }
}
type Page<T> = {
	index: number
	items: T[]
	isLastPage: boolean
	isFirstPage: boolean
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

export function cap(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

export function move<T>([...arr]: T[], from: number, to: number) {
	arr.splice(to, 0, ...arr.splice(from, 1))
	return arr
}

export function focusOn<T>([...items]: T[], pivot: number, radius: number) {
	const focusLength = radius * 2 + 1
	const start = Math.min(
		Math.max(0, pivot - radius),
		items.length - focusLength
	)

	return {
		startIndex: start,
		focusPivot: pivot - start,
		items: items.slice(start, start + focusLength),
	}
}

export function isTruthy<T>(
	thing: T | undefined | null | 0 | "" | false
): thing is T {
	return !!thing
}

export function safeJsonParse<T>(json: string): T | undefined {
	try {
		return JSON.parse(json)
	} catch {
		return undefined
	}
}

export function debounce<Args extends unknown[]>(
	timeout: number,
	callback: (...args: Args) => void
) {
	let id: NodeJS.Timer

	return (...args: Args) => {
		if (id) clearTimeout(id)
		id = setTimeout(() => callback(...args), timeout)
	}
}

export function cmdName(name: string) {
	return process.env.NODE_ENV === "production" ? name : `char-${name}`
}

export function randomItem<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)]
}
