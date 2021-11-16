// import fetch from "node-fetch"
import execa from "execa"
import { Snowflake } from "discord.js"
import { escFmting, fmtTime, focusOn, safeJsonParse } from "./helpers"
import { SongData } from "./storage"

/** *Part of* the metadata returned by youtube-dl using the `--dump-json` flag */
type YtdlMetadata = {
	fulltitle?: string
	title: string
	url: string
	webpage_url: string
	extractor_key: string
	duration?: number
	chapters?: { title: string; start_time: number }[]
	thumbnail?: string
	uploader?: string
} & Record<string, unknown>

export class Song {
	constructor(private meta: YtdlMetadata, public requester: Snowflake) {}

	static fromData(data: SongData): Song {
		return new Song(
			{
				title: data.title,
				url: data.mediaUrl,
				webpage_url: data.url,
				extractor_key: data.source,
				duration: data.duration / 1000,
				chapters: data.chapters
					.map((chapter) => ({
						title: chapter.title,
						start_time: chapter.startTime / 1000,
					}))
					.sort((a, b) => a.start_time - b.start_time),
				thumbnail: data.thumbnail ?? undefined,
				uploader: data.uploader ?? undefined,
			},
			data.requester
		)
	}

	static async *requestYtdl(request: string) {
		const ytdlProcess = execa("youtube-dl", [
			"--default-search",
			"ytsearch",
			"-f",
			"bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio/best[height<=480p]/worst",
			"-s",
			"--dump-json",
			request,
		])

		if (!ytdlProcess.stdout)
			throw new Error("youtube-dl process stdout is null")

		let jsonString = Buffer.from([])

		for await (const data of ytdlProcess.stdout) {
			jsonString = Buffer.concat([jsonString, data])

			const validJson = safeJsonParse<YtdlMetadata>(jsonString.toString())

			if (validJson) {
				jsonString = Buffer.from([])
				yield validJson
			}
		}
	}

	toData(): SongData {
		const data: SongData = {
			title: this.title,
			url: this.url,
			mediaUrl: this.meta.url,
			source: this.source,
			duration: this.duration,
			thumbnail: this.thumbnail,
			uploader: this.uploader,
			chapters: this.chapters.map((ch) => ({
				title: ch.title,
				startTime: ch.startTime,
			})),
			requester: this.requester,
		}

		return data
	}

	get title() {
		return this.meta.fulltitle ?? this.meta.title
	}

	get duration() {
		return (this.meta.duration ?? 0) * 1000
	}

	get thumbnail() {
		return this.meta.thumbnail
	}

	get url() {
		return this.meta.webpage_url
	}

	get uploader() {
		return this.meta.uploader
	}

	get source() {
		return this.meta.extractor_key
	}

	get chapters() {
		return (
			this.meta.chapters?.map((chapter) => ({
				title: chapter.title,
				startTime: chapter.start_time * 1000,
			})) ?? []
		)
	}

	getFormattedChapters(currentTime: number, radius = 1) {
		if (!this.chapters) return "_none_"

		const pivot =
			this.chapters.length -
			1 -
			[...this.chapters].reverse().findIndex((chapter) => {
				return chapter.startTime <= currentTime
			})

		const chapters = focusOn(this.chapters, pivot, radius)

		return chapters.items
			.map((chapter, i) =>
				i === chapters.pivot
					? `**\`${fmtTime(chapter.startTime)}\` ${escFmting(chapter.title)}**`
					: `\`${fmtTime(chapter.startTime)}\` ${escFmting(chapter.title)}`
			)
			.join("\n")
	}

	async checkFreshness() {
		return true // pretend
		// const response = await fetch(this.meta.url, { method: "GET", size: 1 })
		// return response.ok && !!response.body
	}

	/** Can throw, though unlikely */
	async getOpusStream() {
		const process = execa("ffmpeg", [
			"-i",
			this.meta.url,
			"-f",
			"opus",
			"-v",
			"quiet",
			"-",
		])

		if (!process.stdout) throw Error("ffmpeg stdout is somehow null")
		return process.stdout
	}
}
