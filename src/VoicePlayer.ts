import {
	AudioPlayer,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	StreamType,
	VoiceConnection,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import execa from "execa"
import { makeAutoObservable } from "mobx"
import { fmtTime } from "./helpers"
import { Song } from "./Song"
import { Timer } from "./Timer"

export class VoicePlayer {
	private connection: VoiceConnection | null = null
	private timer: Timer = new Timer()
	private song: Song | null = null
	private player: AudioPlayer

	isConnected = false
	paused = false

	constructor(public onIdle: () => void) {
		makeAutoObservable(this, { playedTime: false })

		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})

		this.player.on("stateChange", (oldState, newState) => {
			if (oldState.status === "buffering" && this.paused) {
				this.pause()
			}

			if (newState.status === "idle") {
				this.song = null
				this.timer.pause()
				this.timer.reset()
				this.onIdle()
			}
		})
	}

	destroy() {
		if (this.connection) {
			this.connection.disconnect()
			this.connection.destroy()
			this.connection = null
		}
	}

	connect(channel: VoiceChannel | StageChannel) {
		this.disconnect()

		this.connection = joinVoiceChannel({
			guildId: channel.guildId,
			channelId: channel.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		})

		this.connection.subscribe(this.player)

		this.connection.on("stateChange", (_, newState) => {
			if (newState.status === "disconnected") this.disconnect()
			this.isConnected = newState.status === "ready"
		})
	}

	disconnect() {
		if (this.connection) {
			this.connection.destroy()
			this.connection = null
		}
	}

	setSong(song: Song) {
		this.song = song
		if (this.paused) this.pause()
		this.startStream()
	}

	seek(time: number) {
		this.timer.time = time
		this.startStream()
	}

	async startStream() {
		if (!this.song) return
		this.timer.run()

		const resource = createAudioResource(
			await this.getOpusStream(this.song.mediaUrl),
			{ inputType: StreamType.Opus, inlineVolume: false }
		)

		this.player.play(resource)
		this.paused = false
	}

	private async getOpusStream(url: string) {
		const seekTime = this.timer.time

		const process = execa("ffmpeg", [
			"-ss",
			fmtTime(seekTime),
			"-i",
			url,
			"-f",
			"opus",
			"-v",
			"quiet",
			"-",
		])

		if (!process.stdout) throw Error("ffmpeg stdout is somehow null")
		return process.stdout
	}

	resume() {
		this.player.unpause()
		this.timer.run()
		this.paused = false
	}

	pause() {
		this.player.pause()
		this.timer.pause()
		this.paused = true
	}

	get playedTime() {
		return this.timer.time
	}

	get voiceChannelId() {
		return this.connection?.joinConfig.channelId ?? undefined
	}
}
