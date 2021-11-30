import { reaction } from "mobx"
import { log, LogLevel } from "../logging"
import { Player } from "./Player"
import { Queue } from "./Queue"

export class Controller {
	queue: Queue
	// TODO: Idle pool
	player: Player

	constructor(guildId: string) {
		this.queue = new Queue()
		reaction(
			() => this.queue.current,
			(current) => {
				log(`Current song changed: ${current?.title}`, LogLevel.Debug)
				if (current) this.player.setSong(current)
			}
		)

		this.player = new Player(guildId)
		this.player.setHandlers({
			onSongEnd: () => this.queue.next(),
			onError: (error) => log(error, LogLevel.Error),
		})
	}

	serialize() {
		return {
			queue: this.queue.serialize(),
			player: this.player.serialize(),
		}
	}
}
