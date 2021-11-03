"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "pause",
        description: "Pause playback",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            player.togglePlay();
            ctx.reply(() => `_${player.status}_`);
        },
    });
    gatekeeper.addSlashCommand({
        name: "resume",
        description: "Resume playback",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            player.togglePlay();
            ctx.reply(() => `_${player.status}_`);
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=pause.js.map