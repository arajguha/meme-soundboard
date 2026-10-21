# সখা সংগীত

A browser-based soundboard built with React, TypeScript, and Vite. It loads its sound list from `public/sounds.json` and plays audio files from `public/sounds/`.

## Run locally

### Requirements

- Node.js 20.19+ or 22.12+
- npm (included with Node.js)

No API key or environment variables are needed to run the soundboard.

### Start the development server

1. Clone the repository and open a terminal in the project directory.
2. Install dependencies:

	```sh
	npm install
	```

3. Start Vite:

	```sh
	npm run dev
	```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

Vite enables hot module replacement while you work. Stop the server with `Ctrl+C`.

## Build and preview

Create a production build in `dist/`:

```sh
npm run build
```

To serve that build locally:

```sh
npm run preview
```

## Add or change sounds

- Put audio files in `public/sounds/`.
- Add or edit entries in `public/sounds.json`. Each entry should include a `title` and a `sound` filename that matches a file in `public/sounds/` (for example, `"sound": "my-sound.ogg"`).
- The sound list is fetched from `./sounds.json` when the app loads, so run it through the development server rather than opening `index.html` directly.

The in-app **Inspect sounds.json** panel can edit, import, and export the sound list for the current session. To make changes permanent, update the files in `public/`.

