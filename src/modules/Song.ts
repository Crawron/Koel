import { Snowflake } from "discord.js"
import { escFmting, fmtTime, focusOn, isTruthy, twoDigits } from "../helpers"
import {
	requestYtdlServer,
	YtdlMetadata,
	YtdlServerResponse,
} from "../sourceHandler"

export class Song {
	title: string
	requester: Snowflake
	duration?: number
	thumbnailUrl?: string
	pageUrl: string
	mediaUrl: string
	uploader?: string
	source: string
	chapters: { title: string; start: number }[] = []

	constructor(options: {
		title: string
		requester: Snowflake
		duration?: number
		thumbnailUrl?: string
		pageUrl: string
		mediaUrl: string
		uploader?: string
		source: string
		chapters: { title: string; start: number }[]
	}) {
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

	static async fromServer(
		song: YtdlServerResponse["results"][number],
		requester: Snowflake
	): Promise<Song> {
		if (!song.partial) return new Song({ ...song, requester })

		const response = await requestYtdlServer(song.pageUrl, "Video")

		if (response.partial) throw new Error("Failed to get full metadata")
		if (!response.results[0]) throw new Error("Failed to get full metadata")

		return Song.fromServer(response.results[0], requester)
	}

	static fromYtdl(ytdlMeta: YtdlMetadata, requester: Snowflake): Song {
		const {
			title,
			fulltitle,
			duration = 0,
			thumbnail,
			uploader,
			url,
			webpage_url,
			extractor_key,
			chapters = [],
		} = ytdlMeta

		return new Song(
			fulltitle || title,
			requester,
			duration * 1000,
			thumbnail,
			webpage_url,
			url,
			uploader,
			extractor_key,
			chapters.map((chapter) => ({
				start: chapter.start_time * 1000,
				title: chapter.title,
			}))
		)
	}

	static fromStorage(data: SongStore): Song {
		const {
			title,
			chapters,
			duration,
			mediaUrl,
			requester,
			source,
			pageUrl: url,
			thumbnailUrl: thumbnail,
			uploader,
		} = data

		return new Song(
			title,
			requester,
			duration,
			thumbnail,
			url,
			mediaUrl,
			uploader,
			source,
			chapters
		)
	}

	toStore(): SongStore {
		const data: SongStore = {
			title: this.title,
			pageUrl: this.pageUrl,
			mediaUrl: this.mediaUrl,
			source: this.source,
			duration: this.duration,
			thumbnailUrl: this.thumbnailUrl,
			uploader: this.uploader,
			chapters: this.chapters,
			requester: this.requester,
		}

		return data
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
}

export type SongStore = {
	title: string
	mediaUrl: string
	pageUrl: string
	source: string
	duration: number
	thumbnailUrl?: string
	uploader?: string
	requester: Snowflake
	chapters: {
		title: string
		start: number
	}[]
}