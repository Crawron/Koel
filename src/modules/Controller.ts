import { TextBasedChannels } from "discord.js"
import { reaction } from "mobx"
import { log, LogLevel } from "../logging"
import { Player } from "./Player"
import { Queue } from "./Queue"

export class Controller {
	queue: Queue
	player: Player

	loggingChannel?: TextBasedChannels

	constructor(public guildId: string) {
		this.queue = new Queue()
		reaction(
			() => this.queue.current,
			(current) => {
				log(`Current song changed: ${current?.title}`, LogLevel.Debug)
				this.player.setSong(current ?? null)
			}
		)

		this.player = new Player(guildId)
		this.player.setHandlers({
			onSongEnd: () => this.queue.next(),
			onError: (error) => this.logToChannel(String(error), LogLevel.Error),
		})
	}

	serialize() {
		return {
			guildId: this.guildId,
			queue: this.queue.serialize(),
			player: this.player.serialize(),
		}
	}

	setLogsChannel(channel: TextBasedChannels) {
		this.loggingChannel = channel
	}

	logToChannel(message: string, level: LogLevel) {
		const color = {
			[LogLevel.Debug]: 0xc2c7ec,
			[LogLevel.Info]: 0x0773e6,
			[LogLevel.Warning]: 0xdcce22,
			[LogLevel.Error]: 0xed4245,
		}[level]

		this.loggingChannel?.send({
			embeds: [
				{
					color,
					description: message.slice(0, 2000),
				},
			],
		})
	}
}
