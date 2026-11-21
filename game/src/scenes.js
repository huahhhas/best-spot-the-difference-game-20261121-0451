// scenes.js — the three scenes and their differences.
// One job: know what each picture shows and where its differences hide.
// Each scene draws itself into a 560x560 panel; `mods` holds the ids of the
// differences to apply (the right panel gets all of them, the left none).
// Every picture is deterministic: decoration uses a seeded random only.

import { circle, ellipse, rect, rr, poly, line, text, star, vgrad, mulberry32 } from './draw.js';

function gull(ctx, x, y, s, col) {
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y); ctx.quadraticCurveTo(x - 5 * s, y - 9 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 9 * s, x + 12 * s, y);
  ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
}

function sailboat(ctx, x, y, s, hull, sail, flag) {
  // Hull.
  poly(ctx, [[x - 42 * s, y], [x + 42 * s, y], [x + 30 * s, y + 18 * s], [x - 30 * s, y + 18 * s]], hull);
  // Mast + sail.
  line(ctx, x, y, x, y - 62 * s, '#5a3d24', 4);
  poly(ctx, [[x + 4, y - 58 * s], [x + 4, y - 8 * s], [x + 40 * s, y - 8 * s]], sail);
  if (flag) poly(ctx, [[x, y - 62 * s], [x + 22 * s, y - 56 * s], [x, y - 50 * s]], '#d64545');
}

function lighthouse(ctx, x, y, h) {
  // Tower with red bands, gallery and lamp room.
  rect(ctx, x - 16, y - h, 32, h, '#f4efe2');
  rect(ctx, x - 16, y - h + 26, 32, 16, '#d64545');
  rect(ctx, x - 16, y - h + 66, 32, 16, '#d64545');
  rect(ctx, x - 22, y - h - 6, 44, 10, '#3a3a3a');
  rect(ctx, x - 12, y - h - 26, 24, 20, '#ffd76a');
  poly(ctx, [[x - 16, y - h - 26], [x + 16, y - h - 26], [x, y - h - 44]], '#d64545');
  circle(ctx, x, y - h - 16, 7, '#fff3b0');
}

