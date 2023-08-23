import styles from './index.module.css';

import ICell from './models/cell.interface';
import Direction from './models/direction.enum';
import RoomData from './rooms/room-data';
import RoomUI from './rooms/room-ui';

const player = Symbol('Player the user controls.');

class MazeUI extends RoomUI {
  public drawCell(
    cell: ICell,
    cellSize: number,
    offset?: [number, number]
  ): HTMLElement {
    const element = super.drawCell(cell, cellSize, offset);

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
    starting: [midpoint, midpoint],
  });

  room.place(player, room.start());

  const roomUI = new MazeUI();

  const roomElement = roomUI.draw(room);

  document.addEventListener('keydown', (event) => {
    let direction: Direction;

    switch (event.key) {
      case 'ArrowUp':
        direction = Direction.TOP;
        break;
      case 'ArrowRight':
        direction = Direction.RIGHT;
        break;
      case 'ArrowDown':
        direction = Direction.BOTTOM;
        break;
      case 'ArrowLeft':
        direction = Direction.LEFT;
        break;
    }
    try {
      const cells = room.move(player, direction);

      roomUI.redraw(cells);
    } catch {}
  });

  document.body.appendChild(roomElement);
});
