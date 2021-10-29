// import fetch from "node-fetch"
import execa from "execa"
import ytdl from "ytdl-core"
import { Snowflake } from ".pnpm/discord-api-types@0.22.0/node_modules/discord-api-types"
import { log } from "./logging"
import { escFmting, fmtTime, focusOn } from "./helpers"
import { ChapterData, SongData } from "@prisma/client"

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

	static fromData(data: SongData & { chapters: ChapterData[] }): Song {
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
						start_time: chapter.startTime,
					}))
					.sort((a, b) => a.start_time - b.start_time),
				thumbnail: data.thumbnail ?? undefined,
				uploader: data.uploader ?? undefined,
			},
			data.requester
		)
	}

	toData(
		position: number,
		queue: Snowflake
	): SongData & { chapters: ChapterData[] } {
		return {
			queueId: queue,
			title: this.title,
			url: this.url,
			mediaUrl: this.meta.url,
			source: this.source,
			duration: this.duration,
			thumbnail: this.thumbnail ?? null,
			uploader: this.uploader ?? null,
			chapters: this.chapters.map((ch, i) => ({
				id: `${this.url} ${i}`,
				title: ch.title,
				startTime: ch.startTime,
				songId: this.url,
				songDataUrl: this.url,
			})),
			requester: this.requester,
		}
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

export async function* requestYtdl(request: string) {
	const ytdlProcess = execa("youtube-dl", [
		"--default-search",
		"ytsearch",
		"-f",
		"bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio/best[height<=480p]/worst",
		"-s",
		"--dump-json",
		request,
	])

	if (!ytdlProcess.stdout) throw new Error("youtube-dl process stdout is null")

	for await (const data of ytdlProcess.stdout) {
		const json = JSON.parse(String(data))
		yield json as YtdlMetadata
	}
}
