export class Timer {
	private countedTime = 0
	private startedAt = 0
	timeout: NodeJS.Timeout | null = null

	constructor(
		/**In milliseconds*/ private _length: number,
		public onEnd: () => void
	) {}

	set length(milliseconds: number) {
		this._length = milliseconds
	}

	private setupTimeout() {
		if (this.timeout) clearTimeout(this.timeout)
		this.timeout = setTimeout(this.onEnd, this._length - this.countedTime + 500)
	}

	start(): void {
		this.startedAt = Date.now()
		this.setupTimeout()
	}

	pause(): void {
		this.countedTime = this.time
		this.startedAt = 0
		if (this.timeout) clearTimeout(this.timeout)
	}

	reset(): void {
		this.countedTime = 0
		if (this.isRunning) this.start()
	}

	stop(): void {
		this.pause()
		this.reset()
	}

	set time(time: number) {
		this.startedAt = Date.now()
		this.countedTime = time
		this.setupTimeout()
	}

	/** In milliseconds */
	get time(): number {
		if (!this.isRunning) return this.countedTime
		return Date.now() - this.startedAt + this.countedTime
	}

	get isRunning(): boolean {
		return this.startedAt !== 0
	}
}
