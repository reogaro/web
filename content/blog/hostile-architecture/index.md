+++
title = 'Hostile Internet Architecture: Building a Zero-Dependency Web'
date = 2026-06-24T10:33:00+02:00
draft = false
tags = ['privacy', 'web', 'security']
categories = ['blog']
image = "codescreen-web.jpg"
transparentimg = "computer-web.png"
summary = "The modern web is a surveillance machine. Here is how and why this site explicitly rejects the entire modern telemetry stack."
+++

The modern web is a surveillance apparatus bolted onto a content delivery system. If you inspect the network payload of an average blog today, you will find 15 megabytes of obfuscated JavaScript, seven different tracking pixels, and a consent banner that requires a law degree to decipher. I just wanted to know how to replace my car radio!

This is not a technical necessity.

This infrastructure exists because developers have been conditioned by the Silicon Valley ouroboros, believing that outsourcing fundamental web capabilities to megacorp Content Delivery Networks (CDNs) and SaaS analytics firms is the way to build software.

It isn't. If you rely on external corpos to host your content and logic, you are an internet peasant sharecropping on someone else's digital real estate. They dictate the terms, they watch and track your browsing habits, and they can sever your routing at will.

Most of the internet's structural problems could be solved if more people took the time to build their own personal platforms. The goal is to become an *Internet Landlord*, to serve the bytes yourself, and exercise absolute sovereignty over your payload, giving your users the best possible experience.

This website explicitly rejects the drive towards technocapital singularity. It is a closed loop. There are no cookies, no external dependencies, and no tracking scripts. 

### The CDN Delusion

The prevailing dogma dictated by silicon valley is that you must tether your stack to a global CDN for "performance." The logic implies that because a Google or Cloudflare edge node is physically closer to the user, the asset will load faster.

In reality, for most pages, the latency cost of resolving five different DNS queries, establishing five separate TLS handshakes, and negotiating connection pooling across disparate domains completely obliterates any geographical advantage.

This page hosts everything locally. The fonts are served directly from this domain. The 3D model viewer ([`model-viewer.js`](https://modelviewer.dev/)), which typically relies on dynamic worker injection from Google's servers, has been stripped from the cloud and hardcoded into the local repository. The browser makes exactly one DNS resolution and one TLS handshake. The time-to-interactive is virtually instant. 

### Cryptographic Isolation

It is one thing to promise you aren't running analytics; it is another to mathematically guarantee it to the client.

This server deploys a ultra-strict Content Security Policy (CSP). The HTTP response headers cryptographically forbid the browser from executing any third-party scripts or loading remote tracking pixels. 

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob: data:;
```

Even if a compromised dependency attempted a supply-chain attack to exfiltrate telemetry, your browser would violently sever the connection. It is physically impossible for a third-party tracker to execute on this domain. I don't know who you are, I don't know your bounce rate, and I frankly do not care. I just hope you enjoyed your stay and perhaps even learned something.

### Jailing the Embeds

The most egregious privacy violations usually occur through third-party embeds—specifically YouTube. Standard embedded iframes immediately begin fingerprinting the user the millisecond the DOM parses, long before the user ever presses play.

To fix this, we [put the megacorp in a sandbox](/blog/privacy-respecting-youtube-embeds-in-hugo/). When you view a page with a video on this site, your browser never contacts a Google server. The build pipeline intercepts the URL, strips the payload, downloads the thumbnail locally, and serves you a sterile, static image. Only if you explicitly click the "Play" button does a JavaScript hook dynamically inject the iframe—and even then, it is forced through the `youtube-nocookie.com` domain.

### The Result

By ripping out the telemetry, not using CDNs, and aggressively caching assets, we are left with a web environment that feels aggressively fast and profoundly silent. 

It requires more effort to maintain. Updates to external libraries require manual downloads rather than blindly bumping a version number in a CDN string and praying the host hasn't been compromised. But the trade-off is absolute sovereignty over the payload delivered to the user.

### The Metric: A Study in Bloat

To underline this point with empirical data, we ran a direct payload analysis comparing this infrastructure to a standard corpo platform. 

**Methodology:**
A headless Python `urllib.request` script with a spoofed modern Chrome User-Agent (`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...`) was used to execute an HTTP GET request. We intercepted the raw, unrendered Document Object Model (DOM) byte-stream before the browser could parse it or trigger any secondary asset downloads (images, CSS, or JS).

**The Subjects:**
1. **Standard Bloatware:** An arbitrary, text-heavy [Medium.com article](https://medium.com/personal-growth/what-people-in-their-80s-wish-they-d-done-differently-at-your-age-214744e98f93).
2. **This Architecture:** The local [ROG Keyboard repair log](https://servopunk.net/blog/asus-rog-keyboard-shuts-down-linux-pc/). 

**The Results:**
- **Medium Payload:** 115,327 bytes (115 KB)
- **SERVOPUNK Payload:** 12,314 bytes (12 KB)

Keep in mind, this is an almost mathematically perfect 10x differential **before** the browser even begins downloading the assets. The Medium DOM is saturated with Apollo GraphQL state hydration, tracking hooks, and React framework bootloaders. Once the browser parses that 115 KB document, it is immediately instructed to download several megabytes of third-party JavaScript to render the telemetry and the UI. 

Our 12 KB document instructs your browser to do exactly one thing: render the text on your screen. No trackers. No other servers.

And they both do the same thing: Present a text article to the user.

[Building a blog is easy](/blog/the-web-is-dead/). You just have to stop feeding the ouroboros and build the infrastructure yourself.

