"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "join",
        description: "Join a voice channel and change the active ",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            ctx.reply(() => "Joined :thumbsup:");
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=join.js.map