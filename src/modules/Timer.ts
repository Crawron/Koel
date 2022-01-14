/* Listen. I need something that can keep track of how much time has passed in very weird, whacky, strange, scenarios. There's a lot of time sensistive stuff in this project and for some reason none of the tools given to me actually are useful to keep track of anything, so I'm making my own */

import { nowSeconds } from "../helpers"
import { log, LogLevel } from "../logging"

export class Timer {
	private accumulatedTime = 0
	private startingTime: number | null = null

	/** Start counting time, or resume counting if paused */
	run() {
		log("Timer running", LogLevel.Debug)
		this.startingTime = nowSeconds()
	}

	/** Pause */
	pause() {
		log(`Timer paused at ${this.time}`, LogLevel.Debug)
		this.accumulatedTime = this.time
		this.startingTime = null
	}

	/** Reset timer to zero, keeps the timer running if it is */
	reset() {
		this.time = 0
	}

	get isRunning() {
		return this.startingTime != null
	}

	/** Elapsed time since first run, excluding paused time */
	get time() {
		return this.accumulatedTime + this.timeDelta
	}

	/** or arbitrarily set timer to a specific value. **In seconds** */
	set time(time: number) {
		this.accumulatedTime = time
		if (this.isRunning) this.startingTime = nowSeconds()
	}

	/** Time since the last time the timer started running */
	private get timeDelta() {
		if (!this.startingTime) return 0
		return nowSeconds() - this.startingTime
	}
}
