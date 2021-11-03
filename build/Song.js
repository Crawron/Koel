"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
// import fetch from "node-fetch"
const execa_1 = __importDefault(require("execa"));
const helpers_1 = require("./helpers");
class Song {
    constructor(meta, requester) {
        Object.defineProperty(this, "meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: meta
        });
        Object.defineProperty(this, "requester", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: requester
        });
    }
    static fromData(data) {
        return new Song({
            title: data.title,
            url: data.mediaUrl,
            webpage_url: data.url,
            extractor_key: data.source,
            duration: data.duration / 1000,
            chapters: data.chapters
                .map((chapter) => ({
                title: chapter.title,
                start_time: chapter.startTime,
            }))
                .sort((a, b) => a.start_time - b.start_time),
            thumbnail: data.thumbnail ?? undefined,
            uploader: data.uploader ?? undefined,
        }, data.requester);
    }
    static async *requestYtdl(request) {
        const ytdlProcess = (0, execa_1.default)("youtube-dl", [
            "--default-search",
            "ytsearch",
            "-f",
            "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio/best[height<=480p]/worst",
            "-s",
            "--dump-json",
            request,
        ]);
        if (!ytdlProcess.stdout)
            throw new Error("youtube-dl process stdout is null");
        for await (const data of ytdlProcess.stdout) {
            const json = JSON.parse(String(data));
            yield json;
        }
    }
    toData() {
        const data = {
            title: this.title,
            url: this.url,
            mediaUrl: this.meta.url,
            source: this.source,
            duration: this.duration,
            thumbnail: this.thumbnail,
            uploader: this.uploader,
            chapters: this.chapters.map((ch) => ({
                title: ch.title,
                startTime: ch.startTime,
            })),
            requester: this.requester,
        };
        return data;
    }
    get title() {
        return this.meta.fulltitle ?? this.meta.title;
    }
    get duration() {
        return (this.meta.duration ?? 0) * 1000;
    }
    get thumbnail() {
        return this.meta.thumbnail;
    }
    get url() {
        return this.meta.webpage_url;
    }
    get uploader() {
        return this.meta.uploader;
    }
    get source() {
        return this.meta.extractor_key;
    }
    get chapters() {
        return (this.meta.chapters?.map((chapter) => ({
            title: chapter.title,
            startTime: chapter.start_time * 1000,
        })) ?? []);
    }
    getFormattedChapters(currentTime, radius = 1) {
        if (!this.chapters)
            return "_none_";
        const pivot = this.chapters.length -
            1 -
            [...this.chapters].reverse().findIndex((chapter) => {
                return chapter.startTime <= currentTime;
            });
        const chapters = (0, helpers_1.focusOn)(this.chapters, pivot, radius);
        return chapters.items
            .map((chapter, i) => i === chapters.pivot
            ? `**\`${(0, helpers_1.fmtTime)(chapter.startTime)}\` ${(0, helpers_1.escFmting)(chapter.title)}**`
            : `\`${(0, helpers_1.fmtTime)(chapter.startTime)}\` ${(0, helpers_1.escFmting)(chapter.title)}`)
            .join("\n");
    }
    async checkFreshness() {
        return true; // pretend
        // const response = await fetch(this.meta.url, { method: "GET", size: 1 })
        // return response.ok && !!response.body
    }
    /** Can throw, though unlikely */
    async getOpusStream() {
        const process = (0, execa_1.default)("ffmpeg", [
            "-i",
            this.meta.url,
            "-f",
            "opus",
            "-v",
            "quiet",
            "-",
        ]);
        if (!process.stdout)
            throw Error("ffmpeg stdout is somehow null");
        return process.stdout;
    }
}
exports.Song = Song;
//# sourceMappingURL=Song.js.map