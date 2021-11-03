"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "clear",
        description: "Clear the queue",
        run(ctx) {
            const queue = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!queue)
                return;
            const deleted = queue.clearQueue();
            ctx.reply(() => `Cleared ${deleted} songs from the queue`);
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=clear.js.map