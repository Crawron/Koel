import ytdl from "ytdl-core"
import { RequestType } from "./Queue"

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
