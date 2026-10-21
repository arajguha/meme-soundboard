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

Create a production build in `docs/`:

```sh
npm run build
```

To serve that build locally:

```sh
npm run preview
```

## Deploy with GitHub Pages

The Vite build writes the static site to `docs/`, which GitHub Pages can publish directly from the `main` branch.

1. Run `npm run build` and confirm the generated site is in `docs/`.
2. Commit and push the `docs/` folder along with your source changes to the `main` branch.
3. In your GitHub repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose **main** as the branch and **/docs** as the folder, then click **Save**.
6. After GitHub publishes it, open the site URL shown in **Settings → Pages**.

Whenever the app changes, run `npm run build` again and commit and push the updated `docs/` output. Vite uses relative asset paths, so the build works at both user-site and project-site URLs.

## Add or change sounds

- Put audio files in `public/sounds/`.
- Add or edit entries in `public/sounds.json`. Each entry should include a `title` and a `sound` filename that matches a file in `public/sounds/` (for example, `"sound": "my-sound.ogg"`).
- The sound list is fetched from `./sounds.json` when the app loads, so run it through the development server rather than opening `index.html` directly.

The in-app **Inspect sounds.json** panel can edit, import, and export the sound list for the current session. To make changes permanent, update the files in `public/`.

The audio-only Romoni MP4 is listed in `public/sounds.json` and played through the same sound card controls as the other sounds. Keep `public/sounds/Romoni.mp4` at that exact path (including capitalization) so it is included in the production build and works on GitHub Pages.

