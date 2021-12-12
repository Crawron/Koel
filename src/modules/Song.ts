import { Snowflake } from "discord.js"
import { escFmting, fmtTime, focusOn, isTruthy, twoDigits } from "../helpers"

export class Song {
	title: string
	requester: Snowflake
	duration?: number
	thumbnailUrl?: string
	pageUrl: string
	mediaUrl?: string
	uploader?: string
	source: string
	chapters: { title: string; start: number }[] = []

	constructor(options: SongData) {
		this.title = options.title
		this.requester = options.requester
		this.duration = options.duration
		this.thumbnailUrl = options.thumbnailUrl
		this.pageUrl = options.pageUrl
		this.mediaUrl = options.mediaUrl
		this.uploader = options.uploader
		this.source = options.source
		this.chapters = options.chapters
	}

	serialize(): SongData {
		return {
			title: this.title,
			chapters: this.chapters,
			duration: this.duration,
			mediaUrl: this.mediaUrl,
			requester: this.requester,
			source: this.source,
			pageUrl: this.pageUrl,
			thumbnailUrl: this.thumbnailUrl,
			uploader: this.uploader,
		}
	}

	getFormattedChapters(currentTime: number) {
		if (!this.chapters) return "_none_"

		const currentChapterIndex =
			this.chapters.findIndex((chapter) => chapter.start > currentTime) - 1

		const { items, focusPivot, startIndex } = focusOn(
			this.chapters,
			currentChapterIndex < 0 ? this.chapters.length - 1 : currentChapterIndex,
			2
		)

		return items
			.map((chapter, i) => {
				const text = `\`${twoDigits(i + startIndex + 1)}\` \`${fmtTime(
					chapter.start
				)}\` ${escFmting(chapter.title)}`

				return i === focusPivot ? `**${text}**` : text
			})
			.join("\n")
	}

	stringify({
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
	} = {}): string {
		let result = ""

		if (index != undefined) result += `\`${twoDigits(index)}\` `

		let title = escFmting(this.title)
		if (link) title = `[${title}](${this.pageUrl})`
		if (bold) title = `**${title}**`
		result += title

		if (uploader) result += ` *${this.uploader}*`

		const duration = [
			elapsedTime && fmtTime(elapsedTime),
			this.duration && fmtTime(this.duration),
		]
			.filter(isTruthy)
			.join(" / ")
		if (duration) result += ` \`${duration}\``

		if (requester) result += ` <@${this.requester}>`

		return result
	}

	async refetch() {
		// TODO hit ytdl to refetch the media url
		return this.mediaUrl
	}
}

export type SongData = {
	title: string
	mediaUrl?: string
	pageUrl: string
	source: string
	duration?: number
	thumbnailUrl?: string
	uploader?: string
	requester: Snowflake
	chapters: {
		title: string
		start: number
	}[]
}
