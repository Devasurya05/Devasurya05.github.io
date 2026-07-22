# Devasurya Portfolio — The Forge

My portfolio, built as a blacksmith's workshop instead of a normal project list.

**Live:** https://devasurya05.github.io

Scroll (or drag) to pan across the room. Everything on the bench and around the
walls is clickable — pick something up and it opens into a full page about it, no
reload, no waiting. There's also a shield on the wall where visitors can leave their
own mark, and you can see everyone else's who has too.

The blacksmith theme fits because I like making things, and this felt like a more
honest way to show that than a plain list of projects.

## How it's built

- Made entirely with Claude — I directed the design and reviewed every detail
  myself. Part of the point was seeing how much I could build using just Claude and
  prompting, with no other outside tools or resources.
- The whole workshop is one hand-drawn SVG scene, no images. It has parallax,
  glowing embers on a canvas, and background fire/hammer sounds generated in the
  browser — no audio files.
- Each section (projects, skills, and so on) opens instantly on the same page
  instead of loading a new one, and the browser's back button still works normally.
- The guestbook (the shield) is backed by a small free database (Supabase), so
  marks are shared with everyone who visits, not just stored on your own device.
- Plain HTML, CSS, and JavaScript — no frameworks, no build tools, nothing to
  install.

## How it all comes together

The room is one big SVG drawing, and a bit of JavaScript moves the camera across it
as you scroll or drag. Clicking something zooms the camera toward it, fades to
black for a moment, then swaps in that section's content — which is really just a
different part of the same page becoming visible, so there's no reload.

The fire, embers, and hammer sounds aren't recordings — they're generated on the
fly with the Web Audio API, which is why the site has no audio files to load. The
guestbook works like any small web app: the page sends your mark to a database over
the internet, and everyone else's page reads from that same database, which is why
marks show up for every visitor instead of just your own browser.
