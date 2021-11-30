import { Timer } from "./Timer"
import { Song } from "./Song"
import execa from "execa"
import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	getVoiceConnection,
	AudioPlayer as DjsAudioPlayer,
	NoSubscriberBehavior,
	StreamType,
	AudioPlayerStatus,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import { log, LogLevel } from "../logging"

export class Player {
	private _song: Song | null = null
	paused = true
	timer = new Timer()
	retryCount = 0

	onError?: (error: Error) => void
	onSongEnd?: () => void

	player: DjsAudioPlayer

	constructor(private guildId: string, public maxRetries = 3) {
		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})
		this.player.on("error", (error) => this.onError?.(error))
		this.player.on("stateChange", (oldState, newState) => {
			// TODO: handle incomplete playback
			// TODO: handle autopause

			if (newState.status === AudioPlayerStatus.Idle) {
				this.timer.pause()
				this.timer.reset()
				this._song = null

				this.onSongEnd?.()
			}
		})
	}

	private get voiceConnection() {
		return getVoiceConnection(this.guildId)
	}

	setHandlers(handlers: {
		onError?: (error: Error) => void
		onSongEnd?: () => void
	}) {
		if (handlers.onError) this.onError = handlers.onError
		if (handlers.onSongEnd) this.onSongEnd = handlers.onSongEnd
	}

	setSong(song: Song | null) {
		this._song = song
		this.runStream()
	}

	get isIdle() {
		return this._song === null
	}

	get isConnected() {
		return this.voiceConnection != null
	}

	private getFfmpegStream(song: Song) {
		const args = [
			"-hide_banner -loglevel fatal",
			`-ss ${this.timer.time / 1000}`, // seek
			`-i ${song.mediaUrl}`, // input
			"-ar 48000", // audio sample rate
			"-ac 2", // audio channels
			"-acodec libopus", // audio codec
			"-f opus", // output format
			"-", // output to stdout
		].join(" ")

		const process = execa.command(`ffmpeg ${args}`)

		process.catch((data) => log(data, LogLevel.Error))

		return process.stdout ?? undefined
	}

	private runStream() {
		if (this.paused) return
		if (!this._song) return

		let stream = this.getFfmpegStream(this._song)
		while (this.retryCount <= this.maxRetries) {
			if (stream) break
			log(`Retrying stream for ${this._song.title}`, LogLevel.Warning)
			// TODO: refetch song media url
			stream = this.getFfmpegStream(this._song)
			this.retryCount += 1
		}
		this.retryCount = 0

		if (!stream) {
			log(`Failed to get stream for ${this._song.title}`, LogLevel.Error)
			throw new Error(`Couldn't get stream for ${this._song.title}`)
		}

		this.player.play(
			createAudioResource(stream, { inputType: StreamType.Arbitrary })
		)
	}

	pause() {
		this.timer.pause()
		this.paused = true
		this.player.pause()
	}

	resume() {
		this.timer.run()
		this.paused = false
		this.player.unpause()
	}

	joinChannel(channel: VoiceChannel | StageChannel) {
		const connection = joinVoiceChannel({
			adapterCreator: channel.guild.voiceAdapterCreator,
			channelId: channel.id,
			guildId: channel.guild.id,
			selfDeaf: false,
		})
		connection.subscribe(this.player)
	}
}
