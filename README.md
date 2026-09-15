# will you go on a date with me?

A small 8-bit web page that asks one important question.

Built as a single static page — no build step, no dependencies.

- `index.html` — the three screens (intro, the question, the answer)
- `style.css` — 8-bit theme, palette sampled from the night-sky background
- `script.js` — typewriter, the escalating "no", YouTube players
- `assets/` — pixel characters and the sky background

## Running it locally

```sh
python3 -m http.server 8777
```

Then open <http://localhost:8777/>.

Serve it over HTTP rather than opening `index.html` directly — the YouTube
players need a real origin.

## Notes

Background music starts muted and unmutes itself once the player reports it is
actually playing; browsers refuse audible autoplay outright, so this is the
closest thing to it. If a browser blocks it anyway, the first tap anywhere
turns the sound on.

Add `#diag` to the URL to see a live log of what the audio players are doing.
