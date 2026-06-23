+++
title = "Privacy Respecting YouTube Embeds in HUGO using Shortcodes"
date = 2025-09-27T00:00:00-07:00
draft = false
tags = ['web', 'linux', 'hugo']
categories = ['blog']
image = "privacy-jail.jpg"
transparentimg = "gopher-police.svg"
summary = "Replacing YouTube embeds with just a image, and only loading the iframe embed after clicking."
+++

# TL;DR

The following embed was created by calling `{{</* youtube-privacy VjGSMUep6_4 */>}}`:

{{< youtube-privacy VjGSMUep6_4 >}}

To use the finished product on your page, you need to add the following to your project:

- [HUGO Shortcode](https://github.com/reogaro/web/blob/ce132cc201c4c55a72dd309d5982feb607d8d6cf/themes/kyber/layouts/_shortcodes/youtube-privacy.html) to `themes/{your theme here}/layouts/_shortcodes/youtube-privacy.html`
- [JavaScript](https://github.com/reogaro/web/blob/ce132cc201c4c55a72dd309d5982feb607d8d6cf/themes/kyber/assets/js/youtube-privacy.js) to `themes/{your theme here}/assets/js/youtube-privacy.js`

And the JavaScript to your `<header>`. You could just add it indiscriminately to all pages by adding `{{ partialCached "head/js.html" . }}` to your HTML (most likely `themes/{your theme here}/layouts/_partials/head.html`), or be selective and add it only on the pages [where the Shortcode is used](https://gohugo.io/templates/shortcode/#detection), ([see example](https://github.com/reogaro/web/blob/ce132cc201c4c55a72dd309d5982feb607d8d6cf/themes/kyber/layouts/_partials/head.html)):

```go
{{ if .HasShortcode "youtube-privacy" }}
  {{- with resources.Get "js/youtube-privacy.js" }}
    {{- if eq hugo.Environment "development" }}
      {{- with . | js.Build }}
        <script src="{{ .RelPermalink }}" defer></script>
      {{- end }}
    {{- else }}
      {{- $opts := dict "minify" true }}
      {{- with . | js.Build $opts | fingerprint }}
        <script src="{{ .RelPermalink }}" integrity="{{- .Data.Integrity }}" crossorigin="anonymous" defer ></script>
      {{- end }}
    {{- end }}
  {{- end }}
{{ end }}
```

Voilà. Your YouTube embed, minus the surveillance apparatus, with a side of faster loading times.

---

# But why?

This Site is made using the static site generator [HUGO](https://gohugo.io/). This means it serves HTML, CSS, images and little to no JS to its users. This results in good loading times on even the slowest of connections, and the weakest of hardware:

![](network-analysis-no-embed.png)

Many articles would benefit from embedding Video content from YouTube - but look at the disaster that unfolds when loading *just the video embed* on the same connection: 

![](network-analysis-embed.png)

What the `fsck` - the *embed alone* loads 3.5x slower as the rest of the *entire page*. Google places cookies, runs its analytics to track this sites' users, it even sends a request to some Google Play Store URL (I also don't get it) and runs more JavaScript than I have HTML.

This post will describe a clean way to add custom privacy-respecting YouTube embeds using hugo's [shortcodes](https://gohugo.io/content-management/shortcodes/) system to improve loading times, user privacy, and page responsiveness. And you won't have half of Googles marketing department knocking on your door for opening a blog post.

# But how?

The cleanest way of adding embeds to your page is using HUGO's [shortcodes](https://gohugo.io/content-management/shortcodes/) system. For example, to create a (super simplified) custom YouTube embed, create the file `layouts/_shortcodes/youtube.html`:

```html
{{- with $id := or (.Get "id") (.Get 0) -}}
  <iframe width="640" height="360" src="https://www.youtube.com/embed/{{ $id }}"></iframe> 
{{- else -}}
  {{- errorf "The %q shortcode requires a single positional parameter, the ID of the YouTube video. See %s" .Name .Position -}}
{{- end -}}

```

And Voilà - you can now call `{{</* youtube VjGSMUep6_4 */>}}` in your HTML and markdown files to embed a YouTube video. If you want more features, take a look at the [official HUGO YouTube Shortcode](https://gohugo.io/shortcodes/youtube/) - though it still only embeds the bloated `<iframe>` with all the disadvantages listed above.

# Developing the Solution

Here's how we will attack the problem: Only embed the video thumbnail into the page, add JavaScript that runs if we click it, and add the iframe only if the user clicks on the thumbnail.

We will use a `<a>` link element to act as a fallback and open the video in a new tab in case the JavaScript doesn't run:

```html
<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="youtube-preview-privacy" data-youtube-id="dQw4w9WgXcQ" style="display: block; width: 640px; aspect-ratio: 16 / 9; background: center / cover url('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');"> </a>
```

Notice the `data-youtube-id` property: It contains the Video ID for us to load. Our JS can search for all DOM elements with the `youtube-preview-privacy` class and through JavaScript's `dataset` functionality extract the ID from it, and then replace the `<a>`'s "open link in new tab" functionality with our "create new iframe" functionality:

```js
const replaceWithYouTubeIframe = el => {
  let id = el.dataset.youtubeId || '';
  el.style.background = 'none';

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  iframe.title = 'YouTube video player';
  iframe.allowFullscreen = true;
  Object.assign(iframe.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', display: 'block' });

  el.appendChild(iframe);
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.youtube-preview-privacy').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); replaceWithYouTubeIframe(el); }, { once: true });
  });
});

```

And that’s the basic proof-of-concept. Now we just need the usual trimmings: the red YouTube play button, a loading spinner, error handling, some sanitization, the shortcode glue, and a place to stash the JavaScript so the whole thing behaves.

Also, by fetching the thumbnail from the `i.ytimg.com` servers, we still leak the users' IP and user-agent to Google, so we use HUGO's `resources.GetRemote` to fetch and cache the thumbnail on our server, and serve that.

**On Leaking the IP of your build server**

Using `resources.GetRemote` will result in your dev environment and build server contacting YouTube servers. In case you're severely paranoid, consider using a proxy, fetching on your dev machine, or living off-grid. I wouldn't blame you with this amount of data collection for showing a thumbnail.

I'll save you the specifics, feel free to inspect my implementation on [GitHub](https://github.com/reogaro/web/), which is documented in the solution above!

---
## Update: Refactoring into a Partial

Since originally writing this post, I ran into an issue: what happens if you want to use this privacy-respecting embed in a standard HTML layout template instead of a Markdown file? Hugo shortcodes **only work inside Markdown content**. If you try to use `{{</* youtube-privacy */>}}` in your homepage layout, it simply won't render.

To fix this, the core logic was extracted from the shortcode and moved into a standard partial at `layouts/partials/youtube-privacy.html`.

The shortcode was then updated to act as a lightweight wrapper that passes the video ID to the partial:
```go
{{- $id := or (.Get "id") (.Get 0) -}}
{{- partial "youtube-privacy.html" (dict "id" $id) -}}
```

This simple change keeps the `{{</* youtube-privacy ID */>}}` syntax working flawlessly in your Markdown files, while allowing you to call the exact same logic directly from any layout file using `{{ partial "youtube-privacy.html" (dict "id" "ID") }}`!

*(Note: The links in the tutorial above have been pinned to an older GitHub commit that shows the original, simpler shortcode implementation).*

