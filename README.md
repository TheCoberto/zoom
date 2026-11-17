# Zoom
**Minecraft Bedrock Zoom Add-On**

Double-tap **Sneak** to zoom in. Double-tap again to zoom back out.

| Platform | Sneak button |
|---|---|
| Keyboard | Shift (or whatever Sneak is bound to) |
| Controller | B / Circle (default) |
| Touch | Sneak button |

No experimental toggles needed. It uses only stable Script API features (`@minecraft/server` 2.11.0).

## Why double-tap Sneak?
Bedrock add-ons can't add custom keybinds or read raw keys. Scripts can only see a few inputs, such as Jump and Sneak (`playerButtonInput`) and item use. Double-tapping Sneak is the same on every platform and doesn't get in the way of normal sneaking.

## Tuning
Settings are at the top of `zoom_bp/scripts/main.js`:
- `ZOOM_FOV`: field of view while zoomed (the game clamps to about 30–110)
- `DOUBLE_TAP_TICKS`: how fast the double-tap has to be (20 ticks = 1 second)
- `EASE_SECONDS`: length of the zoom animation

## Install for testing
Copy `zoom_bp` into `com.mojang/development_behavior_packs`, then turn it on under the world's Behavior Packs.

When new versions of Minecraft come out, this pack may need updating. Bump the `@minecraft/server` version and `min_engine_version` in `manifest.json`.
