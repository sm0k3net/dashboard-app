# EasyDash

A lightweight, professional personal dashboard to organize the services you use daily. Pure HTML, CSS, and JavaScript—no backend—data stored locally in your browser and exportable as JSON.

## Features

- Groups and Services (create, edit, delete)
- Assign/move services between groups
- Notes per service, tags, and search
- Light/Dark theme toggle
- Favicons (auto-fetched) with fallback
- JSON import/export; local persistence via localStorage
- No frameworks, no build step

## Structure

- `index.html` — App shell
- `assets/css/styles.css` — Theme and components
- `assets/js/utils.js` — Helpers
- `assets/js/storage.js` — Data model and persistence
- `assets/js/ui.js` — Rendering & interactions
- `assets/js/app.js` — App bootstrap
- `data/config.json` — Default configuration

## Run locally

You can open `index.html` directly, but some browsers block `fetch` of local JSON. Use a simple local server for best results.

Using PowerShell (Windows):

```powershell
# Option A: VS Code Live Server extension (recommended)
# Right-click index.html > "Open with Live Server"

# Option B: Python (if installed)
python -m http.server 5500

# Then visit:
# http://localhost:5500/
```

Changes you make are saved to your browser’s localStorage. Use Export/Import to move your config between devices or reset the app.

## Data format

```json
{
	"version": 1,
	"lastUpdated": "...",
	"settings": { "theme": "auto | light | dark" },
	"groups": [{ "id": "grp-...", "name": "Name", "color": "#rrggbb", "locked": false }],
	"services": [
		{ "id": "svc-...", "name": "Name", "url": "https://...", "groupId": "grp-...", "tags": ["tag"], "notes": "" }
	]
}
```

Locked groups (`All`, `Ungrouped`) can’t be renamed or deleted.

## Tips

- Search matches name, URL, and tags.
- Use “Import Config” to load a JSON file in this format.
- Use “Export Config” to download your current data.
- Theme is saved per browser in the JSON settings.

## License

MIT
