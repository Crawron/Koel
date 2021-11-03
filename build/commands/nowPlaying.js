"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const helpers_1 = require("../helpers");
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "now-playing",
        description: "Show currently playing song",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            const currentSong = player.currentSong;
            if (!currentSong) {
                ctx.reply(() => "Nothing's playing currently");
                return;
            }
            ctx.reply(() => (0, gatekeeper_1.embedComponent)({
                author: { name: (0, helpers_1.escFmting)(currentSong.uploader ?? "") },
                title: (0, helpers_1.escFmting)(currentSong.title),
                url: currentSong.url,
                thumbnail: currentSong.thumbnail
                    ? { url: currentSong.thumbnail }
                    : undefined,
                description: `**\`${(0, helpers_1.fmtTime)(player.currentTime)} / ${(0, helpers_1.fmtTime)(currentSong.duration)}\`** requested by <@${currentSong.requester}>`,
                fields: [
                    currentSong.chapters.length > 0 && {
                        name: `${currentSong.chapters.length} Chapters`,
                        value: currentSong.getFormattedChapters(player.currentTime),
                    },
                ].filter(helpers_1.isTruthy),
            }));
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=nowPlaying.js.map