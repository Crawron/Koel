"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePlayer = void 0;
const voice_1 = require("@discordjs/voice");
const mobx_1 = require("mobx");
const logging_1 = require("./logging");
const Timer_1 = require("./Timer");
class VoicePlayer {
    constructor(onIdle) {
        Object.defineProperty(this, "onIdle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onIdle
        });
        Object.defineProperty(this, "connection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Timer_1.Timer()
        });
        Object.defineProperty(this, "song", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "playStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "StandBy"
        });
        (0, mobx_1.makeAutoObservable)(this);
        this.player = (0, voice_1.createAudioPlayer)({
            behaviors: { noSubscriber: voice_1.NoSubscriberBehavior.Pause },
        });
        this.player.on("stateChange", (oldState, newState) => {
            // log(`State changed: ${oldState.status} -> ${newState.status}`, 0)
            if (newState.status === "playing") {
                this.timer.time = newState.playbackDuration;
            }
            if (oldState.status === "playing") {
                this.timer.time = oldState.playbackDuration;
            }
            if (oldState.status === "buffering" && this.playStatus === "Paused") {
                this.pause();
            }
            if (newState.status === "idle") {
                this.song = null;
                this.playStatus = "StandBy";
                this.timer.pause();
                this.timer.reset();
                this.onIdle();
            }
        });
    }
    destroy() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection.destroy();
            this.connection = null;
        }
    }
    connect(channel) {
        this.disconnect();
        this.connection = (0, voice_1.joinVoiceChannel)({
            guildId: channel.guildId,
            channelId: channel.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        this.connection.subscribe(this.player);
        this.connection.on("stateChange", (_, newState) => {
            this.isConnected = newState.status === "ready";
        });
    }
    disconnect() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection.destroy();
            this.connection = null;
        }
    }
    setSong(song) {
        this.song = song;
        if (this.playStatus === "Paused")
            this.pause();
        this.startStream();
    }
    async startStream() {
        (0, logging_1.log)(`startStream ${this.playStatus}`, 0);
        if (!this.song)
            return;
        this.timer.run();
        const resource = (0, voice_1.createAudioResource)(await this.song.getOpusStream());
        this.player.play(resource);
        if (this.playStatus === "StandBy")
            this.playStatus = "Playing";
    }
    stop() {
        this.song = null;
        this.player.stop();
        this.timer.pause();
        this.timer.reset();
        this.playStatus = "StandBy";
    }
    resume() {
        (0, logging_1.log)(this.playStatus, 0);
        this.player.unpause();
        this.timer.run();
        this.playStatus = "Playing";
    }
    pause() {
        this.player.pause();
        this.timer.pause();
        this.playStatus = "Paused";
        (0, logging_1.log)(`pause ${this.playStatus}`, 0);
    }
    /** Incomplete */
    seek(time) {
        this.timer.time = time;
        // ToDo: Actually seek on the stream
    }
    get playedTime() {
        return this.timer.time;
    }
    get voiceChannelId() {
        return this.connection?.joinConfig.channelId ?? undefined;
    }
    get guildId() {
        return this.connection?.joinConfig.guildId ?? undefined;
    }
}
exports.VoicePlayer = VoicePlayer;
//# sourceMappingURL=VoicePlayer.js.map