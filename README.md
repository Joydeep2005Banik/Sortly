# Sortly

An automated file organizer for turning a messy Downloads or Desktop folder into tidy subfolders.

## Run locally

Because this is a self-contained static app, serve the repository with any local HTTP server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a browser. Choose a folder, drag files onto the drop zone, or use the sample workspace to preview the sorting flow.

Files are classified in the browser by extension. The app never uploads them; a production desktop version would connect the same rules to filesystem move permissions.