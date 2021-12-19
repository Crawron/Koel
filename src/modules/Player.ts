import {
	AudioPlayer as DjsAudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	joinVoiceChannel,
	NoSubscriberBehavior,
	StreamType,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import { execaCommand } from "execa"
import { Song } from "./Song"
import { Timer } from "./Timer"

export class Player {
	private song: Song | null = null
	private audioResource: AudioResource | null = null

	paused = false
	timer = new Timer()
	retryCount = 0

	onError?: (error: unknown) => void
	onSongEnd?: () => void

	player: DjsAudioPlayer

	constructor(private guildId: string, public maxRetries = 3) {
		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})

		this.player.on("error", (error) => this.onError?.(error))

		this.player.on("stateChange", (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Playing) {
				if (this.paused) this.pause()
			}

			if (newState.status === AudioPlayerStatus.Paused) {
				if (!this.paused) this.resume()
			}

			if (newState.status === AudioPlayerStatus.AutoPaused) {
				this.timer.pause()
			}

			if (newState.status === AudioPlayerStatus.Idle) {
				this.timer.pause()

				if (!this.songEndedProperly()) {
					if (this.retryCount > maxRetries) {
						this.onError?.(
							new Error(
								`Failed to play ${this.song?.title} after several attempts`
							)
						)
						this.onSongEnd?.()
						return
					}

					this.runStream()
					return
				}

				this.setSong(null)
				this.onSongEnd?.()
			}
		})
	}

	songEndedProperly() {
		if (!this.song) return true
		if (!this.song.duration) return true

		return this.timer.time > this.song.duration - 5000
	}

	serialize() {
		return {
			timer: this.timer.time,
			paused: this.paused,
			retryCount: this.retryCount,
			maxRetries: this.maxRetries,
			djsPlayerState: this.player.state.status,
		}
	}

	get isIdle() {
		return this.song === null
	}

	get isConnected() {
		return this.voiceConnection != null
	}

	private get voiceConnection() {
		return getVoiceConnection(this.guildId)
	}

	setHandlers(handlers: {
		onError?: (error: unknown) => void
		onSongEnd?: () => void
	}) {
		if (handlers.onError) this.onError = handlers.onError
		if (handlers.onSongEnd) this.onSongEnd = handlers.onSongEnd
	}

	connect(channel: VoiceChannel | StageChannel) {
		const connection = joinVoiceChannel({
			adapterCreator: channel.guild.voiceAdapterCreator,
			channelId: channel.id,
			guildId: channel.guild.id,
			selfDeaf: false,
		})
		connection.subscribe(this.player)
	}

	/** @returns If disconnection was successful */
	disconnect() {
		return this.voiceConnection?.destroy() ?? false
	}

	resume() {
		if (!this.audioResource) this.runStream()
		this.timer.run()
		this.paused = false
		this.player.unpause()
	}

	pause() {
		this.timer.pause()
		this.paused = true
		this.player.pause()
	}

	togglePause() {
		if (this.paused) this.resume()
		else this.pause()
	}

	setSong(song: Song | null) {
		this.song = song

		this.audioResource = null
		this.retryCount = 0
		this.timer.pause()
		this.timer.reset()

		// TODO kill
		this.runStream()
	}

	private runStream() {
		if (!this.song) return
		this.retryCount += 1

		this.audioResource = this.getSongResource(this.song)
		this.player.play(this.audioResource)
		if (!this.pause) this.timer.run()
	}

	private getSongResource(song: Song) {
		const args = [
			"-hide_banner -loglevel error",
			`-ss ${this.timer.time / 1000}`, // seek
			`-i ${song.mediaUrl}`, // input
			`-analyzeduration 0`,
			"-ar 48000", // audio sample rate
			"-ac 2", // audio channels
			"-acodec libopus", // audio codec
			"-f opus", // output format
			"-", // output to stdout
		].join(" ")

		const process = execaCommand(`ffmpeg ${args}`, {
			buffer: true,
			windowsHide: false,
		})

		process.catch((error) => this.onError?.(error))

		if (!process.stdout) throw new Error("No stdout")
		return createAudioResource(process.stdout, {
			inputType: StreamType.OggOpus,
			inlineVolume: false,
		})
	}
}
