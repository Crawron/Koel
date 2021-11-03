"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequestType = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
function checkRequestType(query) {
    const url = safeNewHttpUrl(query);
    if (!url)
        return "Query";
    if (!["www.youtube.com", "youtu.be", "youtube.com"].includes(url.host))
        return "Query";
    if (url.pathname === "/watch" && !!url.searchParams.get("list"))
        return "PlaylistVideo";
    if (url.pathname === "/playlist")
        return "Playlist";
    if (ytdl_core_1.default.validateURL(query))
        return "Video";
    return "Query";
}
exports.checkRequestType = checkRequestType;
function safeNewHttpUrl(url) {
    try {
        const urlInstance = new URL(url);
        if (/^https?:$/.test(urlInstance.protocol))
            return urlInstance;
    }
    catch {
        return;
    }
}
//# sourceMappingURL=sourceHandler.js.map