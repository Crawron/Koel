import { bold } from "chalk"
import {
	VoiceChannel,
	StageChannel,
	Snowflake,
	BaseGuildTextChannel,
} from "discord.js"
import { autorun, IReactionDisposer, makeAutoObservable } from "mobx"
import { Readable } from "stream"
import { raw } from "youtube-dl-exec"

import ytdl from "ytdl-core"
import ytpl from "ytpl"
import ytsr from "ytsr"
import { parseTime, shuffle } from "./helpers"
import { log } from "./logging"
import { VoicePlayer } from "./VoicePlayer"

export type Song = {
	title: string
	thumbnail: string
	author: string
	duration: number
	source: string
	requesterId: string
}

type RequestType = "Video" | "Playlist" | "PlaylistVideo" | "Query"

export class Queue {
	list: Song[] = []
	status: "Playing" | "Paused" | "StandBy" = "StandBy"
	private _queuePosition = 0

	private coolPlayer: VoicePlayer

	private disposeCallbacks: IReactionDisposer[] = []

	constructor(
		public voiceChannel: VoiceChannel | StageChannel,
		public textChannel: BaseGuildTextChannel
	) {
		makeAutoObservable(this)

		this.coolPlayer = new VoicePlayer(
			voiceChannel,
			() => (this.queuePosition += 1)
		)

		this.disposeCallbacks.push(
			autorun(() => {
				if (this.currentSong != null) this.setPlayStream()
			})
		)
	}

	destroy() {
		this.coolPlayer.destroy()
		this.disposeCallbacks.forEach((cb) => cb())
	}

	get upcomingSongs() {
		return this.list.slice(this.queuePosition + 1)
	}

	get currentSong() {
		if (this.queuePosition <= this.list.length - 1)
			return this.list[this.queuePosition]
		else return undefined
	}

	get history() {
		return this.list.slice(0, this.queuePosition)
	}

	get queuePosition() {
		return this._queuePosition
	}

	set queuePosition(value: number) {
		this._queuePosition = Math.max(Math.min(value, this.list.length), 0)
	}

	addToQueue(...songs: Song[]) {
		this.list.push(...songs)
	}

	clearQueue() {
		this.list.splice(this._queuePosition + 1)
	}

	shuffle() {
		this.list.push(...shuffle(this.list.splice(this.queuePosition + 1)))
	}

	get currentTime() {
		return this.coolPlayer.playedTime
	}

	private setPlayStream() {
		const song = this.currentSong
		if (!song) return

		log(`Set stream to... ${bold(song.title)}`, 0)

		// https://github.com/fent/node-ytdl-core/issues/994#issuecomment-906581288
		const audioReadable = raw(
			song.source,
			{
				o: "-",
				q: "",
				f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
				r: "100K",
			},
			{ stdio: ["ignore", "pipe", "ignore"] }
		)

		this.coolPlayer.playStream(audioReadable.stdout as Readable)
	}
}

function findBiggestThumbnailUrl([...thumbnails]: {
	url: string | null
	width: number
}[]): string | undefined {
	return (
		thumbnails.sort((tnA, tnB) => tnA.width - tnB.width).shift()?.url ??
		undefined
	)
}

export async function searchVideoQuery(query: string, limit = 25) {
	return (await ytsr(query, { limit })).items
		.filter((item): item is ytsr.Video => item.type === "video")
		.filter((video) => !video.isLive && !!video.duration)
}

export async function resolveQueueRequest(
	request: string,
	requester: Snowflake,
	type: RequestType
) {
	const requestTypes: Record<RequestType, () => Promise<Song[]>> = {
		Playlist: async () => {
			const results = (await ytpl(request, { limit: 5000 })).items.filter(
				(item) => !item.isLive
			)
			return results.map((r) => ({
				title: r.title,
				duration: parseTime(r.duration ?? "0"),
				requesterId: requester,
				thumbnail: r.bestThumbnail.url ?? "",
				author: r.author.name,
				source: r.shortUrl,
			}))
		},
		Video: async () => {
			try {
				const result = (await ytdl.getBasicInfo(request)).videoDetails
				return [
					{
						title: result.title,
						duration: parseInt(result.lengthSeconds ?? "0") * 1000,
						requesterId: requester,
						thumbnail: findBiggestThumbnailUrl(result.thumbnails) ?? "",
						author: result.author.name,
						source: result.video_url,
					},
				]
			} catch {
				return []
			}
		},
		PlaylistVideo: async () => {
			try {
				const result = (await ytdl.getBasicInfo(request)).videoDetails
				return [
					{
						title: result.title,
						duration: parseInt(result.lengthSeconds ?? "0") * 1000,
						requesterId: requester,
						thumbnail: findBiggestThumbnailUrl(result.thumbnails) ?? "",
						author: result.author.name,
						source: result.video_url,
					},
				]
			} catch {
				return []
			}
		},
		Query: async () => {
			const results = await searchVideoQuery(request)
			if (results.length < 1) return []

			return results.map((result) => ({
				title: result.title,
				duration: parseTime(result.duration ?? "0"),
				requesterId: requester,
				thumbnail: findBiggestThumbnailUrl(result.thumbnails) ?? "",
				author: result.author?.name ?? "",
				source: result.url,
			}))
		},
	}

	return requestTypes[type]()
}

export function checkRequestType(query: string): RequestType {
	const url = safeNewHttpUrl(query)
	if (!url) return "Query"
	if (!["www.youtube.com", "youtu.be"].includes(url.host)) return "Query"
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
