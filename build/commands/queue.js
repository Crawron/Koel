"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const helpers_1 = require("../helpers");
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "queue",
        description: "List the queue",
        options: { page: { type: "INTEGER", description: "Queue page" } },
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            const itemsPerPage = 10;
            const pageCount = Math.floor(player.list.length / itemsPerPage) + 1;
            let pageNumber = Math.min(Math.max(ctx.options.page ?? 1 - 1, 0), pageCount - 1);
            const nextSongs = player.list.filter((_, i) => i > player.queuePosition);
            const nextSongsStr = nextSongs.map((song, i) => `**\`${i + 1}\`** ${(0, helpers_1.escFmting)(song.title)} \`${(0, helpers_1.fmtTime)(song.duration)}\` _<@${song.requester}>_`);
            const queuePages = (0, helpers_1.paginate)(nextSongsStr, itemsPerPage);
            const totalRuntime = (0, helpers_1.fmtTime)(nextSongs.reduce((p, c) => p + c.duration, 0));
            const current = player.currentSong;
            const title = current
                ? `Playing **${(0, helpers_1.escFmting)(current.title)}**`
                : "Song Queue";
            if (nextSongs.length < 1) {
                ctx.reply(() => (0, gatekeeper_1.embedComponent)({
                    title,
                    footer: { text: "The queue is empty..." },
                }));
                return;
            }
            ctx.reply(() => {
                const currentPage = queuePages[pageNumber];
                if (!currentPage)
                    return "Empty";
                return [
                    (0, gatekeeper_1.embedComponent)({
                        title,
                        thumbnail: current?.thumbnail
                            ? { url: current.thumbnail }
                            : undefined,
                        description: `${current
                            ? `\`${(0, helpers_1.fmtTime)(player.currentTime)} / ${(0, helpers_1.fmtTime)(current.duration)}\` Uploaded by ${(0, helpers_1.escFmting)(current.uploader ?? "") || "*no one*"}, requested by <@${current.requester}>\n`
                            : ""}${nextSongs.length || "No"} songs left. Total runtime **${totalRuntime}**`,
                        fields: currentPage.items.join("\n")
                            ? [{ name: "Up next", value: currentPage.items.join("\n") }]
                            : [],
                        footer: pageCount > 1
                            ? { text: `Page ${pageNumber + 1} of ${pageCount}` }
                            : undefined,
                    }),
                    pageCount > 1
                        ? [
                            (0, gatekeeper_1.buttonComponent)({
                                emoji: "⬅️",
                                label: "Previous",
                                style: "SECONDARY",
                                disabled: currentPage.isFirstPage,
                                onClick: () => {
                                    pageNumber -= 1;
                                },
                            }),
                            (0, gatekeeper_1.buttonComponent)({
                                emoji: "➡️",
                                label: "Next",
                                style: "SECONDARY",
                                disabled: currentPage.isLastPage,
                                onClick: () => {
                                    pageNumber += 1;
                                },
                            }),
                        ]
                        : [],
                ];
            });
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=queue.js.map