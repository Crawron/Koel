"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
test("Paginates", () => {
    const pages = (0, helpers_1.paginate)(sampleArray, 2);
    expect(pages[1]?.items).toStrictEqual([3, 4]);
    expect(pages[1]?.isLastPage).toBe(false);
});
test("Paginates unevenly", () => {
    const pages = (0, helpers_1.paginate)(sampleArray, 3);
    expect(pages[3]?.items).toStrictEqual([10]);
    expect(pages[3]?.isLastPage).toBe(true);
    expect(pages[2]?.items).toStrictEqual([7, 8, 9]);
    expect(pages[2]?.isLastPage).toBe(false);
});
test("Detects last page", () => {
    const pages = (0, helpers_1.paginate)(sampleArray, 2);
    expect(pages[4]?.items).toStrictEqual([9, 10]);
    expect(pages[4]?.isLastPage).toBe(true);
    expect(pages[3]?.items).toStrictEqual([7, 8]);
    expect(pages[3]?.isLastPage).toBe(false);
});
test("Detects first page", () => {
    const pages = (0, helpers_1.paginate)(sampleArray, 2);
    expect(pages[0]?.items).toStrictEqual([1, 2]);
    expect(pages[0]?.isFirstPage).toBe(true);
    expect(pages[1]?.items).toStrictEqual([3, 4]);
    expect(pages[1]?.isFirstPage).toBe(false);
});
//# sourceMappingURL=helpers.test.js.map