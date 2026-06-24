# [SERVOPUNK Website](https://servopunk.net/)

The SERVOPUNK website @ servopunk.net

Branches:

- `master` for general development
- `prod` for [current deployment](https://servopunk.net/)
- `html` for legacy
- `hugo` for legacy

## Development

To spin up the local server without any aggressive caching getting in the way of your CSS/JS updates, run:

```bash
hugo server -D --noHTTPCache --disableFastRender
```

## Content Creation

The site uses custom archetypes to automatically scaffold the required TOML frontmatter (SEO tags, categories, images). Because the site uses "Leaf Bundles" (where you drop your images in the same folder as the post), always target an `index.md` file:

**Create a new Blog Post:**
```bash
hugo new content/blog/your-post-title/index.md
```

**Create a new Project:**
```bash
hugo new content/project/your-project-title/index.md
```

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

