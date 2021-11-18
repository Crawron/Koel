import { Snowflake } from "discord.js"
import { escFmting, fmtTime, focusOn, isTruthy, twoDigits } from "./helpers"
import { SongData } from "./storage"
import { YtdlMetadata } from "./sourceHandler"

export class Song {
	constructor(
		public title: string,
		public requester: Snowflake,
		public duration: number,
		public thumbnailUrl: string | undefined,
		public pageUrl: string,
		public mediaUrl: string,
		public uploader: string | undefined,
		public source: string,
		public chapters: { title: string; startTime: number }[] = []
	) {}

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
				startTime: chapter.start_time * 1000,
				title: chapter.title,
			}))
		)
	}

	static fromData(data: SongData): Song {
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

	toData(): SongData {
		const data: SongData = {
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
			this.chapters.findIndex((chapter) => chapter.startTime > currentTime) - 1

		const { items, focusPivot, startIndex } = focusOn(
			this.chapters,
			currentChapterIndex < 0 ? this.chapters.length - 1 : currentChapterIndex,
			2
		)

		return items
			.map((chapter, i) => {
				const text = `\`${twoDigits(i + startIndex + 1)}\` \`${fmtTime(
					chapter.startTime
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
