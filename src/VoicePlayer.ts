import {
	AudioPlayer,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import { Readable } from "stream"
import { Timer } from "./Timer"

export class VoicePlayer {
	private connection: VoiceConnection | null = null
	private timer: Timer = new Timer()
	private audioStream: Readable | null = null
	private player: AudioPlayer

	isConnected = false
	playStatus: "Playing" | "Paused" | "StandBy" = "StandBy"

	constructor(
		public channel: VoiceChannel | StageChannel,
		public onIdle: () => void
	) {
		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})

		this.connect()

		this.player.on("stateChange", (oldState, newState) => {
			if (newState.status === "playing")
				this.timer.time = newState.playbackDuration

			if (oldState.status === "playing")
				this.timer.time = oldState.playbackDuration

			if (newState.status === "idle") {
				this.audioStream = null
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

	connect() {
		if (this.connection) {
			this.connection.disconnect()
			this.connection.destroy()
			this.connection = null
		}

		this.connection = joinVoiceChannel({
			guildId: this.channel.guildId,
			channelId: this.channel.id,
			adapterCreator: this.channel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		})

		this.connection.subscribe(this.player)

		this.connection.on("stateChange", (_, newState) => {
			this.isConnected = newState.status === "ready"
		})
	}

	setStream(stream: Readable) {
		this.audioStream = stream
		if (this.playStatus === "StandBy") this.startStream()
	}

	startStream() {
		if (!this.audioStream) return

		this.timer.run()

		const resource = createAudioResource(this.audioStream)
		this.player.play(resource)
		this.playStatus = "Playing"
	}

	resume() {
		if (this.playStatus !== "Paused") return

		this.player.unpause()
		this.timer.run()
		this.playStatus = "Playing"
		return
	}

	pause() {
		if (this.playStatus === "Paused") return

		this.player.pause()
		this.timer.pause()
		this.playStatus = "Paused"
	}

	get playedTime() {
		return this.timer.time
	}
}
