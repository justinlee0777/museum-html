import styles from './index.module.css';

import { createKeyListener } from '@justinlee0777/components/utils/create-key-listener';

import ICell from '../../src/models/cell.interface';
import Position from '../../src/models/position.interface';
import RoomData from '../../src/data/room.data';
import HTMLRoom from '../../src/visualizations/html/room.html';
import Direction from '../../src/models/direction.enum';

const player = Symbol('Player the user controls.');

class MazeUI extends HTMLRoom {
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

  function changePlayerPosition(change: Position): () => void {
    return () => {
      const newPosition = playerPosition.map(
        (axis, i) => (axis += change[i])
      ) as Position;

      try {
        room.place(player, newPosition);

        playerPosition = newPosition;

        roomUI.draw(room, playerPosition);
      } catch {}
    };
  }

  roomUI.addNavigation({
    [Direction.TOP]: changePlayerPosition([0, -1]),
    [Direction.RIGHT]: changePlayerPosition([1, 0]),
    [Direction.BOTTOM]: changePlayerPosition([0, 1]),
    [Direction.LEFT]: changePlayerPosition([-1, 0]),
  });

  document.body.appendChild(roomElement);
});
