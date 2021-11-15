## To work on next

## Bugs

- There's no /search lol
- Off by one error in /queue (3 pages when there's 20 elements in 2)
- Potentially unhandled stale media source links (hasn't been an issue yet, but just to note)
- Crash in the middle of queuing a playlist leads to it queueing incompletely
- Missing audio files' duration (direct file source) (_maybe_ won't fix)
- Corrupted queue storage prevents startup

## Planned?

- Retry system on play (and give up)
- Leave when on StandBy for too long
- Better /queue
- Better /now-playing
- Proper error handling, instead of failing silently
- /np and /q shorthands
- Seeking
- Distributed Queue (song requests evenly split between requesters in queue)
- Live Player Message
- Playlist saving
- Repeat one / Repeat playlist
- Permission system

## Done :)

- Moving songs in queue
- Add `position` option to /play
- Pausing
- Chapters
- Persistence-ish
- /history

## Fixed

- Not properly saving last connected vc for persistence (including being disconnected)
- /play always queueing in position 0 (current song)
- /skip is just completely broken
- Skipping last song in queue is broken
- Sources that only deliver video don't work
- Sometimes attempt to parse incomplete ytdl output
- Missing /join command to join or change voice channel
- Debounce persistence storage saving
