## To work on next

- Persistence
- Better /now-playing

## Bugs

- Missing audio files' duration (_maybe_ won't fix)
- Off by one error in /queue (3 pages when there's 20 elements in 2)
- Potentially unhandled stale media source links (hasn't been an issue yet, but just to note)

## Planned?

- Better /queue
- Proper error handling, instead of failing silently
- /np and /q shorthands
- Seeking
- Distributed Queue (song requests evenly split between requesters in queue)
- Live Player Message
- Playlist saving
- Repeat one / Repeat playlist

## Done :)

- Moving songs in queue
- Add `position` option to /play
- Pausing
- Chapters

## Fixed

- /play always queueing in position 0 (current song)
- /skip is just completely broken
- Skipping last song in queue is broken
- Sources that only deliver video don't work
