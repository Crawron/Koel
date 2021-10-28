// import fetch from "node-fetch"
import execa from "execa"
import ytdl from "ytdl-core"
import { Snowflake } from ".pnpm/discord-api-types@0.22.0/node_modules/discord-api-types"
import { log } from "./logging"

/** *Part of* the metadata returned by youtube-dl using the `--dump-json` flag */
type YtdlMetadata = {
	fulltitle?: string
	title: string
	url: string
	webpage_url: string
	extractor_key: string
	duration?: number
	thumbnail?: string
	uploader?: string
} & Record<string, unknown>

export class Song {
	constructor(private meta: YtdlMetadata, public requester: Snowflake) {}

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
