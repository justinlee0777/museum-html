import './index.css';

import Room from './room.interface';

window.addEventListener('DOMContentLoaded', () => {
  const mazeSize = Number(
    getComputedStyle(document.documentElement).getPropertyValue('--maze-size')
  );

  const maze: Array<Array<Room | undefined>> = Array(mazeSize)
    .fill(undefined)
    .map(() => Array(mazeSize).fill(undefined));

  const midpoint = (mazeSize - 1) / 2;
  for (let i = 0; i < mazeSize; i++) {
    const offset = Math.abs(midpoint - i);

    for (let j = offset; j < mazeSize - offset; j++) {
      maze[i][j] = {};
    }
  }

  const mazeElement = document.createElement('div');
  mazeElement.className = 'maze';

  for (let i = 0; i < mazeSize; i++) {
    for (let j = 0; j < mazeSize; j++) {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');

      if (maze[i][j]) {
        cellElement.classList.add('room');
      }

      mazeElement.appendChild(cellElement);
    }
  }

  document.body.appendChild(mazeElement);
});
