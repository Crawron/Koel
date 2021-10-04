import {
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	joinVoiceChannel,
	NoSubscriberBehavior,
} from "@discordjs/voice"
import {
	VoiceChannel,
	StageChannel,
	TextBasedChannels,
	Snowflake,
} from "discord.js"
import {
	autorun,
	IReactionDisposer,
	makeAutoObservable,
	runInAction,
} from "mobx"
import { Readable } from "stream"
import { raw } from "youtube-dl-exec"
import ytdl from "ytdl-core"
import ytpl from "ytpl"
import ytsr from "ytsr"
import { parseTime, shuffle } from "./helpers"
import { log, LogLevel } from "./logging"

export type Song = {
	title: string
	thumbnail: string
	author: string
	duration: number
	source: string
	requesterId: string
}

type RequestType = "Video" | "Playlist" | "PlaylistVideo" | "Query"

export class Player {
	queue: Song[] = []
	status: "Playing" | "Paused" | "StandBy" = "StandBy"
	private lastSeenPlaytime = 0
	private _queuePosition = 0

	private disposeCallbacks: IReactionDisposer[] = []

	private player = createAudioPlayer({
		behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
	})

	constructor(
		public voiceChannel: VoiceChannel | StageChannel,
		public textChannel: TextBasedChannels
	) {
		makeAutoObservable(this, { currentPlaytime: false })

		this.disposeCallbacks.push(
			// autorun(() => {
			// 	const { currentSong, queuePosition, currentPlaytime, queue, status } =
			// 		this
			// 	log(
			// 		{
			// 			status,
			// 			queuePosition,
			// 			currentPlaytime,
			// 			currentSongTitle: currentSong?.title,
			// 			queueLength: queue.length,
			// 		},
			// 		LogLevel.Debug
			// 	)
			// }),
			autorun(() => {
				if (this.status === "StandBy" && this.currentSong != undefined)
					runInAction(() => (this.status = "Playing"))
			}),
			autorun(() => {
				if (this.status === "Playing") {
					if (this.currentSong) this.playCurrent()
					else runInAction(() => (this.status = "StandBy"))
				}
			}),
			autorun(() => {
				if (!this.currentSong && this.status !== "StandBy") {
					runInAction(() => (this.status = "StandBy"))
					this.player.stop()
				}
			}),
			autorun(() => {
				if (this.currentSong) {
					this.textChannel.send(`Playing **${this.currentSong.title}**`)
				}
			})
		)

		this.player.on("stateChange", (oldState, newState) => {
			if (newState.status === oldState.status)
				log(`Changed to same state! ${oldState.status}`, LogLevel.Debug)

			if (newState.status === "playing")
				runInAction(() => (this.lastSeenPlaytime = newState.playbackDuration))

			if (oldState.status === "playing")
				runInAction(() => (this.lastSeenPlaytime = oldState.playbackDuration))

			const hasMostlyPlayed = true
			// this.currentPlaytime > (this.currentSong?.duration ?? 0 - 2000)

			if (
				oldState.status === "playing" &&
				newState.status === "idle" &&
				hasMostlyPlayed
			)
				this.queuePosition += 1
		})
	}

	destroy() {
		this.disposeCallbacks.forEach((cb) => cb())
	}

	private get voiceConnection() {
		return (
			getVoiceConnection(this.voiceChannel.guildId) ??
			joinVoiceChannel({
				guildId: this.voiceChannel.guildId,
				channelId: this.voiceChannel.id,
				adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: false,
			})
		)
	}

	get currentPlaytime() {
		// log(
		// 	{
		// 		playedDuration:
		// 			this.player.state.status === "playing" &&
		// 			this.player.state.playbackDuration,
		// 		seenDuration: this.lastSeenPlaytime,
		// 	},
		// 	LogLevel.Debug
		// )

		return this.player.state.status === "playing"
			? this.player.state.playbackDuration
			: this.lastSeenPlaytime
	}

	get upcomingSongs() {
		return this.queue.slice(this.queuePosition + 1)
	}

	get currentSong() {
		if (this.queuePosition <= this.queue.length - 1)
			return this.queue[this.queuePosition]
		else return undefined
	}

	get history() {
		return this.queue.slice(0, this.queuePosition)
	}

	get queuePosition() {
		return this._queuePosition
	}

	set queuePosition(value: number) {
		this._queuePosition = Math.max(Math.min(value, this.queue.length), 0)
	}

	addToQueue(...songs: Song[]) {
		this.queue.push(...songs)
		// log({ pushedToQueue: songs }, LogLevel.Debug)
	}

	clearQueue() {
		this.queue.splice(this._queuePosition + 1)
	}

	shuffle() {
		this.queue.push(...shuffle(this.queue.splice(this.queuePosition + 1)))
	}

	playCurrent() {
		const song = this.currentSong
		if (!song) return

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

		const resource = createAudioResource(audioReadable.stdout as Readable)

		this.voiceConnection.subscribe(this.player)
		this.player.play(resource)
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
