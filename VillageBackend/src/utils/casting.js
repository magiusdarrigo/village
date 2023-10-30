"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumberFromQuery = void 0;
function getNumberFromQuery(queryParam) {
    if (typeof queryParam === "string") {
        return parseInt(queryParam, 10);
    }
    return null;
}
exports.getNumberFromQuery = getNumberFromQuery;
