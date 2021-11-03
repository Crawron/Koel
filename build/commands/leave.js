"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "leave",
        description: "Leave the current voice channel",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            (0, queueHandler_1.destroyPlayer)(ctx.guild?.id ?? "");
            ctx.reply(() => "_:wave:_");
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=leave.js.map