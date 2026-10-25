# Puzzle levels

Each file is one Linebreak puzzle. CI parses every `*.json` in this folder with `src/modes/puzzle/schema.ts`; a bad field fails the build with the file name and path.

```json
{
  "id": "t1-01",
  "title": "I in the well",
  "tier": 1,
  "width": 10,
  "board": ["XXX....XXX"],
  "sequence": ["I"],
  "goal": { "type": "clear", "kind": "single" },
  "budget": 1,
  "stars": [1, 1, 1],
  "solution": [[0, 8]]
}
```

- `board` rows are top-to-bottom stack snippets aligned to the bottom of the 20-row well. `.` is empty; any other character is a block.
- `stars` is `[3-star pieces, 2-star pieces, 1-star pieces]`.
- `solution` is a replay input log `[frame, held bitmask]`. Hard drop is `8`, left `1`, right `2`, CW `16`.
- Tiers lock until the previous tier has 10 stars.