const HARBOUR = {
  id: 'harbour',
  name: "Harbour at Dawn",
  diffs: [
    { id: 'sun-rays', x: 430, y: 100, r: 30 },
    { id: 'gull', x: 250, y: 95, r: 26 },
    { id: 'buoy', x: 180, y: 470, r: 28 },
    { id: 'post', x: 140, y: 448, r: 26 },
    { id: 'flag', x: 305, y: 330, r: 26 },
  ],
  draw(ctx, W, H, mods) {
    // Dawn sky and sun.
    vgrad(ctx, 0, 0, W, 300, [[0, '#ffd9a0'], [0.55, '#ff9e7d'], [1, '#7fb2e5']]);
    if (!mods.has('sun-rays')) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        line(ctx, 430 + Math.cos(a) * 52, 100 + Math.sin(a) * 52, 430 + Math.cos(a) * 68, 100 + Math.sin(a) * 68, '#ffe9a8', 4);
      }
    }
    circle(ctx, 430, 100, 42, '#fff3b0');
    // Clouds.
    ellipse(ctx, 120, 80, 62, 18, 'rgba(255,255,255,0.85)');
    ellipse(ctx, 170, 72, 48, 15, 'rgba(255,255,255,0.8)');
    ellipse(ctx, 330, 150, 55, 15, 'rgba(255,255,255,0.7)');
    // Gulls.
    if (!mods.has('gull')) gull(ctx, 250, 95, 1, '#3a3a3a');
    gull(ctx, 300, 70, 0.8, '#3a3a3a');
    gull(ctx, 190, 130, 0.9, '#3a3a3a');
    // Distant hills.
    poly(ctx, [[0, 300], [90, 238], [200, 288], [320, 246], [430, 296], [560, 262], [560, 300]], '#5d7a9e');
    // Sea.
    vgrad(ctx, 0, 300, W, 260, [[0, '#2f6f9f'], [1, '#1d4e79']]);
    const rnd = mulberry32(11);
    for (let i = 0; i < 14; i++) {
      const wx = 30 + rnd() * 500, wy = 320 + rnd() * 220;
      ctx.beginPath(); ctx.arc(wx, wy, 14 + rnd() * 10, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    }
    // Lighthouse on the headland.
    poly(ctx, [[30, 300], [150, 300], [140, 260], [40, 260]], '#6b7f6b');
    lighthouse(ctx, 92, 262, 120);
    // Pier.
    rect(ctx, 60, 420, 260, 14, '#8a6a42');
    rect(ctx, 60, 434, 260, 6, '#6b4e2e');
    for (const px of [80, 140, 200, 260, 300]) {
      if (px === 140 && mods.has('post')) continue;
      rect(ctx, px, 434, 10, 34, '#5a3d24');
    }
    // Crates on the pier.
    rr(ctx, 230, 388, 34, 32, 3, '#b98a4a'); line(ctx, 230, 404, 264, 404, '#8a6a42', 2);
    rr(ctx, 268, 396, 26, 24, 3, '#a87c3e');
    // Boats.
    sailboat(ctx, 305, 380, 1, '#7a4a2b', '#fdf6e3', !mods.has('flag'));
    sailboat(ctx, 460, 430, 0.7, '#4a5a6a', '#e8f0f5', true);
    // Buoy.
    const buoyCol = mods.has('buoy') ? '#2fbf4a' : '#d64545';
    ellipse(ctx, 180, 470, 20, 12, buoyCol);
    poly(ctx, [[172, 470], [188, 470], [180, 448]], '#f4efe2');
    circle(ctx, 180, 446, 4, '#ffd76a');
  },
};

function stall(ctx, x, y, w, awn, goods) {
  // Striped awning.
  for (let i = 0; i < 6; i++) {
    rect(ctx, x + (i * w) / 6, y, w / 6, 26, i % 2 === 0 ? awn : '#f4efe2');
  }
  poly(ctx, [[x - 6, y + 26], [x + w + 6, y + 26], [x + w, y + 40], [x, y + 40]], awn);
  // Counter and goods.
  rect(ctx, x, y + 40, w, 10, '#6b4e2e');
  rect(ctx, x + 6, y + 50, w - 12, 66, '#7a5a38');
  goods(ctx, x, y + 40, w);
}

function lantern(ctx, x, y, col) {
  line(ctx, x, y - 26, x, y - 8, '#2b2b2b', 2);
  ellipse(ctx, x, y, 13, 17, col);
  rect(ctx, x - 6, y - 20, 12, 5, '#d4a017');
  rect(ctx, x - 6, y + 15, 12, 5, '#d4a017');
  circle(ctx, x, y, 4, 'rgba(255,240,180,0.9)');
}

