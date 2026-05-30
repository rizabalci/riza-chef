# riza-chef

A personal cooking app that runs entirely in the browser. No accounts, no backend, no API keys. Open it and start cooking.

## What it does

Keeps recipes, ideas, and cooking notes in one place so you are not digging through screenshots and bookmarks every time you want to make something.

## Tech

Single-page app built as a static site:

- `index.html` holds the whole app (markup, styles, and logic in one file)
- `sw.js` is a service worker, so it installs as a PWA and works offline once loaded

Everything is client side. State lives in the browser, nothing leaves your device.

## Run it locally

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Serving it (rather than opening the file directly) is needed for the service worker and offline mode to register.

## License

MIT. See [LICENSE](LICENSE).
