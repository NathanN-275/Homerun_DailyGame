# Home Run

[Play Home Run on GitHub Pages](https://nathann-275.github.io/Homerun_DailyGame/)

Home Run is a standalone baseball trivia arcade inspired by [Jumpshot](https://nathann-275.github.io/JumpShot_DailyGame/). Everyone gets the same seven at-bats each day, with 30 seconds per answer and a new deck at midnight Eastern. The game saves the current run and personal best in the browser.

## Play locally

Serve this directory with any static file server. For example:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open [the local game](http://127.0.0.1:4173/). The four scoring outcomes award 10, 50, 100, or 200 points depending on the accepted answer. The [scoring and sourcing notes](docs/baseball-scoring-and-sourcing.md) describe the rules and historical sources.

## Verify

```sh
node verify.mjs
python3 verify-sources.py /tmp/homerun-retrosheet
```

The first command checks all daily decks and exercises the game controller with a simulated clock. The source audit downloads and caches public Retrosheet records and the Hall of Fame election list, then compares all 196 answer sets against those records.
