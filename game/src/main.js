// main.js — game loop and state machine for Spot the Difference.
// One job: own the state (title / playing / level-complete / win / fail),
// run the loop, and wire input, audio and drawing together.

import { CANVAS_W, CANVAS_H, LEVELS, SCORE_FIND, SCORE_TIME_BONUS_PER_SEC, WRONG_CLICK_PENALTY_SEC, HINT_PULSE_MS } from './config.js';
import { SCENES } from './scenes.js';
import { drawPanel, drawHud, drawOverlay } from './draw.js';
import { bindInput, resolvePointer } from './input.js';
import { unlockAudio, playFound, playWrong, playWin, playHint } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  state: 'title', // title | playing | complete | win | fail
  levelIndex: 0,
  found: new Set(),
  timeLeft: LEVELS[0].time,
  hintsLeft: LEVELS[0].hints,
  score: 0,
  totalScore: 0,
  totalTime: 0,
  message: 'Click a difference on either picture!',
  hintPulse: null,
  shakeUntil: 0,
  missMarks: [],
  levelStartAt: 0,

  scene() { return SCENES[this.levelIndex]; },
  level() { return LEVELS[this.levelIndex]; },

  startLevel(i) {
    this.levelIndex = i;
    this.found = new Set();
    this.timeLeft = LEVELS[i].time;
    this.hintsLeft = LEVELS[i].hints;
    this.score = 0;
    this.message = 'Click a difference on either picture!';
    this.hintPulse = null;
    this.missMarks = [];
    this.state = 'playing';
    this.levelStartAt = performance.now();
  },

  finishLevel() {
    const bonus = Math.floor(this.timeLeft) * SCORE_TIME_BONUS_PER_SEC;
    this.score += bonus;
    this.totalScore += this.score;
    this.totalTime += LEVELS[this.levelIndex].time - Math.floor(this.timeLeft);
    this.state = 'complete';
    playWin();
  },

  onPointer(x, y) {
    unlockAudio();
    if (this.state === 'title') { this.startLevel(0); return; }
    if (this.state === 'complete') { this.onNext(); return; }
    if (this.state === 'win' || this.state === 'fail') { this.state = 'title'; return; }
    const act = resolvePointer(this, x, y);
    if (act.kind === 'hint') { this.onHint(); return; }
    if (act.kind === 'restart') { this.onRestart(); return; }
    if (act.kind === 'found') {
      this.found.add(act.diff.id);
      this.score += SCORE_FIND;
      playFound();
      const left = this.scene().diffs.length - this.found.size;
      this.message = left === 0 ? 'All found!' : `Nice! ${left} still hiding.`;
      if (left === 0) this.finishLevel();
      return;
    }
    if (act.kind === 'miss') {
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_PENALTY_SEC);
      this.shakeUntil = performance.now() + 220;
      this.missMarks.push({ x: act.x, y: act.y, side: act.side, until: performance.now() + 700 });
      this.message = `Not there — minus ${WRONG_CLICK_PENALTY_SEC}s!`;
      playWrong();
    }
  },

  onHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) { this.message = 'Out of hints!'; return; }
    const rest = this.scene().diffs.filter((d) => !this.found.has(d.id));
    if (!rest.length) return;
    const pick = rest[Math.floor(Math.random() * rest.length)];
    this.hintsLeft -= 1;
    this.hintPulse = { x: pick.x, y: pick.y, elapsed: 0, duration: HINT_PULSE_MS };
    this.message = 'Hint: look where the ring pulses…';
    playHint();
  },

  onRestart() {
    if (this.state === 'playing' || this.state === 'fail') this.startLevel(this.levelIndex);
  },

  onNext() {
    if (this.state !== 'complete') return;
    if (this.levelIndex + 1 < SCENES.length) this.startLevel(this.levelIndex + 1);
    else {
      this.state = 'win';
      playWin();
    }
  },

  onMenu() { this.state = 'title'; },

  onConfirm() {
    if (this.state === 'title') this.startLevel(0);
    else if (this.state === 'complete') this.onNext();
    else if (this.state === 'win' || this.state === 'fail') this.state = 'title';
  },
};

bindInput(canvas, game);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  // Timer ticks while playing.
  if (game.state === 'playing') {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.state = 'fail';
    }
  }
  if (game.hintPulse) {
    game.hintPulse.elapsed += dt * 1000;
    if (game.hintPulse.elapsed >= game.hintPulse.duration) game.hintPulse = null;
  }
  game.missMarks = game.missMarks.filter((m) => m.until > now);

  // Draw.
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#0e1420';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const scene = game.scene();
  const shaking = now < game.shakeUntil;
  ctx.save();
  if (shaking) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  drawPanel(ctx, scene, 'left', game.found, game.hintPulse);
  drawPanel(ctx, scene, 'right', game.found, game.hintPulse);
  ctx.restore();
  drawHud(ctx, game.level(), game.found.size, scene.diffs.length, game.timeLeft, game.hintsLeft, game.message);
  // Miss marks (red X where the player clicked wrongly).
  for (const m of game.missMarks) {
    const bx = (m.side === 'left' ? 36 : 684) + m.x;
    const by = 92 + m.y;
    ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx - 10, by - 10); ctx.lineTo(bx + 10, by + 10);
    ctx.moveTo(bx + 10, by - 10); ctx.lineTo(bx - 10, by + 10); ctx.stroke();
  }
  if (game.state === 'title') {
    drawOverlay(ctx, 'SPOT THE DIFFERENCE', [
      'Two pictures. One is hiding changes. Find them all!',
      'Click a difference on either picture — a green ring marks it.',
      'Wrong click: −5 seconds.  H = hint,  R = restart,  N = next level.',
      '',
      'Three scenes: Harbour at Dawn (5) · Night Market (7) · Clockmaker’s Workshop (10)',
      '',
      'Click anywhere to play — or press Enter.',
    ], '#ffc53d');
  } else if (game.state === 'complete') {
    drawOverlay(ctx, 'LEVEL COMPLETE!', [
      `${scene.name} — all ${scene.diffs.length} differences found.`,
      `Level score: ${game.score}  ·  Total score: ${game.totalScore}`,
      '',
      game.levelIndex + 1 < SCENES.length ? 'Press N or click for the next scene.' : 'Press N or click for the final screen.',
    ], '#7ee081');
  } else if (game.state === 'win') {
    const mm = Math.floor(game.totalTime / 60);
    const ss = String(game.totalTime % 60).padStart(2, '0');
    drawOverlay(ctx, 'YOU FOUND THEM ALL!', [
      'All three scenes complete. Sharp eyes!',
      `Total score: ${game.totalScore}  ·  Total time: ${mm}:${ss}`,
      '',
      'Click anywhere to play again.',
    ], '#ffc53d');
  } else if (game.state === 'fail') {
    drawOverlay(ctx, 'OUT OF TIME!', [
      `${scene.name} — you found ${game.found.size} of ${scene.diffs.length}.`,
      '',
      'Press R or click to try this scene again.',
    ], '#ff6b6b');
  }
  requestAnimationFrame(frame);
}

// Stage a screenshot state if ?shot= is present, then start the loop.
applyShot(game, null);
requestAnimationFrame(frame);
