# The Forge — Devasurya J Menon

My portfolio, built as an ambient blacksmith's workshop you can walk through.

**Live:** https://devasurya05.github.io

Scroll to pan across the room. Everything on the bench is a real project — step close
and it heats up; pick it up and it shows you how it was made. Visitors can strike
their own mark into the shield on the far wall.

## How it's built

Hand-written HTML/CSS/JS — no frameworks, no build step, no dependencies.

- The workshop is a single hand-drawn SVG scene (3200×900) with pointer parallax,
  a canvas ember system, and synthesized WebAudio fire ambience (no audio files).
- Each section is a hash-routed full-screen view in the same document — zero
  navigation load time, working back button, `Esc` returns to the workshop.
- The Visitors' Wall stores marks (a sigil + metal + initials, strictly validated)
  via Supabase's free tier; see [README-GUESTBOOK.md](README-GUESTBOOK.md).
- Accessible: real semantic DOM under the scene, keyboard-reachable hotspots,
  `prefers-reduced-motion` respected, touch-native panning on phones.

Forged in a directed collaboration with Claude.
