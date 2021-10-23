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
import { cap, move, parseTime, shuffle } from "./helpers"
import { log } from "./logging"
import { Song } from "./Song"
import { VoicePlayer } from "./VoicePlayer"

// export type Song = {
// 	title: string
// 	thumbnail: string
// 	author: string
// 	duration: number
// 	source: string
// 	requesterId: string
// }

export type RequestType = "Video" | "Playlist" | "PlaylistVideo" | "Query"

export class Queue {
	list: Song[] = []
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

	get status() {
		return this.coolPlayer.playStatus
	}

	get queuePosition() {
		return this._queuePosition
	}

	set queuePosition(value: number) {
		this._queuePosition = Math.max(Math.min(value, this.list.length), 0)
	}

	addToQueue(song: Song, position = this.list.length) {
		this.list.splice(position, 0, song)
	}

	moveSong(from: number, to: number) {
		from = cap(from, 0, this.upcomingSongs.length - 1)
		to = cap(to, 0, this.upcomingSongs.length - 1)

		const reSorted = move(this.upcomingSongs, from, to)
		this.list.splice(this.queuePosition + 1)
		this.list.push(...reSorted)
	}

	clearQueue() {
		this.list.splice(this._queuePosition + 1)
	}

	shuffle() {
		this.list.push(...shuffle(this.list.splice(this.queuePosition + 1)))
	}

	togglePlay() {
		if (this.coolPlayer.playStatus === "Paused") this.coolPlayer.resume()
		else if (this.coolPlayer.playStatus === "Playing") this.coolPlayer.pause()
	}

	get currentTime() {
		return this.coolPlayer.playedTime
	}

	private async setPlayStream() {
		const song = this.currentSong
		if (!song) return

		log(`Set stream to... ${bold(song.title)}`, 0)

		this.coolPlayer.setStream(await song.getOpusStream())
	}
}
