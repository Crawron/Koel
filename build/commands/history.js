"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const helpers_1 = require("../helpers");
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "history",
        description: "Show a history of previously played songs",
        run(ctx) {
            const queue = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!queue)
                return;
            ctx.reply(() => (0, gatekeeper_1.embedComponent)({
                title: "Queue History",
                description: queue.history
                    .map((song, i) => `\`${(0, helpers_1.twoDigits)(i + 1)}\` ${song.title} \`${(0, helpers_1.fmtTime)(song.duration)}\``)
                    .join(`\n`),
            }));
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=history.js.map