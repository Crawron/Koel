"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "skip",
        description: "Skip the current song",
        options: { count: { type: "INTEGER", description: "Skip multiple songs" } },
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            const count = ctx.options.count ?? 1;
            ctx.reply(() => `Skipping **${player.currentSong?.title}**${count > 1 ? ` and ${count - 1} more songs` : ""}...`);
            player.queuePosition += count;
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=skip.js.map