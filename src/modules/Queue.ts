import { cap, shuffle, zip } from "../helpers"
import { Song } from "./Song"

import { makeObservable, computed, observable } from "mobx"

export class Queue {
	list: Song[] = []
	private _listPivot = 0

	constructor() {
		makeObservable<this, "_listPivot">(this, {
			list: observable,
			_listPivot: observable,
			current: computed,
		})
	}

	/** list index of the current song */
	get listPivot() {
		return this._listPivot
	}

	set listPivot(value: number) {
		this._listPivot = cap(value, 0, this.list.length)
	}

	/** Not including the current song */
	get upcoming() {
		return this.list.slice(this.listPivot + 1)
	}

	get current() {
		if (this.listPivot >= this.list.length) return undefined
		return this.list[this.listPivot]
	}

	get history() {
		return this.list.slice(0, this.listPivot)
	}

	/** Advance the queue and return the current element */
	next(amount = 1) {
		this.listPivot += amount
		return this.current
	}

	/**
	 * @param songs Songs to queue
	 * @param position Relative to listPivot, leave empty to append
	 */
	add(songs: Song[], position = Infinity) {
		if (position < 0) this.listPivot += songs.length
		this.list.splice(this.listPivot + position, 0, ...songs)
	}

	/**
	 * @param position Relative to listPivot
	 * @param count Number of songs to remove
	 * @returns The deleted song
	 */
	remove(position: number, count = 1) {
		if (position < 0) this.listPivot -= count
		return this.list.splice(this.listPivot + position, count)
	}

	/** Deletes only upcomming songs */
	clear() {
		const removed = this.remove(1, Infinity)
		return removed
	}

	/** Songs in the `to` position get shifted down
	 * @param from Position to move from, relative to listPivot
	 * @param to Position to move to, relative to listPivot
	 * @returns Songs moved
	 */
	move(from: number, to: number) {
		const songs = this.remove(from)
		this.add(songs, to)
		return songs
	}

	/** Shuffle only upcomming songs in the list */
	shuffle() {
		const songs = this.remove(1, Infinity)
		this.add(shuffle(songs))
	}

	distribute(predicate: (song: Song) => number) {
		const songs = this.remove(1, Infinity).map(
			(song) => [predicate(song), song] as const
		)

		const map: Map<number, Song[]> = new Map()
		for (const [score, song] of songs) {
			const list = map.get(score) || []
			list.push(song)
			map.set(score, list)
		}

		this.add(zip(...map.values()))
	}
}
