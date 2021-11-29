import ytdl from "ytdl-core"
import { RequestType } from "./Queue"
import fetch from "node-fetch"

const ytdlServerPath = `http://localhost:${process.env.YTDL_PORT}/`

export async function requestYtdlServer(url: string, type: RequestType) {
	const params = new URLSearchParams()
	params.append("url", url)
	if (type === "Video") params.append("no_playlist", "1")

	const requestUrl = new URL(ytdlServerPath)
	requestUrl.search = params.toString()

	const response = await fetch(requestUrl.toString())
	const json = (await response.json()) as YtdlServerResponse

	return {
		...json,
	}
}

export type YtdlServerResponse = YtdlServerResults | YtdlServerPartialResults

export type YtdlServerPartialResults = {
	partial: true
	results: {
		partial: true
		page_url: string
		title?: string
		duration?: number
		uploader?: string
	}[]
}

export type YtdlServerResults = {
	partial: false
	results: {
		partial: false
		title: string
		media_url: string
		page_url: string
		thumbnail?: string
		duration?: number
		chapters: {
			start: number
			title: string
		}[]
		uploader?: string
		extractor: string
	}[]
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
