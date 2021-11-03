"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "shuffle",
        description: "Shuffle the player queue",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            player.shuffle();
            ctx.reply(() => (0, helpers_1.shuffle)([..."Shuffled 👍"]).join(""));
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=shuffle.js.map