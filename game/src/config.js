// config.js — constants for Spot the Difference: canvas size, panel layout,
// levels, timers, hint counts and scoring. One job: hold the numbers.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Two picture panels, side by side, with a gap for the VS badge.
export const PANEL_W = 560;
export const PANEL_H = 560;
export const PANEL_Y = 92;
export const LEFT_X = 36;
export const RIGHT_X = 684;
export const HUD_H = 76;

// Colours used by the HUD and overlays.
export const HUD = {
  bar: '#141a26',
  barEdge: '#2b3548',
  ink: '#f4f1e6',
  dim: '#9aa7bd',
  accent: '#ffc53d',
  good: '#7ee081',
  bad: '#ff6b6b',
  panelEdge: '#e8ddc0',
};

export const LEVELS = [
  { name: "Harbour at Dawn", sub: 'Level 1 · Easy · 5 differences', time: 120, hints: 3 },
  { name: 'Night Market', sub: 'Level 2 · Medium · 7 differences', time: 150, hints: 3 },
  { name: "Clockmaker's Workshop", sub: 'Level 3 · Hard · 10 differences', time: 180, hints: 3 },
];

export const SCORE_FIND = 100;
export const SCORE_TIME_BONUS_PER_SEC = 5;
export const WRONG_CLICK_PENALTY_SEC = 5;
export const HINT_PULSE_MS = 1200;
export const CLICK_RADIUS = 30;
