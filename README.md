# [SERVOPUNK Website](https://servopunk.net/)

The SERVOPUNK website @ servopunk.net

Branches:

- `master` for general development
- `prod` for [current deployment](https://servopunk.net/)
- `html` for legacy
- `hugo` for legacy

## Custom Markdown Embeds

This project uses custom Hugo Render Hooks to convert standard Markdown image tags into rich components.

### YouTube Embeds (Privacy Aware)

To embed a YouTube video, simply use the standard Markdown image syntax with any YouTube URL.

This embed protects user privacy.

```md
![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```

### 3D Model Viewer

To embed an interactive 3D model using [model-viewer](https://modelviewer.dev/), provide a `.glb` file as the image path.

Also supports alt text and use the Markdown link title field for a `.png` or `.jpg` fallback poster.

```md
![Alt Text](model.glb "poster.png")
```

