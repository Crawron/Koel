"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueue = exports.destroyPlayer = exports.tryGetQueue = exports.loadQueues = void 0;
const Queue_1 = require("./Queue");
const activeQueues = new Map();
function loadQueues(queues) {
    for (const queue of queues) {
        const newQueue = Queue_1.Queue.fromData(queue);
        activeQueues.set(newQueue.guildId, newQueue);
    }
}
exports.loadQueues = loadQueues;
/** Does all the player command context checking logic and replies accordingly on error. Returns a Player object if successful. */
function tryGetQueue(ctx) {
    if (!ctx.guild || ctx.channel?.type !== "GUILD_TEXT") {
        ctx.reply(() => "This command is only available in guilds");
        return;
    }
    if (!ctx.member?.voice.channel) {
        ctx.reply(() => "You must be in a voice channel to use this command");
        return;
    }
    if (!ctx.channel) {
        ctx.reply(() => "You seem to have not called this command from a text channel. I don't know how this is possible, and I don't think this reply will be seen by any eyes outside of the source code, but I *am* forced to make this check and reply regardless. Have a good one");
        return;
    }
    return activeQueues.get(ctx.guild.id) ?? createQueue(ctx.member.voice.channel);
}
exports.tryGetQueue = tryGetQueue;
function destroyPlayer(guildId) {
    activeQueues.get(guildId)?.destroy();
    return activeQueues.delete(guildId);
}
exports.destroyPlayer = destroyPlayer;
function createQueue(voiceChannel) {
    const newQueue = new Queue_1.Queue(voiceChannel.guildId);
    newQueue.connect(voiceChannel);
    activeQueues.set(voiceChannel.guildId, newQueue);
    return newQueue;
}
exports.createQueue = createQueue;
//# sourceMappingURL=queueHandler.js.map