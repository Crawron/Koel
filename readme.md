# ⚠ ☣ 🐦 Currently working on huge refactor on the [`dev`](https://github.com/Crawron/Koel/tree/dev) branch

New features to this main branch will be kept on hold until this refactor's done

## Bugs

- Unhandled stale media source links (_has_ been an issue now)
- Crash in the middle of queuing a playlist leads to it queueing incompletely
- Missing audio files' duration (direct file source) (_maybe_ won't fix)
- Corrupted queue storage prevents startup
- Weird behaviour when seeking from persistence
- Actually just weird seeking in general, the beginning of songs may be cut off

## Planned?

- Retry system on play (and give up)
- Automatically leave when idled for too long
- Proper error handling, instead of failing silently
- /np and /q shorthands
- Distributed Queue (song requests evenly split between requesters in queue)
- Live Player Message
- Playlist saving
- Repeat one / Repeat playlist
- Permission system

## Done :)

- Seeking
- Better /now-playing
- Better /queue
- Moving songs in queue
- Add `position` option to /play
- Pausing
- Chapters
- Persistence-ish
- /history

## Fixed

- There's no /search lol
- Off by one error in /queue (3 pages when there's 20 elements in 2)
- Not properly saving last connected vc for persistence (including being disconnected)
- /play always queueing in position 0 (current song)
- /skip is just completely broken
- Skipping last song in queue is broken
- Sources that only deliver video don't work
- Sometimes attempt to parse incomplete ytdl output
- Missing /join command to join or change voice channel
- Debounce persistence storage saving
