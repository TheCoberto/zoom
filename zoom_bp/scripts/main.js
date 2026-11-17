import { world, system, InputButton, ButtonState, EasingType } from "@minecraft/server";

// ---- Tuning -------------------------------------------------------------
const ZOOM_FOV = 30;          // Field of view while zoomed (game clamps to ~30-110)
const DOUBLE_TAP_TICKS = 8;   // Max ticks between Sneak taps to count as a double-tap (20 ticks = 1s)
const EASE_SECONDS = 0.15;    // Zoom in/out animation length
// -------------------------------------------------------------------------

/** @type {Map<string, { lastSneakTick: number, zoomed: boolean }>} */
const state = new Map();

function getState(player) {
	let s = state.get(player.id);
	if (!s) {
		s = { lastSneakTick: -Infinity, zoomed: false };
		state.set(player.id, s);
	}
	return s;
}

function zoomIn(player) {
	player.camera.setFov({
		fov: ZOOM_FOV,
		easeOptions: { easeTime: EASE_SECONDS, easeType: EasingType.OutQuad },
	});
}

function zoomOut(player) {
	// The Camera API has no "clear FOV" method, so use the command equivalent,
	// which restores the player's own FOV setting.
	player.runCommand(`camera @s fov_clear ${EASE_SECONDS} out_quad`);
}

function setZoom(player, zoomed) {
	const s = getState(player);
	if (s.zoomed === zoomed) return;
	s.zoomed = zoomed;
	try {
		zoomed ? zoomIn(player) : zoomOut(player);
	} catch (e) {
		console.warn(`[Zoom] Failed to ${zoomed ? "zoom in" : "zoom out"} for ${player.name}: ${e}`);
	}
}

// Double-tap Sneak toggles zoom.
world.afterEvents.playerButtonInput.subscribe(
	({ player, button, newButtonState }) => {
		if (button !== InputButton.Sneak || newButtonState !== ButtonState.Pressed) return;

		const s = getState(player);
		const now = system.currentTick;

		if (now - s.lastSneakTick <= DOUBLE_TAP_TICKS) {
			s.lastSneakTick = -Infinity; // consume, so a triple-tap doesn't toggle twice
			setZoom(player, !s.zoomed);
		} else {
			s.lastSneakTick = now;
		}
	},
	{ buttons: [InputButton.Sneak], state: ButtonState.Pressed }
);

// Reset on join/respawn so nobody gets stuck zoomed in.
world.afterEvents.playerSpawn.subscribe(({ player }) => {
	const s = getState(player);
	s.zoomed = true; // force setZoom to actually run the reset
	setZoom(player, false);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
	state.delete(playerId);
});
