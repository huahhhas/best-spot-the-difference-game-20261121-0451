// draw.js — small canvas helpers and the shared panel renderer.
// One job: draw shapes, panels, markers and the HUD. No game state lives here.

import { CANVAS_W, CANVAS_H, PANEL_W, PANEL_H, PANEL_Y, LEFT_X, RIGHT_X, HUD, HUD_H } from './config.js';

// Deterministic pseudo-random: same seed, same picture, every run.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}

export function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

export function poly(ctx, points, fill, stroke, lw) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}

export function line(ctx, x1, y1, x2, y2, stroke, lw) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke();
}

export function text(ctx, str, x, y, size, fill, align, weight) {
  ctx.font = `${weight || '700'} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = fill; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

export function star(ctx, x, y, r, fill) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, rad = i % 2 === 0 ? r : r * 0.38;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}

export function vgrad(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, col] of stops) g.addColorStop(at, col);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}

// Draw one panel: the scene (left = original, right = with differences applied),
// a frame, and green rings on every difference already found.
export function drawPanel(ctx, scene, side, found, hintPulse) {
  const px = side === 'left' ? LEFT_X : RIGHT_X;
  ctx.save();
  ctx.beginPath(); ctx.rect(px, PANEL_Y, PANEL_W, PANEL_H); ctx.clip();
  ctx.translate(px, PANEL_Y);
  const mods = side === 'right' ? new Set(scene.diffs.map((d) => d.id)) : new Set();
  scene.draw(ctx, PANEL_W, PANEL_H, mods);
  ctx.restore();
  // Frame + side tag.
  ctx.lineWidth = 5; ctx.strokeStyle = HUD.panelEdge;
  ctx.strokeRect(px + 2, PANEL_Y + 2, PANEL_W - 4, PANEL_H - 4);
  rr(ctx, px + 10, PANEL_Y + 10, 74, 30, 8, 'rgba(20,26,38,0.85)');
  text(ctx, side === 'left' ? 'ORIGINAL' : 'CHANGED', px + 47, PANEL_Y + 26, 15, '#f4f1e6', 'center');
  // Found markers on both panels.
  for (const d of scene.diffs) {
    if (!found.has(d.id)) continue;
    for (const sx of [LEFT_X, RIGHT_X]) {
      ctx.beginPath(); ctx.arc(sx + d.x, PANEL_Y + d.y, d.r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#2fbf4a'; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(sx + d.x, PANEL_Y + d.y, d.r + 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(47,191,74,0.45)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  // Hint pulse: an expanding ring on the hinted difference, both panels.
  if (hintPulse) {
    const t = hintPulse.elapsed / hintPulse.duration;
    const r = 14 + t * 34;
    const alpha = 1 - t;
    for (const sx of [LEFT_X, RIGHT_X]) {
      ctx.beginPath(); ctx.arc(sx + hintPulse.x, PANEL_Y + hintPulse.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,197,61,${alpha})`; ctx.lineWidth = 4; ctx.stroke();
    }
  }
}

// The top HUD bar: title, level name, counter, timer, hints, buttons.
export function drawHud(ctx, level, foundCount, total, timeLeft, hintsLeft, message) {
  rect(ctx, 0, 0, CANVAS_W, HUD_H, HUD.bar);
  line(ctx, 0, HUD_H, CANVAS_W, HUD_H, HUD.barEdge, 2);
  text(ctx, 'SPOT THE DIFFERENCE', 24, 26, 26, HUD.ink, 'left', '800');
  text(ctx, `${level.name}  ·  ${level.sub}`, 24, 54, 15, HUD.dim, 'left');
  // Counter.
  rr(ctx, 560, 14, 170, 48, 10, '#232c3d');
  text(ctx, `Found ${foundCount} of ${total}`, 645, 38, 20, foundCount === total ? HUD.good : HUD.ink, 'center');
  // Timer.
  const low = timeLeft <= 20;
  rr(ctx, 746, 14, 120, 48, 10, low ? '#4a2020' : '#232c3d');
  const mm = Math.floor(Math.max(0, timeLeft) / 60);
  const ss = String(Math.floor(Math.max(0, timeLeft)) % 60).padStart(2, '0');
  text(ctx, `${mm}:${ss}`, 806, 38, 22, low ? HUD.bad : HUD.ink, 'center');
  // Hints.
  rr(ctx, 882, 14, 110, 48, 10, '#232c3d');
  text(ctx, `Hints: ${hintsLeft}`, 937, 38, 18, HUD.accent, 'center');
  // Buttons (drawn; input.js knows their rects).
  rr(ctx, 1008, 14, 120, 48, 10, '#2f6f4f');
  text(ctx, 'HINT (H)', 1068, 38, 17, '#eaffea', 'center');
  rr(ctx, 1140, 14, 116, 48, 10, '#3a4358');
  text(ctx, 'RESTART (R)', 1198, 38, 15, HUD.ink, 'center');
  if (message) {
    text(ctx, message, CANVAS_W / 2, CANVAS_H - 26, 18, '#c9d2e0', 'center');
  }
  // VS badge between the panels.
  circle(ctx, CANVAS_W / 2, PANEL_Y + PANEL_H / 2, 34, '#ffc53d');
  ctx.lineWidth = 3; ctx.strokeStyle = '#8a6d1f';
  ctx.beginPath(); ctx.arc(CANVAS_W / 2, PANEL_Y + PANEL_H / 2, 34, 0, Math.PI * 2); ctx.stroke();
  text(ctx, 'VS', CANVAS_W / 2, PANEL_Y + PANEL_H / 2 + 1, 22, '#3a2c05', 'center', '800');
}

// A centred overlay card (title screen, level complete, win, fail).
export function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,14,22,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const w = 760, h = 120 + lines.length * 44;
  const x = (CANVAS_W - w) / 2, y = (CANVAS_H - h) / 2;
  rr(ctx, x, y, w, h, 18, '#1a2233');
  ctx.lineWidth = 3; ctx.strokeStyle = accent || '#ffc53d';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.stroke();
  text(ctx, title, CANVAS_W / 2, y + 52, 34, '#f4f1e6', 'center', '800');
  lines.forEach((ln, i) => text(ctx, ln, CANVAS_W / 2, y + 108 + i * 44, 19, '#c9d2e0', 'center'));
}
