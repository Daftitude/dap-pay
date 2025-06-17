

// js/score.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Switch Player Button ref ---
  const switchPlayerBtn = document.getElementById('switchPlayer');
  // --- Element refs ---
  const playerNameEls = {
    1: document.getElementById('player1Name'),
    2: document.getElementById('player2Name'),
  };
  const skillSelects = {
    1: document.getElementById('skill1'),
    2: document.getElementById('skill2'),
  };
  const pointsNeededEls = {
    1: document.getElementById('pointsNeeded1'),
    2: document.getElementById('pointsNeeded2'),
  };
  const counterFields = {
    innings: document.getElementById('inningsCount'),
    deadBalls: document.getElementById('deadBallCount'),
    nineOTS: document.getElementById('nineOTSCount'),
    BR: document.getElementById('brCount'),
    defense: document.getElementById('defenseCount'),
  };
  const counterButtons = {
    innings: {
      dec: document.getElementById('inningsDec'),
      inc: document.getElementById('inningsInc'),
    },
    deadBalls: {
      dec: document.getElementById('deadBallDec'),
      inc: document.getElementById('deadBallInc'),
    },
    nineOTS: {
      dec: document.getElementById('nineOTSDec'),
      inc: document.getElementById('nineOTSInc'),
    },
    BR: {
      dec: document.getElementById('brDec'),
      inc: document.getElementById('brInc'),
    },
    defense: {
      dec: document.getElementById('defenseDec'),
      inc: document.getElementById('defenseInc'),
    },
  };
  const rackNumberEl = document.getElementById('rackNumber');
  const prevRackBtn = document.getElementById('prevRack');
  const nextRackBtn = document.getElementById('nextRack');
  const leftButtons = Array.from(document.querySelectorAll('.left-rack .ball-btn'));
  const rightButtons = Array.from(document.querySelectorAll('.right-rack .ball-btn'));
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');

  // --- State ---
  let rack = 1;
  let currentPlayer = 1;
  let scores = {1: 0, 2: 0};
  let history = [];
  let lastScoredPlayer = null;

  // skill→points mapping
  const skillMap = {1:14,2:19,3:25,4:31,5:38,6:46,7:55,8:65,9:75};

  // Breakpoint columns matching thead second row
  const breakpoints = [1,5,10,14,19,25,31,35,38,46,50,55,60,65,70,75];
  const scoreTable = document.querySelector('.scoresheet-table');

  // When any input/select in the scoresheet-table changes, recalc total points per player
  scoreTable.querySelectorAll('tbody input, tbody select').forEach(input => {
    input.addEventListener('input', () => {
      const cols = breakpoints.length;
      [1,2].forEach((playerRowIndex) => {
        const startRow = playerRowIndex === 1 ? 0 : 2;
        let total = 0;
        for (let c = 0; c < cols; c++) {
          const cell = scoreTable.querySelectorAll('tbody tr')[startRow]
            .querySelectorAll('td')[4 + c];
          const val = parseInt(cell.querySelector('input')?.value || '0', 10);
          total += isNaN(val) ? 0 : val;
        }
        // update the “Total Points” cell in that player’s row (last but two td)
        const totalCell = scoreTable.querySelectorAll('tbody tr')[startRow]
          .querySelectorAll('td')[4 + cols + 1];
        totalCell.querySelector('input').value = total;
      });
    });
  });

  // --- Helpers ---
  const updateRackDisplay = () => {
    rackNumberEl.textContent = `Rack #${rack}`;
    updateHeroScore();
    updateActiveColumn();
  };
  const updatePointsNeeded = (player) => {
    const lvl = parseInt(skillSelects[player].value,10) || 1;
    pointsNeededEls[player].textContent = skillMap[lvl] || 0;
  };
  const pushHistory = (entry) => history.push(Object.assign({}, entry));
  const clamp = (n) => Math.max(0, n);
  // update hero score display
  function updateHeroScore() {
    document.getElementById('heroScore1').textContent = scores[1];
    document.getElementById('heroScore2').textContent = scores[2];
  }

  // Highlight the active rack column in the scoresheet table
  function updateActiveColumn() {
    // compute column index (offset by header columns)
    const colIndex = breakpoints.indexOf(rack);
    if (colIndex === -1) return;
    const table = scoreTable;
    // clear previous
    table.querySelectorAll('th.active, td.active').forEach(el => el.classList.remove('active'));
    // header row: skip first 4 cols, then select the matching th
    const headerThs = Array.from(table.querySelectorAll('thead tr:nth-child(2) th')).slice(4, 4 + breakpoints.length);
    const headerCell = headerThs[colIndex];
    if (headerCell) headerCell.classList.add('active');
    // body cells: for each row, find the corresponding td
    table.querySelectorAll('tbody tr').forEach(row => {
      const tds = row.querySelectorAll('td');
      // skip first 4 tds
      const bodyCell = tds[4 + colIndex];
      if (bodyCell) bodyCell.classList.add('active');
    });
  }

  // --- Initialize editable names ---
  // already contenteditable

  // --- Skill selectors ---
  [1,2].forEach(p => {
    updatePointsNeeded(p);
    skillSelects[p].addEventListener('change', () => {
      updatePointsNeeded(p);
      pushHistory({type:'skill',player:p});
    });
  });

  // --- Counter buttons ---
  for (let key in counterFields) {
    const dec = counterButtons[key].dec;
    const inc = counterButtons[key].inc;
    const el  = counterFields[key];
    dec.addEventListener('click', () => {
      const prev = parseInt(el.textContent,10) || 0;
      const next = clamp(prev - 1);
      el.textContent = next;
      pushHistory({type:'counter',counter:key,prev});
    });
    inc.addEventListener('click', () => {
      const prev = parseInt(el.textContent,10) || 0;
      const next = prev + 1;
      el.textContent = next;
      pushHistory({type:'counter',counter:key,prev});
    });
  }

  // --- Rack controls ---
  prevRackBtn.addEventListener('click', () => {
    if (rack > 1) {
      pushHistory({type:'rack',prev:rack});
      rack--;
      updateRackDisplay();
      updateActiveColumn();
    }
  });
  nextRackBtn.addEventListener('click', () => {
    pushHistory({type:'rack',prev:rack});
    rack++;
    updateRackDisplay();
    updateActiveColumn();
  });
  updateRackDisplay();

  // --- Left rack scoring for Player 1 ---
  leftButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const ballNumber = parseInt(btn.dataset.ball, 10);
      btn.disabled = true; btn.classList.add('disabled');
      // also disable counterpart
      document.querySelector(`.right-rack [data-ball="${ballNumber}"]`).disabled = true;
      document.querySelector(`.right-rack [data-ball="${ballNumber}"]`).classList.add('disabled');
      // award point(s)
      const points = ballNumber === 9 ? 2 : 1;
      scores[1] += points;
      updateHeroScore();
      pushHistory({ type: 'ball', player: 1, ballBtn: btn });
    });
  });

  // --- Right rack scoring for Player 2 ---
  rightButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const ballNumber = parseInt(btn.dataset.ball, 10);
      btn.disabled = true; btn.classList.add('disabled');
      // also disable counterpart
      document.querySelector(`.left-rack [data-ball="${ballNumber}"]`).disabled = true;
      document.querySelector(`.left-rack [data-ball="${ballNumber}"]`).classList.add('disabled');
      // award point(s)
      const points = ballNumber === 9 ? 2 : 1;
      scores[2] += points;
      updateHeroScore();
      pushHistory({ type: 'ball', player: 2, ballBtn: btn });
    });
  });

  // --- Manual player switch ---
  switchPlayerBtn.addEventListener('click', () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    // Optionally highlight the active player panel
    document.body.dataset.activePlayer = currentPlayer;
    pushHistory({ type: 'switch', newPlayer: currentPlayer });
  });

  // --- Undo ---
  undoBtn.addEventListener('click', () => {
    const last = history.pop();
    if (!last) return;
    switch (last.type) {
      case 'skill':
        // revert skill selection
        break;
      case 'counter':
        counterFields[last.counter].textContent = last.prev;
        break;
      case 'rack':
        rack = last.prev;
        updateRackDisplay();
        break;
      case 'ball':
        scores[last.player] -= 1;
        updateHeroScore();
        last.ballBtn.disabled = false;
        last.ballBtn.classList.remove('disabled');
        break;
    }
  });

  // --- Reset ---
  resetBtn.addEventListener('click', () => {
    // clear state
    rack = 1; scores = {1:0,2:0}; history = [];
    lastScoredPlayer = null;
    updateRackDisplay();
    [1,2].forEach(p => { skillSelects[p].value = 4; updatePointsNeeded(p); });
    for (let key in counterFields) counterFields[key].textContent = '0';
    updateHeroScore();
  });

  // --- Initialize hero score on load ---
  updateHeroScore();
});