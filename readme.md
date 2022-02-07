# ⚠ ☣ 🐦 Currently working on huge refactor

The entire internal structure is being reorganized/rewritten. So commits are gonna be chunky and weird.

## Refactor notes

- **Media server port is hardcoded, don't**
- **Missing bunch of fixes to the /play command, also more testing needed there**
  - WHICH BUNCH? WHY DIDN'T I WRITE THIS
- Get song media url at last minute, instead of on queueing
- Bake seek time into Song object
- Playback error messages may log sensitive info
- ~~/rejoin command for when vc gets crackly cause of djs~~
- todo generate requirements.txt for python server
- Player: Retry logic working and it should be able to handle every possible playback failure I can recover from\*
  - \* i hope
- TODO ability to cancel queuing

## Bugs

- ~~Unhandled stale media source links (_has_ been an issue now)~~
- Crash in the middle of queuing a playlist leads to it queueing incompletely
- Missing audio files' duration (direct file source) (_maybe_ won't fix)
- Corrupted queue storage prevents startup
- Weird behaviour when seeking from persistence
- Actually just weird seeking in general, the beginning of songs may be cut off

## Planned (crossed are solved by refactor)

- Repeat one / Repeat playlist
- Automatically leave when idled for too long
- Permission system
- Playlist saving
- Live Player Message
- ~~Retry system on play (and give up)~~
- ~~Proper error handling, instead of failing silently~~
- ~~/np and /q shorthands~~ ty maple ❤
- ~~Distributed Queue (song requests evenly split between requesters in queue)~~

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