const MARKET = {
  id: 'market',
  name: 'Night Market',
  diffs: [
    { id: 'lantern', x: 120, y: 300, r: 28 },
    { id: 'cat', x: 470, y: 470, r: 30 },
    { id: 'fruit', x: 250, y: 385, r: 26 },
    { id: 'banner', x: 330, y: 150, r: 26 },
    { id: 'star', x: 90, y: 70, r: 24 },
    { id: 'steam', x: 400, y: 350, r: 28 },
    { id: 'awning', x: 300, y: 240, r: 28 },
  ],
  draw(ctx, W, H, mods) {
    // Night sky, moon and stars.
    vgrad(ctx, 0, 0, W, 340, [[0, '#0f1f3d'], [1, '#274b7a']]);
    circle(ctx, 470, 90, 34, '#f4ead0');
    circle(ctx, 458, 80, 7, '#ddd2b2'); circle(ctx, 482, 100, 5, '#ddd2b2');
    const rnd = mulberry32(23);
    for (let i = 0; i < 26; i++) {
      const sx = 20 + rnd() * 520, sy = 16 + rnd() * 220;
      star(ctx, sx, sy, 2 + rnd() * 2.5, 'rgba(255,255,255,0.9)');
    }
    // The one star that vanishes on the right sits at (90, 70).
    if (!mods.has('star')) star(ctx, 90, 70, 5, '#ffffff');
    // String lights across the top.
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(280, 130, 560, 55);
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2; ctx.stroke();
    const bulbs = ['#ff6b6b', '#ffd76a', '#7ee081', '#6bb8ff', '#ff9ed2'];
    for (let i = 0; i < 11; i++) {
      const t = i / 10, bx = t * 560;
      const by = 60 + (130 - 60) * 2 * t * (1 - t) * 1.6 + (55 - 60) * t * t;
      circle(ctx, bx, by + 8, 6, bulbs[i % bulbs.length]);
    }
    // Banner with a star (right panel: a circle instead).
    rect(ctx, 300, 118, 60, 64, '#d64545');
    if (mods.has('banner')) circle(ctx, 330, 150, 14, '#ffd76a');
    else star(ctx, 330, 150, 16, '#ffd76a');
    // Stall 1: fruit.
    stall(ctx, 40, 230, 180, '#c94f4f', (c, x, y) => {
      for (let i = 0; i < 8; i++) circle(c, x + 22 + (i % 4) * 34, y - 8 - Math.floor(i / 4) * 16, 11, '#ff8c42');
      circle(c, x + 90, y - 30, 11, '#ff8c42');
    });
    // Stall 2: lanterns and jars.
    stall(ctx, 250, 230, 180, mods.has('awning') ? '#e0a92e' : '#2e8b8b', (c, x, y) => {
      for (let i = 0; i < 3; i++) {
        ellipse(c, x + 30 + i * 55, y - 12, 14, 18, ['#7a5a9e', '#c97a2e', '#4a7a5a'][i]);
      }
    });
    // Stall 3: bread.
    stall(ctx, 440, 230, 100, '#7a5a9e', (c, x, y) => {
      for (let i = 0; i < 3; i++) ellipse(c, x + 22 + i * 28, y - 8, 13, 8, '#e0b96a');
    });
    // Hanging lantern (changes colour on the right).
    lantern(ctx, 120, 300, mods.has('lantern') ? '#3a7bd5' : '#d64545');
    lantern(ctx, 520, 290, '#2e8b8b');
    // Food cart steam.
    if (!mods.has('steam')) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(400 + i * 10, 350 - i * 14, 8 + i * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    // The missing orange on stall 1.
    if (!mods.has('fruit')) circle(ctx, 250, 385, 11, '#ff8c42');
    // Cobbles.
    rect(ctx, 0, 420, W, 140, '#2e2a33');
    const rnd2 = mulberry32(37);
    for (let i = 0; i < 60; i++) {
      ellipse(ctx, rnd2() * 560, 430 + rnd2() * 120, 14, 7, 'rgba(255,255,255,0.06)');
    }
    // Cat on a crate (right side).
    if (!mods.has('cat')) {
      rr(ctx, 440, 470, 64, 40, 4, '#8a6a42');
      ellipse(ctx, 472, 466, 22, 16, '#3a3a3a'); // body
      circle(ctx, 490, 448, 11, '#3a3a3a'); // head
      poly(ctx, [[484, 440], [488, 430], [492, 440]], '#3a3a3a');
      poly(ctx, [[494, 440], [498, 430], [502, 440]], '#3a3a3a');
      line(ctx, 452, 470, 436, 452, '#3a3a3a', 4); // tail
    } else {
      rr(ctx, 440, 470, 64, 40, 4, '#8a6a42');
    }
  },
};

function wallClock(ctx, x, y, r, face, hands, rim) {
  circle(ctx, x, y, r, rim);
  circle(ctx, x, y, r - 5, face);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    circle(ctx, x + Math.cos(a) * (r - 12), y + Math.sin(a) * (r - 12), 2, '#3a3a3a');
  }
  const [ha, ma] = hands;
  line(ctx, x, y, x + Math.cos(ha) * r * 0.45, y + Math.sin(ha) * r * 0.45, '#222', 4);
  line(ctx, x, y, x + Math.cos(ma) * r * 0.7, y + Math.sin(ma) * r * 0.7, '#222', 3);
  circle(ctx, x, y, 4, '#d64545');
}

