# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Builder must be run via `npm run preview` (not `file://` protocol — fetch API is blocked)

## Building the App

```bash
npm install
npm run build
```

This produces `dist/index.html` (Player) and `dist/builder.html` (Builder).

## Running the Builder

```bash
npm run preview
```

Then open: `http://localhost:4174/builder.html`

Or use the shortcut:
```bash
npm run preview:builder
```

## Creating a Module

1. Open the Builder at `http://localhost:4174/builder.html`
2. Click **Start New Module** (or **Resume Draft** to continue)
3. Enter a module name and select shelves
4. Add patient scenarios and quiz questions for each shelf
5. Click **Preview** to test the module interactively
6. Click **Export** to download the `.OTCgame` file

## Deploying a Module

1. Rename `ModuleName.OTCgame` → `ModuleName.zip`
2. Unzip the file
3. Go to [netlify.com/drop](https://netlify.com/drop)
4. Drag the unzipped folder onto the Netlify drop zone
5. Netlify will give you a URL like `https://random-name.netlify.app`
6. Use this URL to embed the Player in Canvas LMS (see `embedding.md`)

## Updating a Module

Import the existing `.OTCgame` file into the Builder to continue editing.
If product IDs have changed since the original export, orphaned products will be flagged.

## Known Limitations

- **No auto-update**: If the Player app code changes (bug fixes, new features), each deployed module must be re-exported and re-deployed.
- **localStorage draft is per-browser**: No cloud save. Use Export frequently to back up your work.
- **Touch devices**: Drag & drop quiz questions are not supported on touch-only devices. The keyboard dropdown fallback works everywhere.
