- Identify the request type (Playlist / Video / PlaylistVideo)

- _If_ the request type is a PlaylistVideo

  - Then prompt back for clarification
    - If they cancel, delete prompt message
      - Otherwise, edit request link accordingly

- _Try_ to queue the shit

  - Meanwhile, display last 3 songs queued and total count

- Once previous step is done, display final queued message
  - If no songs were added, display error message instead
