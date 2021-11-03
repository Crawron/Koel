"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const chalk_1 = require("chalk");
const mobx_1 = require("mobx");
const clients_1 = require("./clients");
const helpers_1 = require("./helpers");
const logging_1 = require("./logging");
const Song_1 = require("./Song");
const storage_1 = require("./storage");
const VoicePlayer_1 = require("./VoicePlayer");
class Queue {
    constructor(guildId) {
        Object.defineProperty(this, "guildId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: guildId
        });
        Object.defineProperty(this, "list", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_queuePosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "disposeCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        (0, mobx_1.makeAutoObservable)(this);
        this.player = new VoicePlayer_1.VoicePlayer(() => (this.queuePosition += 1));
        this.disposeCallbacks.push((0, mobx_1.reaction)(() => this.toData(), async (data) => {
            (0, logging_1.log)(`Saved queue for ${this.guildId}`, 0);
            await (0, storage_1.saveQueue)(data);
        }), (0, mobx_1.reaction)(() => this.currentSong, (song) => {
            if (song != null)
                this.setPlayStream();
            else
                this.player.stop();
        }));
    }
    static fromData(data) {
        const queue = new Queue(data.id);
        if (data.playerStatus === "Paused")
            queue.player.pause();
        if (data.voiceChannel) {
            const vc = clients_1.djsClient.channels.cache.get(data.voiceChannel);
            if (vc)
                queue.player.connect(vc);
        }
        (0, mobx_1.runInAction)(() => {
            queue.list = data.list.map((song) => Song_1.Song.fromData(song));
            queue.queuePosition = data.queuePosition;
        });
        return queue;
    }
    toData() {
        const data = {
            id: this.guildId,
            playedTime: this.player.playedTime,
            playerStatus: this.player.playStatus,
            list: this.list.map((song) => song.toData()),
            queuePosition: this.queuePosition,
            voiceChannel: this.player.voiceChannelId,
        };
        return data;
    }
    destroy() {
        this.player.destroy();
        this.disposeCallbacks.forEach((cb) => cb());
    }
    connect(voiceChannel) {
        this.player.connect(voiceChannel);
    }
    get isConnected() {
        return this.player.isConnected;
    }
    get upcomingSongs() {
        return this.list.slice(this.queuePosition + 1);
    }
    get currentSong() {
        if (this.queuePosition <= this.list.length - 1)
            return this.list[this.queuePosition];
        else
            return undefined;
    }
    get history() {
        return this.list.slice(0, this.queuePosition);
    }
    get status() {
        return this.player.playStatus;
    }
    get queuePosition() {
        return this._queuePosition;
    }
    set queuePosition(value) {
        this._queuePosition = Math.max(Math.min(value, this.list.length), 0);
    }
    addToQueue(song, position = this.list.length) {
        this.list.splice(position, 0, song);
    }
    moveSong(from, to) {
        from = (0, helpers_1.cap)(from, 0, this.upcomingSongs.length - 1);
        to = (0, helpers_1.cap)(to, 0, this.upcomingSongs.length - 1);
        const reSorted = (0, helpers_1.move)(this.upcomingSongs, from, to);
        this.list.splice(this.queuePosition + 1);
        this.list.push(...reSorted);
    }
    /** Returns deleted songs */
    clearQueue() {
        return this.list.splice(this._queuePosition + 1);
    }
    shuffle() {
        this.list.push(...(0, helpers_1.shuffle)(this.list.splice(this.queuePosition + 1)));
    }
    togglePlay() {
        if (this.player.playStatus === "Paused")
            this.player.resume();
        else if (this.player.playStatus === "Playing")
            this.player.pause();
    }
    get currentTime() {
        return this.player.playedTime;
    }
    async setPlayStream() {
        const song = this.currentSong;
        if (!song)
            return;
        this.player.setSong(song);
        (0, logging_1.log)(`Set stream to... ${(0, chalk_1.bold)(song.title)}`, 0);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map