import { VoiceChannel, StageChannel, Snowflake } from "discord.js"
import {
	IReactionDisposer,
	Lambda,
	makeAutoObservable,
	reaction,
	runInAction,
} from "mobx"
import { djsClient } from "./clients"
import { cap, move, shuffle } from "./helpers"
import { Song } from "./Song"
import { deleteQueue, QueueData, saveQueue } from "./storage"
import { VoicePlayer } from "./VoicePlayer"

export type RequestType = "Video" | "Playlist" | "PlaylistVideo" | "Query"

export class Queue {
	list: Song[] = []
	player: VoicePlayer
	private _queuePosition = 0

	private disposeCallbacks: (IReactionDisposer | Lambda)[] = []

	constructor(public guildId: Snowflake) {
		makeAutoObservable(this)

		this.player = new VoicePlayer(() => {
			this.queuePosition += 1
			this.player.seek(0)
		})

		this.disposeCallbacks.push(
			reaction(
				() => this.player.isConnected,
				() => saveQueue(this.toData())
			),
			reaction(
				() => this.currentSong,
				(song) => {
					if (song != null) this.setPlayStream()
					else this.player.pause()
				}
			)
		)
	}

	destroy() {
		this.player.destroy()
		this.disposeCallbacks.forEach((cb) => cb())
		deleteQueue(this.guildId)
	}

	static fromData(data: QueueData) {
		const queue = new Queue(data.id)
		if (data.paused) queue.player.pause()

		if (data.voiceChannel) {
			const vc = djsClient.channels.cache.get(data.voiceChannel)
			if (vc) queue.player.connect(vc as VoiceChannel)
		}

		runInAction(
			() => (queue.list = data.list.map((song) => Song.fromData(song)))
		)
		queue.queuePosition = data.queuePosition
		queue.currentTime = data.playedTime

		return queue
	}

	toData(): QueueData {
		return {
			id: this.guildId,
			paused: this.player.paused,
			playedTime: this.player.playedTime,
			voiceChannel: this.player.voiceChannelId,
			queuePosition: this.queuePosition,
			list: this.list.map((song) => song.toData()),
		}
	}

	connect(voiceChannel: VoiceChannel | StageChannel) {
		this.player.connect(voiceChannel)
		saveQueue(this.toData())
	}

	disconnect() {
		this.player.disconnect()
		saveQueue(this.toData())
	}

	get isConnected() {
		return this.player.isConnected
	}

	get paused() {
		return this.player.paused
	}

	get upcomingSongs() {
		return this.list.slice(this.queuePosition + 1)
	}

	get currentSong() {
		// mobx yells at you if you try to access an array out of bounds
		if (this.queuePosition >= this.list.length) return undefined
		return this.list[this.queuePosition]
	}

	get history() {
		return this.list.slice(0, this.queuePosition)
	}

	get queuePosition() {
		return this._queuePosition
	}

	set queuePosition(value: number) {
		this._queuePosition = Math.max(Math.min(value, this.list.length), 0)
		saveQueue(this.toData())
	}

	addToQueue(song: Song, position = this.list.length) {
		this.list.splice(position, 0, song)
		saveQueue(this.toData())
	}

	moveSong(from: number, to: number) {
		from = cap(from, 0, this.upcomingSongs.length - 1)
		to = cap(to, 0, this.upcomingSongs.length - 1)

		const reSorted = move(this.upcomingSongs, from, to)
		this.list.splice(this.queuePosition + 1)
		this.list.push(...reSorted)
		saveQueue(this.toData())
	}

	removeSong(position: number) {
		position = cap(position, 1, this.upcomingSongs.length - 1)
		return this.list.splice(this.queuePosition + position, 1)
	}

	/** Returns deleted songs */
	clearQueue() {
		const deletedCount = this.list.splice(this._queuePosition + 1).length
		saveQueue(this.toData())
		return deletedCount
	}

	shuffle() {
		this.list.push(...shuffle(this.list.splice(this.queuePosition + 1)))
		saveQueue(this.toData())
	}

	togglePlay() {
		if (this.player.paused) this.player.resume()
		else this.player.pause()
		saveQueue(this.toData())
	}

	get currentTime() {
		return this.player.playedTime
	}

	set currentTime(time: number) {
		this.player.seek(time)
		saveQueue(this.toData())
	}

	private async setPlayStream() {
		const song = this.currentSong
		if (!song) return
		this.player.setSong(song)
	}
}
