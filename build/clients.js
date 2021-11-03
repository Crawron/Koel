"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.djsClient = void 0;
const discord_js_1 = require("discord.js");
exports.djsClient = new discord_js_1.Client({
    intents: ["GUILD_VOICE_STATES", "GUILDS"],
});
//# sourceMappingURL=clients.js.map