const WORKSHOP = {
  id: 'workshop',
  name: "Clockmaker's Workshop",
  diffs: [
    { id: 'hands', x: 150, y: 150, r: 30 },
    { id: 'gear', x: 350, y: 480, r: 26 },
    { id: 'book', x: 60, y: 300, r: 26 },
    { id: 'cuckoo', x: 280, y: 120, r: 26 },
    { id: 'lamp', x: 470, y: 90, r: 28 },
    { id: 'tool', x: 420, y: 500, r: 26 },
    { id: 'wstar', x: 500, y: 140, r: 24 },
    { id: 'pendulum', x: 200, y: 380, r: 26 },
    { id: 'face', x: 380, y: 200, r: 26 },
    { id: 'tail', x: 120, y: 500, r: 28 },
  ],
  draw(ctx, W, H, mods) {
    // Warm wall and floor.
    vgrad(ctx, 0, 0, W, 400, [[0, '#8a5a3b'], [1, '#6b4226']]);
    rect(ctx, 0, 400, W, 160, '#5a3d24');
    for (let i = 0; i < 8; i++) line(ctx, 0, 420 + i * 18, W, 420 + i * 18, 'rgba(0,0,0,0.15)', 1);
    // Window with night sky (top right).
    rect(ctx, 440, 60, 100, 130, '#2b3548');
    rect(ctx, 448, 68, 84, 114, '#16213e');
    circle(ctx, 512, 96, 16, '#f4ead0');
    if (!mods.has('wstar')) star(ctx, 500, 140, 7, '#fff');
    star(ctx, 462, 160, 5, '#fff');
    line(ctx, 490, 68, 490, 182, '#2b3548', 4); line(ctx, 448, 125, 532, 125, '#2b3548', 4);
    // Hanging lamp (lit on the left, dark on the right).
    line(ctx, 470, 0, 470, 60, '#2b2b2b', 3);
    if (!mods.has('lamp')) {
      circle(ctx, 470, 90, 34, 'rgba(255,214,106,0.28)');
      circle(ctx, 470, 90, 22, 'rgba(255,214,106,0.55)');
    }
    poly(ctx, [[452, 66], [488, 66], [478, 92], [462, 92]], '#3a7a4a');
    circle(ctx, 470, 92, 8, mods.has('lamp') ? '#5a5a5a' : '#ffe9a8');
    // Big wall clock (hands move on the right).
    const hands = mods.has('hands') ? [-0.6, 2.2] : [-2.2, 0.5];
    wallClock(ctx, 150, 150, 62, '#f4efe2', hands, '#7a4a2b');
    // Cuckoo clock.
    rr(ctx, 250, 84, 60, 72, 6, '#5a3d24');
    circle(ctx, 280, 120, 24, '#f4efe2');
    circle(ctx, 280, 120, 3, '#222');
    line(ctx, 280, 120, 280, 102, '#222', 2); line(ctx, 280, 120, 294, 126, '#222', 2);
    poly(ctx, [[250, 84], [310, 84], [280, 62]], '#7a4a2b');
    if (mods.has('cuckoo')) {
      ellipse(ctx, 280, 74, 10, 8, '#2e8b8b'); // bird pops out
      circle(ctx, 288, 70, 5, '#2e8b8b');
      poly(ctx, [[292, 70], [300, 72], [292, 74]], '#ff8c42');
    }
    // Small round clock (face dot changes colour).
    wallClock(ctx, 380, 200, 40, '#e8f0f5', [-1.2, 1.1], '#3a3a3a');
    circle(ctx, 380, 200, 5, mods.has('face') ? '#2fbf4a' : '#d64545');
    // Alarm clock.
    circle(ctx, 480, 260, 30, '#d64545'); circle(ctx, 480, 260, 24, '#f4efe2');
    line(ctx, 480, 260, 480, 242, '#222', 3); line(ctx, 480, 260, 494, 268, '#222', 3);
    line(ctx, 462, 236, 454, 226, '#d64545', 4); line(ctx, 498, 236, 506, 226, '#d64545', 4);
    // Pendulum clock (pendulum swings the other way on the right).
    rr(ctx, 170, 300, 60, 110, 6, '#7a4a2b');
    circle(ctx, 200, 330, 22, '#f4efe2');
    const px = mods.has('pendulum') ? 216 : 184;
    line(ctx, 200, 352, px, 396, '#c9a227', 3);
    circle(ctx, px, 398, 10, '#c9a227');
    // Bookshelf with books (one spine changes colour).
    rect(ctx, 30, 260, 70, 130, '#4a3220');
    const cols = ['#c94f4f', '#2e8b8b', '#d4a017', '#7a5a9e', '#4a7a5a'];
    for (let i = 0; i < 5; i++) {
      const col = i === 1 && mods.has('book') ? '#2fbf4a' : cols[i];
      rect(ctx, 36 + i * 12, 272, 10, 52, col);
    }
    rect(ctx, 30, 330, 70, 8, '#4a3220');
    for (let i = 0; i < 4; i++) rect(ctx, 36 + i * 14, 344, 12, 40, ['#8a6a42', '#5a7a9e', '#c97a2e', '#6b8a4a'][i]);
    // Workbench.
    rect(ctx, 240, 450, 300, 16, '#8a6a42');
    rect(ctx, 250, 466, 12, 60, '#5a3d24'); rect(ctx, 520, 466, 12, 60, '#5a3d24');
    // Gears on the bench (one missing on the right).
    const gear = (gx, gy, r, teeth) => {
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        rect(ctx, gx + Math.cos(a) * r - 3, gy + Math.sin(a) * r - 3, 6, 6, '#c9a227');
      }
      circle(ctx, gx, gy, r, '#d4af37'); circle(ctx, gx, gy, r * 0.4, '#8a6d1f');
    };
    gear(300, 480, 16, 8);
    if (!mods.has('gear')) gear(350, 480, 13, 8);
    gear(395, 480, 11, 7);
    // Screwdriver (missing on the right).
    if (!mods.has('tool')) {
      line(ctx, 420, 492, 448, 508, '#d64545', 5);
      rect(ctx, 414, 488, 12, 8, '#2b2b2b');
    }
    // Oil can.
    poly(ctx, [[470, 470], [496, 470], [490, 500], [476, 500]], '#5a7a9e');
    line(ctx, 494, 476, 508, 466, '#5a7a9e', 3);
    // Cat asleep on a chair (tail curls differently on the right).
    rr(ctx, 60, 470, 110, 18, 6, '#7a4a2b');
    rect(ctx, 66, 488, 8, 38, '#5a3d24'); rect(ctx, 156, 488, 8, 38, '#5a3d24');
    ellipse(ctx, 115, 462, 42, 20, '#e8a04c');
    circle(ctx, 152, 452, 13, '#e8a04c');
    poly(ctx, [[146, 442], [150, 432], [156, 442]], '#e8a04c');
    if (mods.has('tail')) line(ctx, 76, 470, 60, 452, '#e8a04c', 5);
    else line(ctx, 76, 470, 58, 478, '#e8a04c', 5);
    line(ctx, 148, 456, 154, 456, '#3a3a3a', 2); // closed eye
  },
};

export const SCENES = [HARBOUR, MARKET, WORKSHOP];
