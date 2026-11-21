// shots.js — stage the game for screenshots through a ?shot= URL param.
// One job: put the game into a photogenic state. Real game code, real states:
// the screenshots are renders of the game itself, never composites.

export function applyShot(game, shot) {
  const q = new URLSearchParams(window.location.search);
  const name = shot || q.get('shot');
  if (!name) return false;
  if (name === 'cover') {
    // Scene 2 mid-game: 3 found with rings, 4 still unfound, counter + timer.
    game.startLevel(1);
    const ids = game.scene().diffs.slice(0, 3).map((d) => d.id);
    game.found = new Set(ids);
    game.timeLeft = 92;
    game.message = 'Three found — four still hiding!';
    return true;
  }
  if (name === 'title') {
    game.state = 'title';
    return true;
  }
  if (name === 'complete') {
    game.startLevel(0);
    game.found = new Set(game.scene().diffs.map((d) => d.id));
    game.finishLevel();
    return true;
  }
  if (name === 'win') {
    game.state = 'win';
    game.totalScore = 2450;
    game.totalTime = 312;
    return true;
  }
  if (name === 'hard') {
    // Scene 3 mid-game: 4 found, 6 unfound.
    game.startLevel(2);
    const ids = game.scene().diffs.slice(0, 4).map((d) => d.id);
    game.found = new Set(ids);
    game.timeLeft = 118;
    game.message = 'Four found — six still hiding!';
    return true;
  }
  return false;
}
