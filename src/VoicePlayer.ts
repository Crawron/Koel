import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection,
} from "@discordjs/voice"
import { StageChannel, VoiceChannel } from "discord.js"
import {
	autorun,
	IReactionDisposer,
	makeAutoObservable,
	runInAction,
} from "mobx"
import { Readable } from "stream"
import { log } from "./logging"
import { Timer } from "./Timer"

export class VoicePlayer {
	private connection: VoiceConnection | null = null
	private dispatchCallbacks: IReactionDisposer[] = []
	private timer: Timer = new Timer()
	private audioStream: Readable | null = null
	private player: AudioPlayer

	isConnected = false
	playStatus: "Playing" | "Paused" | "Idle" = "Idle"

	constructor(
		public channel: VoiceChannel | StageChannel,
		public onIdle: () => void
	) {
		makeAutoObservable(this)

		this.player = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		})

		this.connect()

		this.player.on("stateChange", (oldState, newState) => {
			log({ old: oldState.status, new: newState.status }, 0)

			if (newState.status === "playing")
				runInAction(() => (this.timer.time = newState.playbackDuration))

			if (oldState.status === "playing")
				runInAction(() => (this.timer.time = oldState.playbackDuration))

			if (newState.status === "idle") {
				runInAction(() => {
					this.audioStream = null
					this.playStatus = "Idle"
					this.onIdle()
				})
			}
		})

		this.dispatchCallbacks.push(
			autorun(() => {
				log(this.playStatus, 0)

				if (this.playStatus === "Idle") {
					this.timer.pause()
					this.timer.reset()
				}

				if (this.playStatus === "Playing") {
					this.play()
					this.timer.run()
				}

				if (this.playStatus === "Paused") {
					this.pause()
					this.timer.pause()
				}
			})
		)
	}

	destroy() {
		if (this.connection) {
			this.connection.disconnect()
			this.connection.destroy()
			this.connection = null
		}
		this.dispatchCallbacks.forEach((cb) => cb())
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
			runInAction(() => (this.isConnected = newState.status === "ready"))
		})
	}

	playStream(stream: Readable) {
		runInAction(() => {
			this.audioStream = stream
			if (this.playStatus === "Idle") this.playStatus = "Playing"
		})
	}

	play() {
		if (!this.audioStream) return

		if (this.player.state.status === "paused") {
			this.player.unpause()
			return
		}

		const resource = createAudioResource(this.audioStream)
		this.player.play(resource)

		runInAction(() => (this.playStatus = "Playing"))
	}

	pause() {
		this.player.pause()

		runInAction(() => (this.playStatus = "Paused"))
	}

	get playedTime() {
		return this.timer.time
	}
}
