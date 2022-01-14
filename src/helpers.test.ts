import { describe, expect, test } from "vitest"
import { focusOn, paginate } from "./helpers"

const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

describe("Paginator", () => {
	test("Paginates", () => {
		const pages = paginate(sampleArray, 2)
		expect(pages.pages[1]?.items).toStrictEqual([3, 4])
		expect(pages.pages[1]?.isLastPage).toBe(false)
	})

	test("Paginates unevenly", () => {
		const { pages } = paginate(sampleArray, 3)

		expect(pages[3]?.items).toStrictEqual([10])
		expect(pages[3]?.isLastPage).toBe(true)

		expect(pages[2]?.items).toStrictEqual([7, 8, 9])
		expect(pages[2]?.isLastPage).toBe(false)
	})

	test("Detects last page", () => {
		const { pages } = paginate(sampleArray, 2)
		expect(pages[4]?.items).toStrictEqual([9, 10])
		expect(pages[4]?.isLastPage).toBe(true)

		expect(pages[3]?.items).toStrictEqual([7, 8])
		expect(pages[3]?.isLastPage).toBe(false)
	})

	test("Detects first page", () => {
		const { pages } = paginate(sampleArray, 2)
		expect(pages[0]?.items).toStrictEqual([1, 2])
		expect(pages[0]?.isFirstPage).toBe(true)

		expect(pages[1]?.items).toStrictEqual([3, 4])
		expect(pages[1]?.isFirstPage).toBe(false)
	})

	test("Count total pages", () => {
		const { pageCount } = paginate(sampleArray, 2)
		expect(pageCount).toBe(5)
	})

	test("Indexes pages", () => {
		const indices = paginate(sampleArray, 2).pages.map((page) => page.index)

		expect(indices).toStrictEqual([1, 2, 3, 4, 5])
	})
})

describe("Focus", () => {
	test("Focus on first element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 0, 2)
		expect(items).toStrictEqual([1, 2, 3, 4, 5])
		expect(pivot).toBe(0)
	})

	test("Focus on the second element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 1, 2)
		expect(items).toStrictEqual([1, 2, 3, 4, 5])
		expect(pivot).toBe(1)
	})

	test("Focus on a middle element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 5, 2)
		expect(items).toStrictEqual([4, 5, 6, 7, 8])
		expect(pivot).toBe(2)
	})

	test("Focus on the third to last element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 7, 2)
		expect(items).toStrictEqual([6, 7, 8, 9, 10])
		expect(pivot).toBe(2)
	})

	test("Focus on the second to last element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 8, 2)
		expect(items).toStrictEqual([6, 7, 8, 9, 10])
		expect(pivot).toBe(3)
	})

	test("Focus on last element", () => {
		const { items, focusPivot: pivot } = focusOn(sampleArray, 9, 2)
		expect(items).toStrictEqual([6, 7, 8, 9, 10])
		expect(pivot).toBe(4)
	})
})
