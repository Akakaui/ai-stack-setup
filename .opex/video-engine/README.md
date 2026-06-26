# VIDEO ENGINE

Last updated: 2025-01-25
Version: 1

## PURPOSE

Programmatic video production for Instagram reels and
YouTube content using Remotion (React-based video framework).

## DIRECTORY STRUCTURE

video-engine/
  templates/
    reels/          ← 9:16 Remotion compositions
    youtube/        ← 16:9 Remotion compositions
  components/
    motion.md       ← spring animations, easing specs
    typography.md   ← kinetic text components
    transitions.md  ← scene transition library
    overlays.md     ← lower thirds, captions, CTAs
  global-assets/
    fonts/          ← Montserrat, Space Grotesk, etc.
    icons/          ← icon assets
    music/          ← background music tracks
    brand/          ← brand assets (logo, colors)

## SETUP

Prerequisites:
  - Node.js 18+
  - pnpm (preferred) or npm

Install:
  cd video-engine
  pnpm install

## USAGE

Preview composition:
  npx remotion preview [composition-name]

Render to MP4:
  npx remotion render [composition-name] [output.mp4]

## COMPOSITION TYPES

### Reel (9:16)

  Resolution: 1080x1920
  Frame rate: 30fps
  Duration: 15-30 seconds

  Use for: Instagram reels, TikTok, YouTube Shorts

### YouTube (16:9)

  Resolution: 1920x1080
  Frame rate: 30fps
  Duration: varies

  Use for: YouTube videos, tutorials, explainers

## BRAND SETTINGS

  Background: #0A0A0A
  Card: #141414
  Accent: #FF6500
  Text: #FFFFFF
  Secondary: #A0A0A0
  Font: Montserrat Bold (headlines), Regular (body)

## WORKFLOW

1. Video Agent writes scene script
2. Design Agent creates any needed assets
3. Agent assembles Remotion composition
4. Preview → confirm → render
5. Output to video-engine/output/
6. Push to Notion for posting
