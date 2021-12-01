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
	AudioResource,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import { log, LogLevel } from "../logging"

export class Player {
	private _song: Song | null = null
	private audioResource: AudioResource | null = null

	paused = true
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
			// TODO: handle incomplete playback

			if (newState.status === AudioPlayerStatus.Playing) {
				if (this.paused) this.pause()
				else this.resume()
			}

			if (newState.status === AudioPlayerStatus.Paused) {
				if (!this.paused) this.resume()
				else this.pause()
			}

			if (newState.status === AudioPlayerStatus.AutoPaused) {
				this.timer.pause()
			}

			if (newState.status === AudioPlayerStatus.Idle) {
				this.timer.pause()
				this.timer.reset()
				this._song = null
				this.audioResource = null

				this.onSongEnd?.()
			}
		})
	}

	serialize() {
		return {
			timer: this.timer.time,
			paused: this.paused,
		}
	}

	get isIdle() {
		return this._song === null
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
		this.player.unpause()
		this.paused = false
	}

	pause() {
		this.timer.pause()
		this.player.pause()
		this.paused = true
	}

	togglePause() {
		if (this.paused) this.resume()
		else this.pause()
	}

	setSong(song: Song | null) {
		this._song = song
		if (!this.paused) this.runStream()
	}

	private async runStream() {
		if (!this._song) return

		while (this.retryCount <= this.maxRetries) {
			try {
				this.audioResource = await this.getSongResource(this._song)
				break
			} catch (error) {
				this.onError?.(error)
			}

			// TODO: refetch song media url
			this.retryCount += 1
		}
		this.retryCount = 0

		if (!this.audioResource) {
			this.onError?.(new Error("Failed to get stream"))
			return
		}

		this.player.play(this.audioResource)
	}

	private getSongResource(song: Song) {
		return new Promise<AudioResource>((resolve, reject) => {
			const args = [
				"-hide_banner -loglevel error",
				`-ss ${this.timer.time / 1000}`, // seek
				`-i ${song.mediaUrl}`, // input
				"-ar 48000", // audio sample rate
				"-ac 2", // audio channels
				"-acodec libopus", // audio codec
				"-f opus", // output format
				"-", // output to stdout
			].join(" ")

			let resolved = false

			const process = execa.command(`ffmpeg ${args}`, {
				buffer: true,
				windowsHide: false,
			})

			process.catch((error) => {
				if (resolved) {
					log(error.message, LogLevel.Error)
					return
				}
				resolved = true
				reject(error)
			})

			if (!process.stdout) throw new Error("No stdout")
			const resouce = createAudioResource(process.stdout, {
				inputType: StreamType.Arbitrary,
				inlineVolume: false,
			})

			process.stdout.on("data", () => {
				if (resolved) return
				resolved = true
				if (process.stdout) resolve(resouce)
			})
		})
	}
}
