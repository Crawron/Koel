"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "move",
        description: "Move a song in queue to a different position",
        options: {
            from: {
                type: "INTEGER",
                description: "Which song to move",
                required: true,
            },
            to: {
                type: "INTEGER",
                description: "Where to move it to",
                required: true,
            },
        },
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            const { from, to } = ctx.options;
            player.moveSong(from - 1, to - 1);
            ctx.reply(() => "_:thumbsup:_");
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=move.js.map