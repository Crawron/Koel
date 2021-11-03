"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQueue = exports.saveQueue = exports.getQueueStorage = void 0;
const path_1 = require("path");
const jsonfile_1 = require("jsonfile");
const fast_glob_1 = __importDefault(require("fast-glob"));
const promises_1 = require("fs/promises");
const logging_1 = require("./logging");
async function getQueueStorage() {
    const queueFilePaths = await (0, fast_glob_1.default)("storage/queues/*.json");
    (0, logging_1.log)((0, path_1.join)("storage", "queues", "*.json"), 0);
    (0, logging_1.log)(`Found ${queueFilePaths.length} queue files.`, 0);
    const queueDataStorage = [];
    for (const path of queueFilePaths) {
        const queueData = (await (0, jsonfile_1.readFile)(path));
        queueDataStorage.push(queueData);
    }
    return queueDataStorage;
}
exports.getQueueStorage = getQueueStorage;
async function saveQueue(queue) {
    await (0, jsonfile_1.writeFile)(`storage/queues/${queue.id}.json`, queue, {
        spaces: 2,
    });
}
exports.saveQueue = saveQueue;
async function deleteQueue(queue) {
    await (0, promises_1.unlink)(`storage/queues/${queue.id}.json`);
}
exports.deleteQueue = deleteQueue;
//# sourceMappingURL=storage.js.map