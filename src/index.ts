import styles from './index.module.css';

import ICell from './models/cell.interface';
import Position from './models/position.interface';
import RoomData from './rooms/room-data';
import RoomUI from './rooms/room-ui';

const player = Symbol('Player the user controls.');

class MazeUI extends RoomUI {
  public drawCell(cell: ICell): HTMLElement {
    const element = super.drawCell(cell);

    const [x, y] = cell.position;
    element.textContent = `${y}, ${x}`;

    if (cell.objects?.includes(player)) {
      element.classList.add(styles['has-player']);
    } else {
      element.classList.remove(styles['has-player']);
    }

    return element;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const mazeSize = Number(
    getComputedStyle(document.documentElement).getPropertyValue('--maze-size')
  );

  const midpoint = Math.floor(mazeSize / 2);

  const room = new RoomData({
    width: mazeSize,
    height: mazeSize,
  });

  let playerPosition: Position = [midpoint, midpoint];

  room.place(player, playerPosition);

  const roomUI = new MazeUI();

  const roomElement = roomUI.draw(room, playerPosition);

  document.addEventListener('keydown', (event) => {
    const newPosition: Position = [...playerPosition];

    switch (event.key) {
      case 'ArrowUp':
        newPosition[1] -= 1;
        break;
      case 'ArrowRight':
        newPosition[0] += 1;
        break;
      case 'ArrowDown':
        newPosition[1] += 1;
        break;
      case 'ArrowLeft':
        newPosition[0] -= 1;
        break;
    }
    try {
      room.place(player, newPosition);

      playerPosition = newPosition;

      roomUI.draw(room, playerPosition);
    } catch {}
  });

  document.body.appendChild(roomElement);
});
