## To work on next
- Rework for /now-playing and /queue

## Bugs
- Sources that only deliver video don't work
- Skipping last song in queue is broken
- Missing audio files' duration (_maybe_ won't fix)
- Off by one error in /queue (3 pages when there's 20 elements in 2)
- Potentially unhandled stale media source links (hasn't been an issue yet, but just to note)

## Planned?
- Better /queue and /now-playing
- Proper error handling, instead of failing silently
- /np and /q shorthands
- Pausing
- Seeking
- Moving songs in queue
- Chapters
- Distributed Queue (song requests evenly split between requesters in queue)
- Live Player Message
- Playlist saving
- Persistence
- .env.example
