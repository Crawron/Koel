import { ChapterData, QueueData, SongData } from "@prisma/client"
import { bold } from "chalk"
import { VoiceChannel, StageChannel, Snowflake } from "discord.js"
import {
	autorun,
	IReactionDisposer,
	Lambda,
	makeAutoObservable,
	observe,
	reaction,
	runInAction,
} from "mobx"
import { djsClient } from "./clients"
import { cap, move, shuffle } from "./helpers"
import { log } from "./logging"
import { saveQueue } from "./queueHandler"
import { Song } from "./Song"
import { VoicePlayer } from "./VoicePlayer"

export type RequestType = "Video" | "Playlist" | "PlaylistVideo" | "Query"

export class Queue {
	list: Song[] = []
	player: VoicePlayer
	private _queuePosition = 0

	private disposeCallbacks: (IReactionDisposer | Lambda)[] = []

	constructor(public guildId: Snowflake) {
		makeAutoObservable(this)

		this.player = new VoicePlayer(() => (this.queuePosition += 1))

		this.disposeCallbacks.push(
			reaction(
				() => [this.list, this.queuePosition, this.status],
				() => {
					log(`Saved queue for ${this.guildId}`, 0)
					saveQueue(this)
				}
			),
			autorun(() => {
				log(`${this.player.playStatus}`, 0)
				if (this.currentSong != null) this.setPlayStream()
				else this.player.stop()
			})
		)
	}

	static fromData(
		data: QueueData & { list: (SongData & { chapters: ChapterData[] })[] }
	) {
		const queue = new Queue(data.id)
		if (data.playerStatus === "Paused") queue.player.pause()

		if (data.voiceChannel) {
			const vc = djsClient.channels.cache.get(data.voiceChannel) as
				| VoiceChannel
				| undefined

			if (vc) queue.player.connect(vc)
		}

		runInAction(() => {
			queue.list = data.list.map((song) => Song.fromData(song))
			queue.queuePosition = data.queuePosition
		})

		return queue
	}

	toData(): QueueData & { list: (SongData & { chapters: ChapterData[] })[] } {
		const data: QueueData & {
			list: (SongData & { chapters: ChapterData[] })[]
		} = {
			id: this.guildId,
			playedTime: this.player.playedTime,
			playerStatus: this.player.playStatus,
			list: this.list.map((song, i) => song.toData(i, this.guildId)),
			queuePosition: this.queuePosition,
			voiceChannel: this.player.voiceChannelId ?? null,
		}

		return data
	}

	destroy() {
		this.player.destroy()
		this.disposeCallbacks.forEach((cb) => cb())
	}

	connect(voiceChannel: VoiceChannel | StageChannel) {
		this.player.connect(voiceChannel)
	}

	get isConnected() {
		return this.player.isConnected
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
		return this.player.playStatus
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
		if (this.player.playStatus === "Paused") this.player.resume()
		else if (this.player.playStatus === "Playing") this.player.pause()
	}

	get currentTime() {
		return this.player.playedTime
	}

	private async setPlayStream() {
		const song = this.currentSong
		if (!song) return
		this.player.setSong(song)

		log(`Set stream to... ${bold(song.title)}`, 0)
	}
}
