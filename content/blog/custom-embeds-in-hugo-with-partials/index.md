+++
title = "Custom Embeds in HUGO using partials"
date = 2025-09-13T00:00:00-07:00
draft = true
tags = ['web', 'linux', 'hugo']
categories = ['blog']
image = "image.jpg"
transparentimg = "hugo.png"
summary = "What went wrong with the world wide web? A deeper look at systemic problems and a search for solutions."
+++

# The Problem

This Site is made using the static site generator [HUGO](https://gohugo.io/). Many posts would benefit from embedding files that are not natively supported by browsers, such as 3D models, and third-party embeds such as YouTube that don't respect users' privacy and require sandboxing.

This post will describe a clean way to add custom embeds using [shortcodes](https://gohugo.io/content-management/shortcodes/), even if they require JavaScript or CSS files in the `<head>` of the pages' HTML.

# Shortcodes

The cleanest way of adding embeds to your page is using HUGO's [shortcodes](https://gohugo.io/content-management/shortcodes/) system. For example, to create a (super simplified) custom YouTube embed, create the file `layouts/shortcodes/youtube.html`:

```html
{{- with $id := or (.Get "id") (.Get 0) -}}
  <iframe width="640" height="360" src="https://www.youtube.com/embed/{{ $id }}"></iframe> 
{{- else -}}
  {{- errorf "The %q shortcode requires a single positional parameter, the ID of the YouTube video. See %s" .Name .Position -}}
{{- end -}}

```

And vollià - you can now call `{{ youtube yTeTJzWYRWM }}` in your HTML and markdown files to embed a YouTube video.

*Note: If you want more features in your YouTube shortcode, take a look at the [official version](https://gohugo.io/shortcodes/youtube/)*

Also: there was a recent overhaul of the shortcode system, many older tutorials are out-of-date: https://gohugo.io/templates/new-templatesystem-overview/

# Flexibly adding scripts to the header

https://gohugo.io/templates/shortcode/#detection

