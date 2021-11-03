"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const logging_1 = require("./logging");
const chalk_1 = require("chalk");
const posix_1 = __importDefault(require("path/posix"));
const clients_1 = require("./clients");
const queueHandler_1 = require("./queueHandler");
const storage_1 = require("./storage");
const mobx_1 = require("mobx");
(0, mobx_1.configure)({ enforceActions: "never" });
const commandMode = process.env.COMMANDMODE ?? "guild";
(async () => {
    await gatekeeper_1.Gatekeeper.create({
        name: "Koel",
        client: clients_1.djsClient,
        commandFolder: posix_1.default.join(__dirname, "commands"),
        logging: true,
    });
    clients_1.djsClient.on("ready", async () => {
        (0, logging_1.log)(`Ready. Connected to ${(0, chalk_1.bold)(clients_1.djsClient.user?.username)}`);
        (0, logging_1.log)(`Using ${(0, chalk_1.bold)(commandMode)} commands`);
        const storage = await (0, storage_1.getQueueStorage)();
        (0, logging_1.log)(storage.length, 0);
        (0, queueHandler_1.loadQueues)(storage);
        (0, logging_1.log)(`Loaded queues`);
    });
    clients_1.djsClient
        .login(process.env.KOELTOKEN)
        .catch((e) => (0, logging_1.log)(e, logging_1.LogLevel.Error));
})();
//# sourceMappingURL=main.js.map