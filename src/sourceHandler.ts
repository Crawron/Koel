import execa from "execa"
import ytdl from "ytdl-core"
import { safeJsonParse } from "./helpers"
import { RequestType } from "./Queue"

export async function* requestYtdl(request: string, searchLength = 1) {
	const ytdlProcess = execa("youtube-dl", [
		"--default-search",
		`ytsearch${searchLength}:`,
		"-f",
		"bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio/best[height<=480p]/worst",
		"-s",
		"--dump-json",
		request,
	])

	if (!ytdlProcess.stdout) throw new Error("youtube-dl process stdout is null")

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

/** *Part of* the metadata returned by youtube-dl using the `--dump-json` flag */
export type YtdlMetadata = {
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

export function checkRequestType(query: string): RequestType {
	const url = safeNewHttpUrl(query)
	if (!url) return "Query"

	if (!["www.youtube.com", "youtu.be", "youtube.com"].includes(url.host))
		return "Query"

	if (url.pathname === "/watch" && !!url.searchParams.get("list"))
		return "PlaylistVideo"

	if (url.pathname === "/playlist") return "Playlist"

	if (ytdl.validateURL(query)) return "Video"

	return "Query"
}

function safeNewHttpUrl(url: string) {
	try {
		const urlInstance = new URL(url)
		if (/^https?:$/.test(urlInstance.protocol)) return urlInstance
	} catch {
		return
	}
}
