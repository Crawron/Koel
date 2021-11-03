"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthy = exports.focusOn = exports.move = exports.cap = exports.grayButton = exports.accentButton = exports.getQueueAddedMessage = exports.shuffle = exports.createPlayerCommandRun = exports.paginate = exports.fmtTime = exports.twoDigits = exports.parseTime = exports.closeNums = exports.escFmting = void 0;
const gatekeeper_1 = require("@itsmapleleaf/gatekeeper");
const logging_1 = require("./logging");
const queueHandler_1 = require("./queueHandler");
/** Escape Discord formatting  */
function escFmting(text) {
    return text?.replace(/[<>:*_~#@]/g, "$&") ?? "_none_";
}
exports.escFmting = escFmting;
/** Check if two numbers are close to each other by a certain margin */
function closeNums(a, b, closeBy) {
    return Math.abs(a - b) <= closeBy;
}
exports.closeNums = closeNums;
/** Takes a time string (hh:ss:mm) and returns its value in milliseconds */
function parseTime(time) {
    const [seconds = 0, minutes = 0, hours = 0] = time
        .split(":")
        .map((n) => parseInt(n))
        .reverse();
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}
exports.parseTime = parseTime;
const twoDigits = (n) => n.toString().padStart(2, "0");
exports.twoDigits = twoDigits;
/** Format milliseconds to human time */
function fmtTime(time) {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return ((hours ? hours + ":" : "") +
        (hours ? (0, exports.twoDigits)(minutes % 60) : minutes % 60) +
        ":" +
        (0, exports.twoDigits)(seconds % 60));
}
exports.fmtTime = fmtTime;
function paginate([...arr], itemsPerPage) {
    const pages = [];
    const pageCount = Math.ceil(arr.length / itemsPerPage);
    for (let page = 0; page < pageCount; page++) {
        pages.push({
            items: arr.splice(0, itemsPerPage),
            isLastPage: page === pageCount - 1,
            isFirstPage: page === 0,
        });
    }
    return pages;
}
exports.paginate = paginate;
const createPlayerCommandRun = (callback) => async (ctx) => {
    const player = (0, queueHandler_1.tryGetQueue)(ctx);
    if (!player)
        return;
    try {
        await callback(ctx, player);
    }
    catch (e) {
        (0, logging_1.log)(e, logging_1.LogLevel.Error);
    }
};
exports.createPlayerCommandRun = createPlayerCommandRun;
/** Shuffle an array, duh. Modified from https://stackoverflow.com/a/2450976 */
function shuffle([...array]) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        const currentItem = array[currentIndex];
        const randomItem = array[randomIndex];
        if (currentItem != undefined)
            array[randomIndex] = currentItem;
        if (randomItem != undefined)
            array[currentIndex] = randomItem;
    }
    return array;
}
exports.shuffle = shuffle;
function getQueueAddedMessage(...songs) {
    const songList = songs
        .map((song) => `[${escFmting(song.title)}](<${song.url}>)`)
        .join(", ");
    if (songList.length > 250)
        return `Queued ${songs.length} songs`;
    else
        return `Queued ${songList}`;
}
exports.getQueueAddedMessage = getQueueAddedMessage;
function accentButton(label, callback) {
    return (0, gatekeeper_1.buttonComponent)({ label, style: "PRIMARY", onClick: callback });
}
exports.accentButton = accentButton;
function grayButton(label, callback) {
    return (0, gatekeeper_1.buttonComponent)({ label, style: "SECONDARY", onClick: callback });
}
exports.grayButton = grayButton;
function cap(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
exports.cap = cap;
function move([...arr], from, to) {
    arr.splice(to, 0, ...arr.splice(from, 1));
    return arr;
}
exports.move = move;
function focusOn(arr, pivot, radius) {
    const start = Math.max(pivot - radius, 0);
    return {
        items: arr.slice(start, Math.min(pivot + radius + 1, arr.length)),
        pivot: pivot - start,
    };
}
exports.focusOn = focusOn;
function isTruthy(thing) {
    return !!thing;
}
exports.isTruthy = isTruthy;
//# sourceMappingURL=helpers.js.map