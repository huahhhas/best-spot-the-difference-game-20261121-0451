// input.js — mouse and keyboard input for the game.
// One job: turn clicks and keys into game actions. Knows the panel geometry
// and the HUD button rects; the game object supplies the callbacks.

import { PANEL_W, PANEL_H, PANEL_Y, LEFT_X, RIGHT_X, CLICK_RADIUS } from './config.js';

export const HINT_BTN = { x: 1008, y: 14, w: 120, h: 48 };
export const RESTART_BTN = { x: 1140, y: 14, w: 116, h: 48 };

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Which panel (if any) a canvas point falls in, and its panel-local coords.
function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= LEFT_X && x <= LEFT_X + PANEL_W) return { side: 'left', x: x - LEFT_X, y: y - PANEL_Y };
  if (x >= RIGHT_X && x <= RIGHT_X + PANEL_W) return { side: 'right', x: x - RIGHT_X, y: y - PANEL_Y };
  return null;
}

export function bindInput(canvas, game) {
  canvas.addEventListener('pointerdown', (ev) => {
    const r = canvas.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * canvas.width;
    const y = ((ev.clientY - r.top) / r.height) * canvas.height;
    game.onPointer(x, y);
  });
  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    if (k === 'h') game.onHint();
    else if (k === 'r') game.onRestart();
    else if (k === 'n') game.onNext();
    else if (k === 'escape') game.onMenu();
    else if (k === 'enter' || k === ' ') game.onConfirm();
  });
}

// Resolve a pointer position into an action: a HUD button, a found
// difference, a miss, or nothing (title screens handle their own clicks).
export function resolvePointer(game, x, y) {
  if (game.state !== 'playing') return { kind: 'screen' };
  if (inside(HINT_BTN, x, y)) return { kind: 'hint' };
  if (inside(RESTART_BTN, x, y)) return { kind: 'restart' };
  const p = panelAt(x, y);
  if (!p) return { kind: 'none' };
  const scene = game.scene();
  for (const d of scene.diffs) {
    if (game.found.has(d.id)) continue;
    const dx = p.x - d.x, dy = p.y - d.y;
    if (dx * dx + dy * dy <= (d.r + CLICK_RADIUS) * (d.r + CLICK_RADIUS)) {
      return { kind: 'found', diff: d };
    }
  }
  return { kind: 'miss', x: p.x, y: p.y, side: p.side };
}
