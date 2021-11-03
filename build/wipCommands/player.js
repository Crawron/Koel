"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const queueHandler_1 = require("../queueHandler");
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "player",
        description: "Show a message to control the audio player",
        run(ctx) {
            const player = (0, queueHandler_1.tryGetQueue)(ctx);
            if (!player)
                return;
            let description = "";
            ctx.reply(() => [
                (0, gatekeeper_1.embedComponent)({
                    title: "Koel Player",
                    description: `**Currently Playing**: ${player.currentSong?.title ?? "*Nothing*"}` + description,
                }),
                (0, gatekeeper_1.buttonComponent)({
                    emoji: "▶️",
                    style: "PRIMARY",
                    label: "",
                    onClick: () => {
                        description = "You clicked Play";
                    },
                }),
                (0, gatekeeper_1.buttonComponent)({
                    emoji: "⏭️",
                    style: "PRIMARY",
                    label: "",
                    onClick: () => {
                        description = "You clicked Skip";
                    },
                }),
                (0, gatekeeper_1.buttonComponent)({
                    emoji: "⏹️",
                    style: "PRIMARY",
                    label: "",
                    onClick: () => {
                        /**/ description = "You clicked Stop";
                    },
                }),
            ]);
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=player.js.map