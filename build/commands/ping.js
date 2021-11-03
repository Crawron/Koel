"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "ping",
        description: "Ping check",
        run(ctx) {
            ctx.reply(() => "Pong");
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=ping.js.map