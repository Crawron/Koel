"use strict";
/* Listen. I need something that can keep track of how much time has passed in very weird, whacky, strange, scenarios. There's a lot of time sensistive stuff in this project and for some reason none of the tools given to me actually are useful to keep track of anything, so I'm making my own */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor() {
        Object.defineProperty(this, "accumulatedTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "startingTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /** Start counting time, or resume counting if paused */
    run() {
        this.startingTime = Date.now();
    }
    /** Pause */
    pause() {
        this.accumulatedTime = this.time;
        this.startingTime = null;
    }
    /** Reset timer to zero, keeps the timer running if it is */
    reset() {
        this.time = 0;
    }
    get isRunning() {
        return this.startingTime != null;
    }
    /** Time since the last time the times started running */
    get timeDelta() {
        if (!this.startingTime)
            return 0;
        return Date.now() - this.startingTime;
    }
    /** Elapsed time since first run, excluding paused time */
    get time() {
        return this.accumulatedTime + this.timeDelta;
    }
    /** ... or arbitrarily set timer to a specific value. **In milliseconds** */
    set time(time) {
        this.accumulatedTime = time;
        if (this.isRunning)
            this.startingTime = Date.now();
    }
}
exports.Timer = Timer;
//# sourceMappingURL=Timer.js.map