import { paginate } from "./helpers"

const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

test("Paginates", () => {
	const page = paginate(sampleArray, 2, 1)
	expect(page.items).toStrictEqual([3, 4])
	expect(page.isLastPage).toBe(false)
})

test("Paginates unevenly", () => {
	const page = paginate(sampleArray, 3, 3)
	expect(page.items).toStrictEqual([10])
	expect(page.isLastPage).toStrictEqual(true)

	const anotherPage = paginate(sampleArray, 3, 2)
	expect(anotherPage.items).toStrictEqual([7, 8, 9])
	expect(anotherPage.isLastPage).toStrictEqual(false)
})

test("Detects last page", () => {
	const page = paginate(sampleArray, 2, 4)
	expect(page.items).toStrictEqual([9, 10])
	expect(page.isLastPage).toBe(true)

	const differentPage = paginate(sampleArray, 2, 3)
	expect(differentPage.items).toStrictEqual([7, 8])
	expect(differentPage.isLastPage).toBe(false)
})

test("Detects first page", () => {
	const page = paginate(sampleArray, 2, 0)
	expect(page.items).toStrictEqual([1, 2])
	expect(page.isFirstPage).toBe(true)

	const differentPage = paginate(sampleArray, 2, 1)
	expect(differentPage.items).toStrictEqual([3, 4])
	expect(differentPage.isFirstPage).toBe(false)
})
