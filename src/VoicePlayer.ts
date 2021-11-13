import {
	AudioPlayer,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import { makeAutoObservable } from "mobx"
import { log } from "./logging"
import { Song } from "./Song"
import { Timer } from "./Timer"

export type VoicePlayerStatus = "Playing" | "Paused" | "StandBy"

export class VoicePlayer {
	private connection: VoiceConnection | null = null
	private timer: Timer = new Timer()
	private song: Song | null = null
	private player: AudioPlayer

	isConnected = false
	playStatus: VoicePlayerStatus = "StandBy"

	constructor(public onIdle: () => void) {
		makeAutoObservable(this, { playedTime: false })

		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})

		this.player.on("stateChange", (oldState, newState) => {
			// log(`State changed: ${oldState.status} -> ${newState.status}`, 0)
			if (newState.status === "playing") {
				this.timer.time = newState.playbackDuration
			}

			if (oldState.status === "playing") {
				this.timer.time = oldState.playbackDuration
			}

			if (oldState.status === "buffering" && this.playStatus === "Paused") {
				this.pause()
			}

			if (newState.status === "idle") {
				this.song = null
				this.playStatus = "StandBy"
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
			this.isConnected = newState.status === "ready"
		})
	}

	disconnect() {
		if (this.connection) {
			this.connection.disconnect()
			this.connection.destroy()
			this.connection = null
		}
	}

	setSong(song: Song) {
		this.song = song
		if (this.playStatus === "Paused") this.pause()
		this.startStream()
	}

	async startStream() {
		log(`startStream ${this.playStatus}`, 0)
		if (!this.song) return

		this.timer.run()

		const resource = createAudioResource(await this.song.getOpusStream())

		this.player.play(resource)
		if (this.playStatus === "StandBy") this.playStatus = "Playing"
	}

	stop() {
		this.song = null
		this.player.stop()
		this.timer.pause()
		this.timer.reset()
		this.playStatus = "StandBy"
	}

	resume() {
		log(this.playStatus, 0)
		this.player.unpause()
		this.timer.run()
		this.playStatus = "Playing"
	}

	pause() {
		this.player.pause()
		this.timer.pause()
		this.playStatus = "Paused"
		log(`pause ${this.playStatus}`, 0)
	}

	/** Incomplete */
	seek(time: number) {
		this.timer.time = time
		// ToDo: Actually seek on the stream
	}

	get playedTime() {
		return this.timer.time
	}

	get voiceChannelId() {
		return this.connection?.joinConfig.channelId ?? undefined
	}

	get guildId() {
		return this.connection?.joinConfig.guildId ?? undefined
	}
}
