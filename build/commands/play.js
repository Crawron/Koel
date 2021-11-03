"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
const helpers_1 = require("../helpers");
const Song_1 = require("../Song");
const sourceHandler_1 = require("../sourceHandler");
const playCommandOptions = {
    song: { description: "Song to queue", type: "STRING", required: true },
    position: {
        description: "Where to add queue. If empty, add to the end",
        type: "INTEGER",
    },
};
const playCommandRun = async (ctx) => {
    const player = (0, queueHandler_1.tryGetQueue)(ctx);
    if (!player)
        return;
    const { song: request, position = player.upcomingSongs.length + 1 } = ctx.options;
    const addedSongs = [];
    let reqType = (0, sourceHandler_1.checkRequestType)(request);
    async function resolveRequest(url = request) {
        if (!player)
            throw new Error("Missing player");
        if (!url)
            throw new Error("Missing request url");
        let queuingPosition = position + player.queuePosition;
        for await (const metadata of Song_1.Song.requestYtdl(url)) {
            const song = new Song_1.Song(metadata, ctx.user.id);
            addedSongs.push(song);
            player.addToQueue(song, queuingPosition);
            queuingPosition += 1;
        }
    }
    if (reqType != "PlaylistVideo") {
        ctx.defer();
        await resolveRequest();
    }
    let loading = false;
    const reply = ctx.reply(() => {
        if (loading)
            return "One sec...";
        if (reqType === "PlaylistVideo")
            return [
                "This video belongs to a playlist, do you want me to queue **the whole playlist** or **just this one video**?",
                (0, helpers_1.accentButton)("The whole playlist", async (buttonCtx) => {
                    buttonCtx.defer();
                    reqType = "Playlist";
                    loading = true;
                    reply.refresh();
                    await resolveRequest(request.replace(/v=[^&]+&/, "").replace("/watch", "/playlist"));
                    loading = false;
                    reply.refresh();
                }),
                (0, helpers_1.accentButton)("Just this one video", async (buttonCtx) => {
                    buttonCtx.defer();
                    reqType = "Video";
                    loading = true;
                    reply.refresh();
                    await resolveRequest(request.replace(/&list=.*$/, ""));
                    loading = false;
                    reply.refresh();
                }),
                (0, helpers_1.grayButton)("Cancel", async () => reply.delete()),
            ];
        if (addedSongs.length < 1)
            return "Failed to get any songs to add to queue";
        return (0, helpers_1.getQueueAddedMessage)(...addedSongs);
    });
};
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "play",
        description: "Queue a song then playing",
        options: playCommandOptions,
        run: playCommandRun,
    });
    gatekeeper.addSlashCommand({
        name: "p",
        description: "Alias to /play",
        options: playCommandOptions,
        run: playCommandRun,
    });
}
exports.default = defineCommands;
//# sourceMappingURL=play.js.map