import { execa, ExecaChildProcess } from "execa"
import fetch from "node-fetch"
import { SongData } from "./Song"

class MediaServer {
	private process: ExecaChildProcess | null = null

	constructor() {
		this.startServer()
	}

	get isRunning() {
		return this.process != null
	}

	/** Start media server to begin accepting requests. Will restart if already running */
	startServer() {
		// TODO missing server error logs
		this.stopServer()

		this.process = execa("./media-server/env/bin/python", [
			"./meida-server/server.py",
		])
	}

	stopServer() {
		this.process?.kill()
		this.process = null
	}

	async request(
		query: string,
		options: { noPlaylist?: boolean; searchCount?: number } = {}
	) {
		const { noPlaylist = false, searchCount = 1 } = options

		// TODO dont hardcode port or host
		const serverUrl = new URL(`http://localhost:4863`)
		serverUrl.searchParams.set("query", query)
		serverUrl.searchParams.set("noPlaylist", noPlaylist ? "1" : "0")
		serverUrl.searchParams.set("searchCount", searchCount.toString())

		const response = await fetch(serverUrl.toString())

		return (await response.json()) as
			| MediaServerMetadataResponse
			| MediaServerErrorResponse
	}

	async *requestSeveral(requests: string[]) {
		for (const request of requests) {
			const response = await this.request(request)

			if ("error" in response) {
				throw new Error(response.error)
			}

			if (response.partial) {
				throw new Error("Partial response recieved when requesting several")
			}

			yield response
		}
	}

	async requestUrl(query: string) {
		// TODO dont hardcode port or host
		const serverUrl = new URL("http://localhost:4863/url")
		serverUrl.searchParams.set("query", query)
		serverUrl.searchParams.set("noPlaylist", "1")

		const response = await fetch(serverUrl.toString())

		return (await response.json()) as
			| MediaServerUrlResponse
			| MediaServerErrorResponse
	}
}

export type MediaServerMetadataResponse = {
	partial: boolean
	metadata: SongData[]
	raw: Record<string, unknown>
}

export type MediaServerUrlResponse = {
	url: string
}

export type MediaServerErrorResponse = {
	error: string
}

export const mediaServer = new MediaServer()
