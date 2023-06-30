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

  let x = midpoint,
    y = midpoint;

  function setPosition(newX: number, newY: number) {
    const xOutOfBounds = newX < 0 || newX >= mazeSize;
    const yOutOfBounds = newY < 0 || newY >= mazeSize;
    const notRoom = maze[newX]?.[newY] === undefined;

    if (xOutOfBounds || yOutOfBounds || notRoom) {
      return;
    }

    const className = 'has-player';

    function getCell(xPos: number, yPos: number): HTMLElement {
      return (
        mazeElement
          // Offset by 1 as 'nth-of-type' is 1-based while the arrays are 0-based.
          .querySelector(`.cell:nth-of-type(${yPos * mazeSize + xPos + 1})`)
      );
    }

    getCell(x, y).classList.remove(className);

    getCell((x = newX), (y = newY)).classList.add(className);
  }

  setPosition(x, y);

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        setPosition(x, y - 1);
        break;
      case 'ArrowRight':
        setPosition(x + 1, y);
        break;
      case 'ArrowDown':
        setPosition(x, y + 1);
        break;
      case 'ArrowLeft':
        setPosition(x - 1, y);
        break;
    }
  });

  document.body.appendChild(mazeElement);
});
